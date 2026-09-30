/**
 * VideoEmbed — a custom TipTap node extension that restricts embeds to
 * YouTube (youtube.com / youtu.be) and Vimeo (vimeo.com) only.
 *
 * The node stores a canonical embed URL and renders as a sandboxed iframe
 * wrapped in a 16:9 aspect-ratio div. Raw <iframe> HTML in "View HTML" is
 * intentionally stripped by sanitize-html; only content inserted through
 * this node type reaches the saved document.
 */

import { Node, mergeAttributes } from "@tiptap/core";

// ── Domain validation ──────────────────────────────────────────────────────
/** Regex patterns for accepted host names (after URL parsing). */
const ALLOWED_HOSTS = /^(www\.)?(youtube\.com|youtu\.be|vimeo\.com)$/i;

export type VideoProvider = "youtube" | "vimeo";

export interface VideoEmbedResult {
  embedUrl: string;
  provider: VideoProvider;
}

/**
 * Validates that `rawUrl` points to YouTube or Vimeo and converts it to
 * a canonical embed URL.
 *
 * Returns `null` if the URL is invalid or not from an allowed domain.
 */
export function parseVideoUrl(rawUrl: string): VideoEmbedResult | null {
  let url: URL;
  try {
    // Accept bare youtu.be/... without protocol
    url = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  // ── YouTube ──────────────────────────────────────────────────────────────
  if (host === "youtube.com") {
    // Standard watch URL: youtube.com/watch?v=ID
    const videoId = url.searchParams.get("v");
    if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return {
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
        provider: "youtube",
      };
    }
    // Embed URL already: youtube.com/embed/ID
    const embedMatch = url.pathname.match(/^\/embed\/([a-zA-Z0-9_-]{11})$/);
    if (embedMatch) {
      return {
        embedUrl: `https://www.youtube-nocookie.com/embed/${embedMatch[1]}`,
        provider: "youtube",
      };
    }
    return null;
  }

  if (host === "youtu.be") {
    // Short URL: youtu.be/ID
    const videoId = url.pathname.slice(1);
    if (/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return {
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
        provider: "youtube",
      };
    }
    return null;
  }

  // ── Vimeo ─────────────────────────────────────────────────────────────────
  if (host === "vimeo.com") {
    // Standard: vimeo.com/12345678 or vimeo.com/video/12345678
    const vimeoMatch = url.pathname.match(/\/(?:video\/)?(\d+)/);
    if (vimeoMatch) {
      return {
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
        provider: "vimeo",
      };
    }
    return null;
  }

  // Reject everything else
  return null;
}

/** Quick boolean helper for callers that don't need the embed URL. */
export function isAllowedVideoHost(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
    return ALLOWED_HOSTS.test(url.hostname);
  } catch {
    return false;
  }
}

// ── TipTap node definition ────────────────────────────────────────────────

export interface VideoEmbedAttributes {
  src: string;
  provider: VideoProvider;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    videoEmbed: {
      setVideoEmbed: (attrs: VideoEmbedAttributes) => ReturnType;
    };
  }
}

export const VideoEmbedExtension = Node.create({
  name: "videoEmbed",
  group: "block",
  atom: true, // not editable inline

  addAttributes() {
    return {
      src: { default: null },
      provider: { default: "youtube" },
      width: { default: "100%" },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-video-embed]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, provider, width, ...rest } = HTMLAttributes as VideoEmbedAttributes &
      Record<string, unknown>;
    
    // We need to render the width on an outer container or the data-video-embed div.
    // The previous implementation had a wrapper div with 56.25% padding-bottom.
    // We can wrap it in another div, or apply width to the same div if it doesn't break aspect ratio.
    // Actually, padding-bottom on the same div sets height based on its OWN width, which is fine.
    return [
      "div",
      mergeAttributes(rest, {
        "data-video-embed": provider,
        width: typeof width === "string" ? width : "100%",
        class: "video-embed-wrapper",
        style: `position:relative;padding-bottom:56.25%;height:0;overflow:hidden;width:${typeof width === "string" ? width : "100%"};margin:0 auto;`,
      }),
      [
        "iframe",
        {
          src,
          allowfullscreen: "true",
          loading: "lazy",
          style: "position:absolute;top:0;left:0;width:100%;height:100%;border:0;",
          // Minimal sandbox for YouTube/Vimeo — scripts are required for playback
          sandbox: "allow-scripts allow-same-origin allow-presentation allow-popups",
          allow:
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
        },
      ],
    ];
  },

  addCommands() {
    return {
      setVideoEmbed:
        (attrs: VideoEmbedAttributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs,
          });
        },
    };
  },
});
