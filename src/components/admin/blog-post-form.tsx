"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { checkBlogPostSlugAvailable } from "@/app/actions/blog-posts";
import dynamic from "next/dynamic";

const BlogEditor = dynamic(() => import("./blog-editor").then((mod) => mod.BlogEditor), {
  ssr: false,
  loading: () => <div className="min-h-[300px] border border-input bg-background animate-pulse rounded-md" />,
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 150);
}

type BlogPostFormProps = {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    category_id: string | null;
    excerpt: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content: any; // json
    featured_image_url: string | null;
    featured_image_alt: string | null;
    seo_title: string | null;
    seo_description: string | null;
    status: string;
    published_at: string | null;
  };
  categories: { id: string; name: string }[];
  action: (formData: FormData) => Promise<{ error?: string; id?: string; success?: boolean }>;
};

export function BlogPostForm({ initialData, categories, action }: BlogPostFormProps) {
  const isEditing = !!initialData;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");

  const [contentJson, setContentJson] = useState(
    initialData?.content ? JSON.stringify(initialData.content) : "",
  );

  const [featuredImageUrl, setFeaturedImageUrl] = useState(initialData?.featured_image_url ?? "");
  const [featuredImageAlt, setFeaturedImageAlt] = useState(initialData?.featured_image_alt ?? "");
  const [seoTitle, setSeoTitle] = useState(initialData?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seo_description ?? "");
  const [status, setStatus] = useState<"draft" | "published">(
    (initialData?.status as "draft" | "published") ?? "draft",
  );

  // Convert standard ISO string to datetime-local format (YYYY-MM-DDThh:mm)
  const formatForInput = (isoString?: string | null) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "";
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };
  const [publishedAt, setPublishedAt] = useState(formatForInput(initialData?.published_at));

  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-generate slug
  useEffect(() => {
    if (!slugTouched || (!isEditing && !slugTouched)) {
      setSlug(slugify(title));
    }
  }, [title, slugTouched, isEditing]);

  // Live slug uniqueness check
  useEffect(() => {
    if (!slug) return;
    setSlugError(null);
    setSlugChecking(true);
    const timer = setTimeout(async () => {
      const result = await checkBlogPostSlugAvailable(slug, initialData?.id);
      setSlugChecking(false);
      if (!result.available) {
        setSlugError(`"${slug}" is already taken by another blog post.`);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [slug, initialData?.id]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (slugError) return;

    if (!contentJson || contentJson === `{"type":"doc","content":[{"type":"paragraph"}]}`) {
      setFormError("Content cannot be empty.");
      return;
    }

    const fd = new FormData(e.currentTarget);
    fd.set("content", contentJson);

    if (publishedAt) {
      // Convert from datetime-local to ISO for server
      fd.set("published_at", new Date(publishedAt).toISOString());
    }

    setFormError(null);
    startTransition(async () => {
      const result = await action(fd);
      if (result.error) {
        setFormError(result.error);
      } else {
        toast.success(isEditing ? "Blog post updated" : "Blog post created");
        router.push("/admin/blog-posts");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {formError && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          {formError}
        </div>
      )}

      {isEditing && (
        <div className="flex justify-end">
          <a
            href={`/admin/preview/blog/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Open Live Preview
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid gap-1.5">
            <label
              htmlFor="post-title"
              className="text-xs font-bold uppercase text-muted-foreground"
            >
              Title <span aria-hidden>*</span>
            </label>
            <input
              id="post-title"
              name="title"
              type="text"
              required
              maxLength={150}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div className="grid gap-1.5">
            <label
              htmlFor="post-slug"
              className="text-xs font-bold uppercase text-muted-foreground"
            >
              Slug <span aria-hidden>*</span>
            </label>
            <input
              id="post-slug"
              name="slug"
              type="text"
              required
              maxLength={150}
              pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className={`h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none ${slugError ? "border-destructive" : "border-input"}`}
            />
            {slugChecking && (
              <p className="text-xs text-muted-foreground">Checking availability…</p>
            )}
            {slugError && <p className="text-xs text-destructive">{slugError}</p>}
            {isEditing && !slugError && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                ⚠ Changing this slug will break existing links.
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-bold uppercase text-muted-foreground">
              Content <span aria-hidden>*</span>
            </label>
            <BlogEditor value={contentJson} onChange={setContentJson} />
          </div>

          <div className="grid gap-1.5">
            <label
              htmlFor="post-excerpt"
              className="text-xs font-bold uppercase text-muted-foreground"
            >
              Excerpt (Max 300 chars)
            </label>
            <textarea
              id="post-excerpt"
              name="excerpt"
              rows={3}
              maxLength={300}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary resize-y outline-none"
            />
            <p className="text-xs text-muted-foreground text-right">{excerpt.length}/300</p>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <div className="rounded-md border border-border bg-surface p-4 space-y-4">
            <h3 className="font-semibold border-b border-border pb-2">Publishing</h3>

            <div className="grid gap-1.5">
              <label
                htmlFor="post-status"
                className="text-xs font-bold uppercase text-muted-foreground"
              >
                Status
              </label>
              <select
                id="post-status"
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="grid gap-1.5">
              <label
                htmlFor="post-category"
                className="text-xs font-bold uppercase text-muted-foreground"
              >
                Category
              </label>
              <select
                id="post-category"
                name="category_id"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-1.5">
              <label
                htmlFor="published-at"
                className="text-xs font-bold uppercase text-muted-foreground"
              >
                Published Date (Override)
              </label>
              <input
                id="published-at"
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to auto-set when first published.
              </p>
            </div>
          </div>

          <div className="rounded-md border border-border bg-surface p-4 space-y-4">
            <h3 className="font-semibold border-b border-border pb-2">Featured Image</h3>

            <div className="grid gap-1.5">
              <label
                htmlFor="img-url"
                className="text-xs font-bold uppercase text-muted-foreground"
              >
                Image URL
              </label>
              <input
                id="img-url"
                name="featured_image_url"
                type="url"
                placeholder="https://..."
                value={featuredImageUrl}
                onChange={(e) => setFeaturedImageUrl(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
              />
            </div>

            <div className="grid gap-1.5">
              <label
                htmlFor="img-alt"
                className="text-xs font-bold uppercase text-muted-foreground"
              >
                Image Alt Text
              </label>
              <input
                id="img-alt"
                name="featured_image_alt"
                type="text"
                value={featuredImageAlt}
                onChange={(e) => setFeaturedImageAlt(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
              />
            </div>

            {featuredImageUrl && (
              <div className="mt-2 overflow-hidden rounded-md border border-border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featuredImageUrl}
                  alt="Preview"
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="150" fill="%23f87171" viewBox="0 0 24 24"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z"/></svg>';
                  }}
                />
              </div>
            )}
          </div>

          <div className="rounded-md border border-border bg-surface p-4 space-y-4">
            <h3 className="font-semibold border-b border-border pb-2">SEO overrides</h3>
            <p className="text-xs text-muted-foreground">
              These override the Title and Excerpt for search engines.
            </p>

            <div className="grid gap-1.5">
              <label
                htmlFor="seo-title"
                className="text-xs font-bold uppercase text-muted-foreground"
              >
                SEO Title (Max 100)
              </label>
              <input
                id="seo-title"
                name="seo_title"
                type="text"
                maxLength={100}
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
              />
              <p className="text-xs text-muted-foreground text-right">{seoTitle.length}/100</p>
            </div>

            <div className="grid gap-1.5">
              <label
                htmlFor="seo-desc"
                className="text-xs font-bold uppercase text-muted-foreground"
              >
                SEO Description (Max 200)
              </label>
              <textarea
                id="seo-desc"
                name="seo_description"
                rows={2}
                maxLength={200}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none resize-y"
              />
              <p className="text-xs text-muted-foreground text-right">
                {seoDescription.length}/200
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-border">
        <button
          type="submit"
          disabled={isPending || !!slugError || slugChecking}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition-colors"
        >
          {isPending ? "Saving…" : isEditing ? "Save Changes" : "Create Post"}
        </button>
        <a
          href="/admin/blog-posts"
          className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-8 text-sm font-medium hover:bg-surface transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
