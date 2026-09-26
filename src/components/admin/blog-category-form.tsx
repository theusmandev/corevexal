"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { checkBlogCategorySlugAvailable } from "@/app/actions/blog-categories";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
}

type BlogCategoryFormProps = {
  initialData?: {
    id: string;
    name: string;
    slug: string;
  };
  action: (formData: FormData) => Promise<{ error?: string; id?: string; success?: boolean }>;
};

export function BlogCategoryForm({ initialData, action }: BlogCategoryFormProps) {
  const isEditing = !!initialData;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");

  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!slugTouched || (!isEditing && !slugTouched)) {
      setSlug(slugify(name));
    }
  }, [name, slugTouched, isEditing]);

  useEffect(() => {
    if (!slug) return;
    setSlugError(null);
    setSlugChecking(true);
    const timer = setTimeout(async () => {
      const result = await checkBlogCategorySlugAvailable(slug, initialData?.id);
      setSlugChecking(false);
      if (!result.available) {
        setSlugError(`"${slug}" is already taken by another blog category.`);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [slug, initialData?.id]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (slugError) return;

    const fd = new FormData(e.currentTarget);
    setFormError(null);
    startTransition(async () => {
      const result = await action(fd);
      if (result.error) {
        setFormError(result.error);
      } else {
        router.push("/admin/blog-categories");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {formError && (
        <div
          role="alert"
          className="rounded-md border border-destructive bg-destructive/10 p-4 text-sm text-destructive"
        >
          {formError}
        </div>
      )}

      {/* Name */}
      <div className="grid gap-1.5">
        <label htmlFor="cat-name" className="text-xs font-bold uppercase text-muted-foreground">
          Name <span aria-hidden>*</span>
        </label>
        <input
          id="cat-name"
          name="name"
          type="text"
          required
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Slug */}
      <div className="grid gap-1.5">
        <label htmlFor="cat-slug" className="text-xs font-bold uppercase text-muted-foreground">
          Slug <span aria-hidden>*</span>
        </label>
        <input
          id="cat-slug"
          name="slug"
          type="text"
          required
          maxLength={100}
          pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          className={`h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${slugError ? "border-destructive" : "border-input"}`}
        />
        {slugChecking && <p className="text-xs text-muted-foreground">Checking availability…</p>}
        {slugError && (
          <p role="alert" className="text-xs text-destructive">
            {slugError}
          </p>
        )}
        {isEditing && !slugError && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            ⚠ Changing this slug will change the public URL and may break existing links.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending || !!slugError || slugChecking}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {isPending ? "Saving…" : isEditing ? "Save Changes" : "Create Category"}
        </button>
        <a
          href="/admin/blog-categories"
          className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-6 text-sm font-medium hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
