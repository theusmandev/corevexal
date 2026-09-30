"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { Markdown } from "tiptap-markdown";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { generateHTML, generateJSON } from "@tiptap/html";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Check,
  X,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Undo2,
  Redo2,
  Eraser,
  Video,
  Code2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { VideoEmbedExtension, parseVideoUrl } from "./video-embed-extension";
import { sanitizeBlogHtml } from "./sanitize-blog-html";

// ── Editor extension list (single source of truth shared with generateJSON)
// This array is also used in the "View HTML" → JSON parse step so that the
// same set of extensions is applied on both sides.
function buildExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] }, // H1 is reserved for the post title
      codeBlock: false, // not in scope
      code: false, // not in scope
      // Enable these (previously disabled):
      strike: {}, // re-enable — was `false`
      horizontalRule: {}, // re-enable — was `false`
      // StarterKit v3 includes underline and undoRedo by default
    }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        rel: "noopener noreferrer",
      },
    }),
    Image.configure({
      inline: true,
      allowBase64: false,
    }).extend({
      addAttributes() {
        return {
          ...this.parent?.(),
          width: { default: "100%" },
        };
      },
    }),
    Markdown.configure({
      html: false,
      transformPastedText: true,
      transformCopiedText: false,
    }),
    VideoEmbedExtension,
  ];
}

// ── Toolbar button ────────────────────────────────────────────────────────

