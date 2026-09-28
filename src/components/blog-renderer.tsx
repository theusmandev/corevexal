import React from "react";
import Link from "next/link";
import { isSafeHref, isSafeImageSrc } from "../lib/validate-blog-content";

type JSONNode = {
  type?: string;
  attrs?: Record<string, string | number | boolean | null | undefined>;
  content?: JSONNode[];
  marks?: { type: string; attrs?: Record<string, string | number | boolean | null | undefined> }[];
  text?: string;
};

export function BlogRenderer({ content }: { content: unknown }) {
  if (
    !content ||
    typeof content !== "object" ||
    !("content" in content) ||
    !Array.isArray((content as Record<string, unknown>)["content"])
  ) {
    return null;
  }

  const contentArray = (content as Record<string, unknown>)["content"] as JSONNode[];

  return (
    <div className="prose prose-brand max-w-none">
      {contentArray.map((node: JSONNode, index: number) => (
        <BlogNode key={index} node={node} />
      ))}
    </div>
  );
}

// ── Text-align helper ─────────────────────────────────────────────────────
/**
 * TipTap TextAlign stores the alignment as a `textAlign` attribute on block
 * nodes (paragraph, heading). We map it to an inline style here so the
 * renderer honours the alignment without needing Tailwind utilities.
 */
function alignStyle(
  attrs?: Record<string, string | number | boolean | null | undefined>,
): React.CSSProperties | undefined {
  const ta = attrs?.["textAlign"];
  if (ta === "center" || ta === "right" || ta === "left") {
    return { textAlign: ta };
  }
  return undefined;
}

// ── Node renderer ─────────────────────────────────────────────────────────

function BlogNode({ node }: { node: JSONNode }) {
  if (!node.type) return null;

  switch (node.type) {
    // ── Block nodes ───────────────────────────────────────────────────────

    case "paragraph":
      return <p style={alignStyle(node.attrs)}>{renderChildren(node)}</p>;

    case "heading": {
      const level = node.attrs?.["level"];
      const style = alignStyle(node.attrs);
      if (level === 2) return <h2 style={style}>{renderChildren(node)}</h2>;
      if (level === 3) return <h3 style={style}>{renderChildren(node)}</h3>;
      // Fallback for any other heading level (e.g. old content with h1/h4
      // that shouldn't exist but may exist in legacy data)
      return <p style={style}>{renderChildren(node)}</p>;
    }

    case "bulletList":
      return <ul>{renderChildren(node)}</ul>;

    case "orderedList":
      return <ol>{renderChildren(node)}</ol>;

    case "listItem":
      return <li>{renderChildren(node)}</li>;

    case "blockquote":
      return <blockquote>{renderChildren(node)}</blockquote>;

    case "horizontalRule":
      return <hr />;

    case "image": {
      const src = node.attrs?.["src"];
      const alt = node.attrs?.["alt"] || "";
      const title = node.attrs?.["title"];
      // Renderer defence-in-depth: re-check src even if it came from the DB.
      if (!src || typeof src !== "string" || !isSafeImageSrc(src)) return null;
      return (
        <img
          src={src}
          alt={typeof alt === "string" ? alt : ""}
          title={typeof title === "string" ? title : undefined}
          className="rounded-md"
          loading="lazy"
        />
      );
    }

    case "videoEmbed": {
      const src = node.attrs?.["src"];
      if (!src || typeof src !== "string") return null;
      // Renderer defence-in-depth: only render canonical embed origins.
      // This guards against any stale DB rows that predate the validator.
      const isYT =
        src.startsWith("https://www.youtube-nocookie.com/embed/") ||
        src.startsWith("https://www.youtube.com/embed/");
      const isVimeo = src.startsWith("https://player.vimeo.com/video/");
      if (!isYT && !isVimeo) return null;
      return (
        <div
          style={{
            position: "relative",
            paddingBottom: "56.25%",
            height: 0,
            overflow: "hidden",
            marginBlock: "1.5rem",
          }}
        >
          <iframe
            src={src}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: 0,
            }}
            allowFullScreen
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            title="Embedded video"
          />
        </div>
      );
    }

    case "hardBreak":
      return <br />;

    case "text":
      return <TextNode node={node} />;

    default:
      // Unknown node type — render nothing rather than crashing.
      return null;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────

function renderChildren(node: JSONNode) {
  if (!node.content || !Array.isArray(node.content)) return null;
  return node.content.map((child, index) => <BlogNode key={index} node={child} />);
}

function TextNode({ node }: { node: JSONNode }) {
  if (!node.text) return null;

  let elements: React.ReactNode = node.text;

  if (node.marks && Array.isArray(node.marks)) {
    for (const mark of node.marks) {
      switch (mark.type) {
        case "bold":
          elements = <strong>{elements}</strong>;
          break;

        case "italic":
          elements = <em>{elements}</em>;
          break;

        case "underline":
          elements = <u>{elements}</u>;
          break;

        case "strike":
          elements = <s>{elements}</s>;
          break;

        case "link": {
          const href = mark.attrs?.["href"];
          const target = mark.attrs?.["target"];
          // Renderer defence-in-depth: re-validate href even if it came from
          // the DB, to guard against stale rows written before this fix.
          if (typeof href === "string" && isSafeHref(href)) {
            if (target === "_blank") {
              elements = (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {elements}
                </a>
              );
            } else if (href.startsWith("/") || href.startsWith("#")) {
              elements = <Link href={href}>{elements}</Link>;
            } else {
              elements = <a href={href}>{elements}</a>;
            }
          }
          // If href is missing or unsafe, render plain text — no link.
          break;
        }

        // Ignore any future unknown marks gracefully
        default:
          break;
      }
    }
  }

  return <>{elements}</>;
}
