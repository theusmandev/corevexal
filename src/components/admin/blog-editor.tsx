"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
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
} from "lucide-react";
import { useEffect, useState, useRef } from "react";

// Helper for toolbar buttons
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

export function BlogEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [activeModal, setActiveModal] = useState<"link" | "image" | null>(null);

  // Link Modal State
  const [linkUrl, setLinkUrl] = useState("");
  const [linkNewTab, setLinkNewTab] = useState(false);

  // Image Modal State
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] }, // Only H2 and H3
        codeBlock: false, // Disabled
        strike: false, // Disabled
        horizontalRule: false, // Disabled
        code: false, // Disabled
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          // target handled by editor attributes now
          rel: "noopener noreferrer",
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: false, // No uploads/paste via base64, external URL only
      }),
    ],
    content: value ? JSON.parse(value) : { type: "doc", content: [{ type: "paragraph" }] },
    editorProps: {
      attributes: {
        className: "min-h-[300px] p-4 focus:outline-none prose max-w-none dark:prose-invert",
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
    } catch (e) {
      alert("Invalid URL");
    }
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setActiveModal(null);
  };

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

  return (
    <div className="border border-input rounded-md overflow-hidden bg-background">
      <div className="border-b border-input p-2 flex flex-wrap gap-1 bg-surface relative">
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

        <div className="w-px h-6 bg-border mx-1 self-center" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="size-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1 self-center" />

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

        <div className="w-px h-6 bg-border mx-1 self-center" />

        <ToolbarButton onClick={openLinkModal} isActive={editor.isActive("link")} title="Link">
          <LinkIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={openImageModal} title="Insert Image by URL">
          <ImageIcon className="size-4" />
        </ToolbarButton>

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
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
