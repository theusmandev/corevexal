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

/**
 * YouTube-nocookie embed origin (what parseVideoUrl() outputs).
 * Vimeo player origin.
 * Only these two origins are accepted in videoEmbed.src on the server.
 */
const ALLOWED_VIDEO_ORIGINS = ["https://www.youtube-nocookie.com", "https://player.vimeo.com"];

// ── Helpers ───────────────────────────────────────────────────────────────

/** Returns true if the string starts with one of the allowed video origins. */
function isAllowedVideoSrc(src: unknown): boolean {
  if (typeof src !== "string" || !src) return false;
  return ALLOWED_VIDEO_ORIGINS.some((origin) => src.startsWith(origin + "/"));
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
    if (key === "src" && nodeType === "image") {
      // image src must be http/https
      if (typeof val !== "string" || (!val.startsWith("http://") && !val.startsWith("https://"))) {
        _modified = true;
        continue;
      }
    }
    if (key === "src" && nodeType === "videoEmbed") {
      if (!isAllowedVideoSrc(val)) {
        _modified = true;
        continue;
      }
    }

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

    // href must be http/https or internal path — reject javascript:/data:/etc.
    if (key === "href") {
      if (typeof val !== "string") {
        _modified = true;
        continue;
      }
      if (
        !val.startsWith("http://") &&
        !val.startsWith("https://") &&
        !val.startsWith("/") &&
        !val.startsWith("#")
      ) {
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

  return Object.keys(cleanAttrsObj).length > 0
    ? { type: mark.type, attrs: cleanAttrsObj }
    : { type: mark.type };
}

// ── Core walker ───────────────────────────────────────────────────────────

let _modified = false; // flag set during walk; reset per-call

function walkNode(node: TipTapNode): TipTapNode | null {
  if (!node.type) return null;

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

  // ── videoEmbed: validate src; drop if invalid ──────────────────────────
  if (node.type === "videoEmbed") {
    const src = node.attrs?.["src"];
    if (!isAllowedVideoSrc(src)) {
      _modified = true;
      return null; // drop the entire node
    }
    const provider = node.attrs?.["provider"];
    const cleanedProvider = provider === "youtube" || provider === "vimeo" ? provider : "youtube";
    return {
      type: "videoEmbed",
      attrs: { src: src as string, provider: cleanedProvider },
    };
  }

  // ── image: validate src; drop if invalid ──────────────────────────────
  if (node.type === "image") {
    const src = node.attrs?.["src"];
    if (typeof src !== "string" || (!src.startsWith("http://") && !src.startsWith("https://"))) {
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
      const cleaned = walkNode(child);
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
 *
 * @throws {Error} if the root structure is not a valid TipTap document.
 */
export function validateBlogContent(raw: unknown): ContentValidationResult {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Content must be a TipTap JSON document object.");
  }

  const obj = raw as Record<string, unknown>;

  if (obj["type"] !== "doc") {
    throw new Error('Content root must have type "doc".');
  }

  if (!Array.isArray(obj["content"])) {
    throw new Error('Content root must have a "content" array.');
  }

  _modified = false;

  const cleanedChildren: TipTapNode[] = [];
  for (const child of obj["content"] as TipTapNode[]) {
    const cleaned = walkNode(child);
    if (cleaned !== null) cleanedChildren.push(cleaned);
  }

  const doc: TipTapDoc = {
    type: "doc",
    content: cleanedChildren,
  };

  return { doc, wasModified: _modified };
}
