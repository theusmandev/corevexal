/**
 * sanitize-blog-html.ts
 *
 * Client-side HTML sanitization for the "View HTML" editor feature.
 * Uses `sanitize-html` v2 with a strict whitelist matching exactly the
 * node types the BlogEditor and BlogRenderer support.
 *
 * Why sanitize-html over isomorphic-dompurify?
 *   - sanitize-html is a pure-JS implementation with no DOM dependency;
 *     it works identically in browser, Node.js, and Edge runtimes.
 *   - Its explicit allowlist API is easier to audit than DOMPurify's
 *     configuration for server-side use.
 *   - It strips disallowed tags and attributes by default (no opt-in
 *     required), making it conservative by design.
 *
 * SECURITY GUARANTEES:
 *   - All tags NOT in ALLOWED_TAGS are stripped (text content preserved
 *     for inline tags; entire element removed for block tags where
 *     disallowedTagsMode = 'discard').
 *   - All attributes NOT in ALLOWED_ATTRS are removed.
 *   - on* event handlers are never allowed.
 *   - style="" attributes are never allowed.
 *   - <script>, <iframe>, <object>, <embed> are explicitly denied.
 *   - Links are restricted to http/https/# protocols.
 *   - Image src must be http/https only.
 */

import sanitizeHtml from "sanitize-html";

// ── Allowed tag/attribute whitelist ──────────────────────────────────────

const ALLOWED_TAGS = [
  // Block elements
  "h2",
  "h3",
  "p",
  "ul",
  "ol",
  "li",
  "blockquote",
  "hr",
  // Inline marks
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  // Media / links
  "a",
  "img",
  // Structural (needed by sanitize-html for inline nesting)
  "br",
];

const ALLOWED_ATTRS: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "target", "rel"],
  img: ["src", "alt"],
  // Text-align is stored as a TipTap attribute — when serialised to HTML by
  // TipTap it becomes style="text-align:..." on block elements. We do NOT
  // allow generic style attributes; instead, we strip them and rely on
  // TipTap's JSON representation (textAlign attribute on the node) which is
  // what actually gets persisted. The HTML → JSON parse step re-reads the
  // structural markup, and alignment is restored from TipTap's own
  // parseHTML rules on each extension.
};

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: ALLOWED_ATTRS,
  disallowedTagsMode: "discard", // strip entire tag + children for denied block tags
  // Explicitly deny unsafe tags (defence in depth)
  exclusiveFilter: (frame) => {
    const tag = frame.tag.toLowerCase();
    const EXPLICITLY_DENIED = ["script", "iframe", "object", "embed", "style", "form"];
    return EXPLICITLY_DENIED.includes(tag);
  },
  allowedSchemes: ["http", "https", "#"],
  allowedSchemesByTag: {
    a: ["http", "https", "#"],
    img: ["http", "https"],
  },
  allowedSchemesAppliedToAttributes: ["href", "src"],
  // Enforce noopener on external links
  transformTags: {
    a: (tagName, attribs) => {
      const href = attribs["href"] ?? "";
      const isExternal = href.startsWith("http");
      return {
        tagName,
        attribs: {
          href,
          ...(attribs["target"] ? { target: attribs["target"] } : {}),
          rel: isExternal ? "noopener noreferrer" : "",
        },
      };
    },
  },
};

export interface SanitizeResult {
  html: string;
  /** True if any content was removed during sanitization. */
  wasModified: boolean;
}

/**
 * Sanitize raw HTML from the "View HTML" textarea before it is parsed back
 * into TipTap's JSON document state.
 *
 * @param rawHtml - Unvalidated HTML from the admin's textarea.
 * @returns `{ html, wasModified }` — always returns safe HTML.
 */
export function sanitizeBlogHtml(rawHtml: string): SanitizeResult {
  const clean = sanitizeHtml(rawHtml, SANITIZE_OPTIONS);

  // Detect modification by comparing normalised whitespace
  const wasModified = clean.replace(/\s+/g, " ").trim() !== rawHtml.replace(/\s+/g, " ").trim();

  return { html: clean, wasModified };
}
