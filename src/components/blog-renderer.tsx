import React from "react";
import Link from "next/link";

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
    <div className="prose prose-slate max-w-none dark:prose-invert">
      {contentArray.map((node: JSONNode, index: number) => (
        <BlogNode key={index} node={node} />
      ))}
    </div>
  );
}

function BlogNode({ node }: { node: JSONNode }) {
  if (!node.type) return null;

  switch (node.type) {
    case "paragraph":
      return <p>{renderChildren(node)}</p>;
    case "heading": {
      const level = node.attrs?.["level"];
      if (level === 2) return <h2>{renderChildren(node)}</h2>;
      if (level === 3) return <h3>{renderChildren(node)}</h3>;
      return <p>{renderChildren(node)}</p>; // fallback for disallowed headings
    }
    case "bulletList":
      return <ul>{renderChildren(node)}</ul>;
    case "orderedList":
      return <ol>{renderChildren(node)}</ol>;
    case "listItem":
      return <li>{renderChildren(node)}</li>;
    case "blockquote":
      return <blockquote>{renderChildren(node)}</blockquote>;
    case "image": {
      const src = node.attrs?.["src"];
      const alt = node.attrs?.["alt"] || "";
      const title = node.attrs?.["title"];
      if (!src || typeof src !== "string") return null;
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
    case "text":
      return <TextNode node={node} />;
    default:
      return null;
  }
}

function renderChildren(node: JSONNode) {
  if (!node.content || !Array.isArray(node.content)) return null;
  return node.content.map((child, index) => <BlogNode key={index} node={child} />);
}

function TextNode({ node }: { node: JSONNode }) {
  if (!node.text) return null;

  let elements: React.ReactNode = node.text;

  if (node.marks && Array.isArray(node.marks)) {
    for (const mark of node.marks) {
      if (mark.type === "bold") {
        elements = <strong>{elements}</strong>;
      } else if (mark.type === "italic") {
        elements = <em>{elements}</em>;
      } else if (mark.type === "link" && mark.attrs?.["href"]) {
        const href = mark.attrs["href"];
        const target = mark.attrs["target"];
        if (typeof href === "string") {
          if (target === "_blank") {
            elements = (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {elements}
              </a>
            );
          } else {
            if (href.startsWith("/") || href.startsWith("#")) {
              elements = <Link href={href}>{elements}</Link>;
            } else {
              elements = <a href={href}>{elements}</a>;
            }
          }
        }
      }
    }
  }

  return <>{elements}</>;
}
