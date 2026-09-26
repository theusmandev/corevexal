"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { checkCategorySlugAvailable } from "@/app/actions/categories";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
}

type CategoryFormProps = {
  initialData?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    display_order: number;
    status: string;
  };
  action: (
    formData: FormData,
  ) => Promise<{ error?: string; id?: string; success?: boolean; cascadedServices?: string[] }>;
  publishedServiceCount?: number;
};

export function CategoryForm({
  initialData,
  action,
  publishedServiceCount = 0,
}: CategoryFormProps) {
  const isEditing = !!initialData;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [displayOrder, setDisplayOrder] = useState(initialData?.display_order ?? 0);
  const [status, setStatus] = useState<"draft" | "published">(
    (initialData?.status as "draft" | "published") ?? "draft",
  );

  const [slugTouched, setSlugTouched] = useState(isEditing); // editing: slug is pre-set, don't auto-override
  const [slugError, setSlugError] = useState<string | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-generate slug from name when not in edit mode and user hasn't touched slug
  useEffect(() => {
    if (!slugTouched || (!isEditing && !slugTouched)) {
      setSlug(slugify(name));
    }
  }, [name, slugTouched, isEditing]);

  // Debounced live slug uniqueness check
  useEffect(() => {
    if (!slug) return;
    setSlugError(null);
    setSlugChecking(true);
    const timer = setTimeout(async () => {
      const result = await checkCategorySlugAvailable(slug, initialData?.id);
      setSlugChecking(false);
      if (!result.available) {
        setSlugError(
          result.conflict === "service"
            ? `"${slug}" already exists as a service slug — using it here would cause a routing collision.`
            : `"${slug}" is already taken by another category.`,
        );
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [slug, initialData?.id]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (slugError) return;

    // Warning for cascading drafts
    if (
      isEditing &&
      initialData?.status === "published" &&
      status === "draft" &&
      publishedServiceCount > 0
    ) {
      const confirmed = window.confirm(
        `This category has ${publishedServiceCount} published service(s). Setting it to draft will also set all of them to draft, hiding them from the public site. Continue?`,
      );
      if (!confirmed) {
        setStatus("published");
        return;
      }
    }

    const fd = new FormData(e.currentTarget);
    setFormError(null);
    startTransition(async () => {
      const result = await action(fd);
      if (result.error) {
        setFormError(result.error);
      } else {
        if (result.cascadedServices && result.cascadedServices.length > 0) {
          toast.success(
            `Category set to draft. ${result.cascadedServices.length} service(s) were also set to draft: ${result.cascadedServices.join(", ")}`,
          );
        }
        router.push("/admin/categories");
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

      {/* Description */}
      <div className="grid gap-1.5">
        <label
          htmlFor="cat-description"
          className="text-xs font-bold uppercase text-muted-foreground"
        >
          Description
        </label>
        <textarea
          id="cat-description"
          name="description"
          rows={3}
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
          style={{ whiteSpacePre: "preserve" } as React.CSSProperties}
        />
        <p className="text-xs text-muted-foreground text-right">{description.length}/500</p>
      </div>

      {/* Display Order */}
      <div className="grid gap-1.5">
        <label htmlFor="cat-order" className="text-xs font-bold uppercase text-muted-foreground">
          Display Order
        </label>
        <input
          id="cat-order"
          name="display_order"
          type="number"
          min={0}
          value={displayOrder}
          onChange={(e) => setDisplayOrder(Number(e.target.value))}
          className="h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Status */}
      <div className="grid gap-1.5">
        <label htmlFor="cat-status" className="text-xs font-bold uppercase text-muted-foreground">
          Status
        </label>
        <select
          id="cat-status"
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as "draft" | "published")}
          className="h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
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
          href="/admin/categories"
          className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-6 text-sm font-medium hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
