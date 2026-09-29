/**
 * validate-blog-content.ts  — SERVER-SIDE TipTap JSON content validator
 *
 * Imported ONLY from server actions ("use server" files). No browser-only
 * dependencies — pure structural walk, no DOM, no TipTap runtime.
 *
 * NOTE: Does NOT import "server-only" so the Node.js test runner can import
 * it directly. The server-only boundary is enforced by the calling "use server"
 * action file (blog-posts.ts).
 *
 * PURPOSE
 * -------
 * Independent second line of defence: walks the incoming TipTap JSON and
 * strips every node/mark/attribute not in our explicit whitelist before
 * any DB write. Cannot be bypassed by callers who POST to the action directly.
 *
 * WHITELIST (mirrors BlogRenderer + BlogEditor extension list exactly)
 * ----
 * Block nodes: doc, paragraph, heading (level 2|3), bulletList, orderedList,
 *              listItem, blockquote, horizontalRule, image, videoEmbed, hardBreak
 * Inline marks: bold, italic, underline, strike, link
 * Text-align: only on paragraph + heading; only values "left"/"center"/"right"
 *
 * LIMITS
 * ------
 * MAX_DEPTH        = 12     — maximum allowed nesting level
 * MAX_NODE_COUNT   = 2000   — maximum total nodes in the tree
 * MAX_SIZE_BYTES   = 512000 — maximum serialized JSON size (500 KB)
 */

// ── Types ─────────────────────────────────────────────────────────────────

type Attrs = Record<string, unknown>;

interface TipTapMark {
  type: string;
  attrs?: Attrs;
}

interface TipTapNode {
  type: string;
  attrs?: Attrs;
  content?: TipTapNode[];
  marks?: TipTapMark[];
  text?: string;
}

interface TipTapDoc {
  type: "doc";
  content?: TipTapNode[];
}

export interface ContentValidationResult {
  /** The cleaned document, safe to write to the DB. */
  doc: TipTapDoc;
  /** True if any node/mark/attribute was removed. */
  wasModified: boolean;
}

// ── Structural limits ──────────────────────────────────────────────────────

const MAX_DEPTH = 12;
const MAX_NODE_COUNT = 2000;
const MAX_SIZE_BYTES = 512_000; // 500 KB

// ── Allowed node types and their allowed attribute keys ───────────────────

const BLOCK_NODE_ATTRS: Record<string, Set<string>> = {
  doc: new Set(),
  paragraph: new Set(["textAlign"]),
  heading: new Set(["level", "textAlign"]),
  bulletList: new Set(),
  orderedList: new Set(["start"]),
  listItem: new Set(),
  blockquote: new Set(),
  horizontalRule: new Set(),
  hardBreak: new Set(),
  image: new Set(["src", "alt", "title"]),
  videoEmbed: new Set(["src", "provider"]),
};

const ALLOWED_BLOCK_TYPES = new Set(Object.keys(BLOCK_NODE_ATTRS));

/** Marks allowed on text nodes, and which of their attributes are allowed. */
const MARK_ATTRS: Record<string, Set<string>> = {
  bold: new Set(),
  italic: new Set(),
  underline: new Set(),
  strike: new Set(),
  link: new Set(["href", "target", "rel"]),
};

const ALLOWED_MARK_TYPES = new Set(Object.keys(MARK_ATTRS));

/** Only these values are valid for the textAlign attribute. */
const ALLOWED_ALIGN_VALUES = new Set(["left", "center", "right"]);

/** Allowed URL schemes for href (link marks). */
const ALLOWED_HREF_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:"]);

// ── URL scheme validation ─────────────────────────────────────────────────

/**
 * Validates an href value using the URL API where possible.
 *
 * Allowed:
 *   - http: / https: / mailto: / tel: (URL API normalises scheme to
 *     lower-case, so mixed-case tricks like "JaVaScRiPt:" are rejected)
 *   - Relative paths starting with "/" or "#"
 *
 * Rejected (including bypass tricks):
 *   - javascript:, vbscript:, data: — including mixed-case variants
 *   - URLs with leading whitespace or control characters
 *     (e.g. " javascript:", "\x00javascript:", "java\tscript:")
 *     — we strip leading junk first, then rely on URL() to normalise/reject
 *   - Anything that doesn't parse as a URL and isn't a relative path
 */