const ToolbarButton = ({
  onClick,
  isActive = false,
  disabled = false,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-surface hover:text-foreground"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-6 bg-border mx-1 self-center" />;

// ── Modal types ───────────────────────────────────────────────────────────

type ActiveModal = "link" | "image" | "video" | "viewHtml" | null;

// ── BlogEditor ────────────────────────────────────────────────────────────

export function BlogEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  // Link Modal
  const [linkUrl, setLinkUrl] = useState("");
  const [linkNewTab, setLinkNewTab] = useState(false);

  // Image Modal
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");

  // Video Modal
  const [videoUrl, setVideoUrl] = useState("");
  const [videoError, setVideoError] = useState<string | null>(null);

  // View HTML Modal
  const [htmlText, setHtmlText] = useState("");
  const [htmlSanitizeNotice, setHtmlSanitizeNotice] = useState<string | null>(null);

  const editor = useEditor({
    extensions: buildExtensions(),
    content: value ? JSON.parse(value) : { type: "doc", content: [{ type: "paragraph" }] },
    editorProps: {
      attributes: {
        className: "min-h-[300px] p-6 focus:outline-none prose max-w-none dark:prose-invert",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()));
    },
  });

  // Rehydrate if initial value is loaded asynchronously
  useEffect(() => {
    if (
      editor &&
      value &&
      editor.getJSON()?.content?.length === 1 &&
      editor.getJSON()?.content?.[0]?.content === undefined
    ) {
      // Intentionally left blank: Form relies on TipTap's initial content rehydration.
    }
  }, [editor, value]);

  if (!editor) {
    return <div className="min-h-[300px] border border-input bg-background animate-pulse" />;
  }

  // ── Link handlers ───────────────────────────────────────────────────────

  const openLinkModal = () => {
    const currentUrl = editor.getAttributes("link")["href"] as string | undefined;
    const currentTarget = editor.getAttributes("link")["target"] as string | undefined;
    setLinkUrl(currentUrl || "");
    setLinkNewTab(currentTarget === "_blank");
    setActiveModal("link");
  };

  const submitLink = () => {
    if (!linkUrl) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setActiveModal(null);
      return;
    }
    try {
      new URL(
        linkUrl.startsWith("http") || linkUrl.startsWith("/") || linkUrl.startsWith("#")
          ? linkUrl
          : `https://${linkUrl}`,
      );
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl, target: linkNewTab ? "_blank" : null })
        .run();
      setActiveModal(null);
    } catch {
      alert("Invalid URL");
    }
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setActiveModal(null);
  };

  // ── Image handlers ──────────────────────────────────────────────────────

  const openImageModal = () => {
    setImageUrl("");
    setImageAlt("");
    setActiveModal("image");
  };

  const submitImage = () => {
    if (!imageUrl) return;
    if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
      alert("Please provide a valid full URL starting with http:// or https://");
      return;
    }
    editor.chain().focus().setImage({ src: imageUrl, alt: imageAlt }).run();
    setActiveModal(null);
  };

  // ── Video handlers ──────────────────────────────────────────────────────

  const openVideoModal = () => {
    setVideoUrl("");
    setVideoError(null);
    setActiveModal("video");
  };

  const submitVideo = () => {
    setVideoError(null);
    if (!videoUrl.trim()) {
      setVideoError("Please enter a URL.");
      return;
    }
    const parsed = parseVideoUrl(videoUrl.trim());
    if (!parsed) {
      setVideoError(
        "Only YouTube (youtube.com, youtu.be) and Vimeo (vimeo.com) URLs are supported. " +
          "Please check the URL and try again.",
      );
      return;
    }
    editor.chain().focus().setVideoEmbed({ src: parsed.embedUrl, provider: parsed.provider }).run();
    setActiveModal(null);
  };

  // ── View HTML handlers ──────────────────────────────────────────────────

  const openViewHtml = () => {
    // Generate HTML from the current TipTap JSON state
    const html = generateHTML(editor.getJSON(), buildExtensions());
    setHtmlText(html);
    setHtmlSanitizeNotice(null);
    setActiveModal("viewHtml");
  };

  const applyHtml = () => {
    // 1. Sanitize the raw HTML — strips script, iframe, on* attrs, etc.
    const { html: cleanHtml, wasModified } = sanitizeBlogHtml(htmlText);

    // 2. Parse the clean HTML back into TipTap's JSON document
    //    (uses the same extension list → same parseHTML rules)
    const doc = generateJSON(cleanHtml, buildExtensions());

    // 3. Replace editor content with the sanitized document
    editor.commands.setContent(doc, { emitUpdate: true });

    // 4. Show a notice if anything was stripped
    if (wasModified) {
      setHtmlSanitizeNotice(
        "Some unsupported HTML was removed for security (e.g. <script>, <iframe>, on* attributes).",
      );
    } else {
      setActiveModal(null);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="border border-input rounded-md overflow-hidden bg-background">
      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="border-b border-input p-2 flex flex-wrap gap-1 bg-surface relative">
        {/* History (Undo / Redo) */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="size-4" />
        </ToolbarButton>

        <Divider />

        {/* Heading levels */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          isActive={editor.isActive("paragraph")}
          title="Paragraph"
        >
          <span className="font-serif px-1 font-bold">P</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="size-4" />
        </ToolbarButton>

        <Divider />

        {/* Inline marks */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold (Ctrl+B)"
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic (Ctrl+I)"
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough className="size-4" />
        </ToolbarButton>

        <Divider />

        {/* Text alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeft className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenter className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <AlignRight className="size-4" />
        </ToolbarButton>

        <Divider />

        {/* Block elements */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Ordered List"
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule / Divider"
        >
          <Minus className="size-4" />
        </ToolbarButton>

        <Divider />

        {/* Media & links */}
        <ToolbarButton onClick={openLinkModal} isActive={editor.isActive("link")} title="Link">
          <LinkIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={openImageModal} title="Insert Image by URL">
          <ImageIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={openVideoModal} title="Embed YouTube / Vimeo Video">
          <Video className="size-4" />
        </ToolbarButton>

        <Divider />

        {/* Utilities */}
        <ToolbarButton
          onClick={() => {
            editor.chain().focus().unsetAllMarks().clearNodes().run();
          }}
          title="Clear Formatting"
        >
          <Eraser className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={openViewHtml} title="View / Edit HTML">
          <Code2 className="size-4" />
        </ToolbarButton>

        {/* ── Link Modal ────────────────────────────────────────────── */}
        {activeModal === "link" && (
          <div className="absolute top-full left-2 mt-2 p-4 bg-surface border border-border rounded-md shadow-md z-10 w-72 space-y-4">
            <h4 className="text-sm font-semibold border-b border-border pb-1">Insert Link</h4>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">URL</label>
                <input
                  type="url"
                  autoFocus
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full h-8 px-2 text-sm border border-input rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  onKeyDown={(e) => e.key === "Enter" && submitLink()}
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={linkNewTab}
                  onChange={(e) => setLinkNewTab(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                Open in new tab
              </label>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-border">
              {editor.isActive("link") && (
                <button
                  type="button"
                  onClick={removeLink}
                  className="mr-auto text-xs text-destructive hover:underline flex items-center gap-1"
                >
                  <Unlink className="size-3" /> Remove
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3 py-1 text-xs font-medium border border-input rounded hover:bg-background"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitLink}
                className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded hover:bg-primary-hover flex items-center gap-1"
              >
                <Check className="size-3" /> Apply
              </button>
            </div>
          </div>
        )}

        {/* ── Image Modal ───────────────────────────────────────────── */}
        {activeModal === "image" && (
          <div className="absolute top-full left-2 mt-2 p-4 bg-surface border border-border rounded-md shadow-md z-10 w-80 space-y-4">
            <h4 className="text-sm font-semibold border-b border-border pb-1">Insert Image</h4>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Image URL (http/https)
                </label>
                <input
                  type="url"
                  autoFocus
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full h-8 px-2 text-sm border border-input rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  onKeyDown={(e) => e.key === "Enter" && submitImage()}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Alt Text (SEO/Accessibility)
                </label>
                <input
                  type="text"
                  placeholder="Description of image..."
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="w-full h-8 px-2 text-sm border border-input rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  onKeyDown={(e) => e.key === "Enter" && submitImage()}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3 py-1 text-xs font-medium border border-input rounded hover:bg-background"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitImage}
                className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded hover:bg-primary-hover flex items-center gap-1"
              >
                <Check className="size-3" /> Insert
              </button>
            </div>
          </div>
        )}

        {/* ── Video Modal ───────────────────────────────────────────── */}
        {activeModal === "video" && (
          <div className="absolute top-full left-2 mt-2 p-4 bg-surface border border-border rounded-md shadow-md z-10 w-96 space-y-4">
            <h4 className="text-sm font-semibold border-b border-border pb-1">
              Embed YouTube / Vimeo Video
            </h4>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Video URL (YouTube or Vimeo only)
                </label>
                <input
                  type="url"
                  autoFocus
                  placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    setVideoError(null);
                  }}
                  className={`w-full h-8 px-2 text-sm border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary ${
                    videoError ? "border-destructive" : "border-input"
                  }`}
                  onKeyDown={(e) => e.key === "Enter" && submitVideo()}
                />
                {videoError && <p className="text-xs text-destructive mt-1">{videoError}</p>}
              </div>
              <p className="text-xs text-muted-foreground">
                Supported: youtube.com, youtu.be, vimeo.com — all other domains are rejected.
              </p>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3 py-1 text-xs font-medium border border-input rounded hover:bg-background"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitVideo}
                className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded hover:bg-primary-hover flex items-center gap-1"
              >
                <Check className="size-3" /> Embed
              </button>
            </div>
          </div>
        )}

        {/* ── View HTML Modal ───────────────────────────────────────── */}
        {activeModal === "viewHtml" && (
          <div className="absolute top-full left-2 mt-2 p-4 bg-surface border border-border rounded-md shadow-md z-20 w-[calc(100vw-4rem)] max-w-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-1">
              <h4 className="text-sm font-semibold">View / Edit HTML</h4>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-muted-foreground hover:text-foreground"
                title="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            {htmlSanitizeNotice && (
              <div className="rounded-md border border-amber-500 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                ⚠ {htmlSanitizeNotice}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                HTML Source (editable — content is sanitized on Apply)
              </label>
              <textarea
                value={htmlText}
                onChange={(e) => setHtmlText(e.target.value)}
                rows={12}
                spellCheck={false}
                className="w-full px-3 py-2 text-xs font-mono border border-input rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-y"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              On Apply, HTML is sanitized — &lt;script&gt;, &lt;iframe&gt;, on* attributes and
              disallowed tags are automatically stripped.
            </p>

            <div className="flex gap-2 justify-end pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setHtmlSanitizeNotice(null);
                  setActiveModal(null);
                }}
                className="px-3 py-1 text-xs font-medium border border-input rounded hover:bg-background"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyHtml}
                className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded hover:bg-primary-hover flex items-center gap-1"
              >
                <Check className="size-3" /> Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {editor && (
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor }) => editor.isActive("image") || editor.isActive("videoEmbed")}
        >
          <div className="flex bg-surface border border-border shadow-md rounded-md overflow-hidden p-1 gap-1">
            {["25%", "50%", "75%", "100%"].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => {
                  if (editor.isActive("image")) {
                    editor.chain().focus().updateAttributes("image", { width: w }).run();
                  } else if (editor.isActive("videoEmbed")) {
                    editor.chain().focus().updateAttributes("videoEmbed", { width: w }).run();
                  }
                }}
                className={`px-2 py-1 text-xs font-medium rounded ${
                  editor.getAttributes("image")?.["width"] === w || editor.getAttributes("videoEmbed")?.["width"] === w
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </BubbleMenu>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