export function isSafeHref(val: unknown): boolean {
  if (typeof val !== "string" || val.length === 0) return false;

  // Strip leading whitespace and control characters (U+0000–U+001F, U+007F).
  // An attacker may prefix with " ", "\t", "\n", "\x00" etc. to bypass naive
  // startsWith checks. After stripping, re-check.
  // eslint-disable-next-line no-control-regex
  const stripped = val.replace(/^[\s\u0000-\u001F\u007F]+/, "");

  // Relative paths are safe — they have no scheme.
  if (stripped.startsWith("/") || stripped.startsWith("#")) return true;

  // Attempt full URL parse. The URL constructor normalises the scheme to
  // lower-case, so "JaVaScRiPt:" becomes "javascript:" and is rejected.
  try {
    const parsed = new URL(stripped);
    return ALLOWED_HREF_SCHEMES.has(parsed.protocol);
  } catch {
    // URL() throws for relative URLs and malformed input. Since we already
    // handled "/" and "#" above, anything else that fails to parse is rejected.
    return false;
  }
}

/**
 * Validates an image src: only http: or https: are allowed.
 * Uses the URL API to normalise the scheme — rejects mixed-case tricks and
 * leading whitespace in the same way as isSafeHref().
 */
export function isSafeImageSrc(val: unknown): boolean {
  if (typeof val !== "string" || val.length === 0) return false;
  // eslint-disable-next-line no-control-regex
  const stripped = val.replace(/^[\s\u0000-\u001F\u007F]+/, "");
  try {
    const parsed = new URL(stripped);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// ── Video URL re-parsing ──────────────────────────────────────────────────

/**
 * Re-parses a stored videoEmbed src server-side using the same logic as the
 * client-side parseVideoUrl(), but without importing the browser component.
 *
 * Extracts the video ID from accepted canonical embed origins:
 *   https://www.youtube-nocookie.com/embed/<id>
 *   https://player.vimeo.com/video/<id>
 *
 * Rebuilds the canonical embed URL from scratch so we never pass through an
 * attacker-supplied URL verbatim. Returns null if the src doesn't match.
 *
 * NOTE: This mirrors parseVideoUrl() from video-embed-extension.ts but
 * operates on the *stored embed URL* (not the raw user-input URL), so we
 * accept only the two canonical origins that parseVideoUrl() itself produces.
 */
function reParseVideoEmbedSrc(
  src: unknown,
): { embedUrl: string; provider: "youtube" | "vimeo" } | null {
  if (typeof src !== "string" || src.length === 0) return null;

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return null;
  }

  // Normalised protocol must be https: only.
  if (url.protocol !== "https:") return null;

  // YouTube nocookie embed: https://www.youtube-nocookie.com/embed/<id>
  // Also allow standard YouTube embeds: https://www.youtube.com/embed/<id>
  if (url.hostname === "www.youtube-nocookie.com" || url.hostname === "www.youtube.com") {
    const m = url.pathname.match(/^\/embed\/([a-zA-Z0-9_-]{11})$/);
    if (m) {
      return {
        embedUrl: `https://${url.hostname}/embed/${m[1]}`,
        provider: "youtube",
      };
    }
    return null;
  }

  // Vimeo player embed: https://player.vimeo.com/video/<id>
  if (url.hostname === "player.vimeo.com") {
    const m = url.pathname.match(/^\/video\/(\d+)$/);
    if (m) {
      return {
        embedUrl: `https://player.vimeo.com/video/${m[1]}`,
        provider: "vimeo",
      };
    }
    return null;
  }

  return null;
}

/** Strip attrs object to only allowed keys, with value-level checks. */
function cleanAttrs(nodeType: string, raw: Attrs | undefined): Attrs | undefined {
  if (!raw) return undefined;
  const allowed = BLOCK_NODE_ATTRS[nodeType];
  if (!allowed || allowed.size === 0) {
    // No attrs allowed for this type — drop all raw attrs if any exist
    if (Object.keys(raw).length > 0) _modified = true;
    return undefined;
  }

  const clean: Attrs = {};

  for (const key of allowed) {
    const val = raw[key];
    if (val === undefined || val === null) continue;

    // Value-level guards
    if (key === "textAlign") {
      if (!ALLOWED_ALIGN_VALUES.has(val as string)) {
        _modified = true;
        continue; // strip invalid alignment value
      }
    }
    if (key === "level") {
      // Only allow h2 and h3
      if (val !== 2 && val !== 3) {
        _modified = true;
        continue;
      }
    }
    // src for image/videoEmbed is handled in their dedicated node branches
    // in walkNode(); this generic cleanAttrs is not called for those types.

    clean[key] = val;
  }

  // Any raw key NOT in the allowed set is stripped
  for (const key of Object.keys(raw)) {
    if (!(key in clean)) _modified = true;
  }

  return Object.keys(clean).length > 0 ? clean : undefined;
}

/** Clean a single mark; return null if the mark type is not allowed. */
function cleanMark(mark: TipTapMark): TipTapMark | null {
  if (!ALLOWED_MARK_TYPES.has(mark.type)) return null;

  const allowed = MARK_ATTRS[mark.type];
  if (!allowed || !mark.attrs || allowed.size === 0) {
    return { type: mark.type };
  }

  const cleanAttrsObj: Attrs = {};
  for (const key of allowed) {
    const val = mark.attrs[key];
    if (val === undefined || val === null) continue;

    // href: URL-API-based check that rejects javascript:, data:, vbscript:
    // and all mixed-case/whitespace bypass tricks.
    if (key === "href") {
      if (!isSafeHref(val)) {
        _modified = true;
        continue;
      }
    }
    // target must be "_blank" or absent
    if (key === "target" && val !== "_blank") {
      _modified = true;
      continue;
    }

    cleanAttrsObj[key] = val;
  }

  // Any raw attr key not in allowed is stripped
  for (const key of Object.keys(mark.attrs)) {
    if (!(key in cleanAttrsObj)) _modified = true;
  }

  // For the link mark: a link with no safe href is useless and potentially
  // confusing — drop the entire mark rather than leaving {type:"link"}.
  // The text content is preserved; only the hyperlink is removed.
  if (mark.type === "link" && !("href" in cleanAttrsObj)) {
    return null;
  }

  return Object.keys(cleanAttrsObj).length > 0
    ? { type: mark.type, attrs: cleanAttrsObj }
    : { type: mark.type };
}

// ── Core walker ───────────────────────────────────────────────────────────

let _modified = false; // flag set during walk; reset per-call
let _nodeCount = 0; // running total of nodes visited; reset per-call

function walkNode(node: TipTapNode, depth: number): TipTapNode | null {
  if (!node.type) return null;

  // ── depth guard ────────────────────────────────────────────────────────
  if (depth > MAX_DEPTH) {
    _modified = true;
    return null;
  }

  // ── node count guard ───────────────────────────────────────────────────
  _nodeCount++;
  if (_nodeCount > MAX_NODE_COUNT) {
    _modified = true;
    return null;
  }

  // ── text nodes ─────────────────────────────────────────────────────────
  if (node.type === "text") {
    if (typeof node.text !== "string") return null;

    let marks: TipTapMark[] | undefined;
    if (node.marks && node.marks.length > 0) {
      const cleaned: TipTapMark[] = [];
      for (const mark of node.marks) {
        const m = cleanMark(mark);
        if (m === null) {
          _modified = true;
        } else {
          cleaned.push(m);
        }
      }
      marks = cleaned.length > 0 ? cleaned : undefined;
    }

    return { type: "text", text: node.text, ...(marks ? { marks } : {}) };
  }

  // ── unknown block type → drop ──────────────────────────────────────────
  if (!ALLOWED_BLOCK_TYPES.has(node.type)) {
    _modified = true;
    return null;
  }

  // ── videoEmbed: re-parse src via reParseVideoEmbedSrc(); drop if invalid ─
  if (node.type === "videoEmbed") {
    const src = node.attrs?.["src"];
    const reparsed = reParseVideoEmbedSrc(src);
    if (!reparsed) {
      _modified = true;
      return null; // drop the entire node
    }
    // Rebuild the node from the re-parsed (clean) values only — never pass
    // through the raw src or provider from the input.
    return {
      type: "videoEmbed",
      attrs: { src: reparsed.embedUrl, provider: reparsed.provider },
    };
  }

  // ── image: validate src with URL-API check; drop if invalid ─────────────
  if (node.type === "image") {
    const src = node.attrs?.["src"];
    if (!isSafeImageSrc(src)) {
      _modified = true;
      return null;
    }
    const alt = typeof node.attrs?.["alt"] === "string" ? node.attrs["alt"] : "";
    const title = typeof node.attrs?.["title"] === "string" ? node.attrs["title"] : undefined;
    return {
      type: "image",
      attrs: { src, alt, ...(title !== undefined ? { title } : {}) },
    };
  }

  // ── leaf nodes (no children) ──────────────────────────────────────────
  if (node.type === "horizontalRule" || node.type === "hardBreak") {
    return { type: node.type };
  }

  // ── nodes with cleaned attrs + recursive children ─────────────────────
  const cleanedAttrs = cleanAttrs(node.type, node.attrs);

  const cleanedChildren: TipTapNode[] = [];
  if (node.content && Array.isArray(node.content)) {
    for (const child of node.content) {
      const cleaned = walkNode(child, depth + 1);
      if (cleaned !== null) cleanedChildren.push(cleaned);
    }
  }

  const result: TipTapNode = { type: node.type };
  if (cleanedAttrs && Object.keys(cleanedAttrs).length > 0) {
    result.attrs = cleanedAttrs;
  }
  if (cleanedChildren.length > 0) {
    result.content = cleanedChildren;
  }

  return result;
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Validate and sanitize a TipTap JSON document on the server.
 *
 * - Accepts the raw parsed JSON (after `JSON.parse(formData.get("content"))`).
 * - Returns a cleaned document and a `wasModified` flag.
 * - If the top-level object is not a `{ type: "doc", content: [...] }`,
 *   throws a structured error (caller should return `{ error: "..." }`).
 * - Enforces structural limits:
 *     - MAX_SIZE_BYTES (500 KB) on the serialized JSON
 *     - MAX_DEPTH (12) nesting levels
 *     - MAX_NODE_COUNT (2000) total nodes
 *
 * @throws {Error} if the root structure is not a valid TipTap document or
 *                 if any structural limit is exceeded.
 */
export function validateBlogContent(raw: unknown): ContentValidationResult {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Content must be a TipTap JSON document object.");
  }

  // ── Size limit ─────────────────────────────────────────────────────────
  // Check the serialized size of the raw input before doing any work so that
  // an attacker cannot force expensive processing by submitting a huge doc.
  const serialized = JSON.stringify(raw);
  if (serialized.length > MAX_SIZE_BYTES) {
    throw new Error(
      `Content exceeds maximum allowed size of ${MAX_SIZE_BYTES} bytes (got ${serialized.length} bytes).`,
    );
  }

  const obj = raw as Record<string, unknown>;

  if (obj["type"] !== "doc") {
    throw new Error('Content root must have type "doc".');
  }

  if (!Array.isArray(obj["content"])) {
    throw new Error('Content root must have a "content" array.');
  }

  _modified = false;
  _nodeCount = 0;

  const cleanedChildren: TipTapNode[] = [];
  for (const child of obj["content"] as TipTapNode[]) {
    const cleaned = walkNode(child, 1);
    if (cleaned !== null) cleanedChildren.push(cleaned);
  }

  const doc: TipTapDoc = {
    type: "doc",
    content: cleanedChildren,
  };

  return { doc, wasModified: _modified };
}
