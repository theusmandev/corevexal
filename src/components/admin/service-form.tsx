"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { checkServiceSlugAvailable } from "@/app/actions/services";
import { iconRegistry } from "@/lib/icon-registry";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
}

type Category = { id: string; name: string; status: string };
type PublishedService = { id: string; slug: string; title: string };
type FAQ = { question: string; answer: string };

type ServiceFormProps = {
  initialData?: {
    id: string;
    category_id: string;
    title: string;
    slug: string;
    short_description: string;
    description: string;
    icon: string | null;
    features: string[];
    requirements: string[];
    process: string[];
    faqs: FAQ[];
    related_services: string[];
    seo_title: string | null;
    seo_description: string | null;
    status: string;
    display_order: number;
  };
  categories: Category[];
  publishedServices: PublishedService[]; // for related_services multi-select (excludes self)
  action: (formData: FormData) => Promise<{ error?: string; id?: string; success?: boolean }>;
};

// --- Reusable string-list editor ---
function StringListEditor({
  label,
  value,
  onChange,
  fieldId,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  fieldId: string;
}) {
  const [input, setInput] = useState("");

  function add() {
    const trimmed = input.trim();
    if (!trimmed) return;
    onChange([...value, trimmed]);
    setInput("");
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  function moveUp(i: number) {
    if (i === 0) return;
    const arr = [...value];
    const tmp = arr[i - 1]!;
    arr[i - 1] = arr[i]!;
    arr[i] = tmp;
    onChange(arr);
  }

  function moveDown(i: number) {
    if (i === value.length - 1) return;
    const arr = [...value];
    const tmp = arr[i]!;
    arr[i] = arr[i + 1]!;
    arr[i + 1] = tmp;
    onChange(arr);
  }

  return (
    <div className="grid gap-2">
      <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
      <ul className="space-y-1">
        {value.map((item, i) => (
          <li
            key={i}
            className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <span className="flex-1">{item}</span>
            <button
              type="button"
              onClick={() => moveUp(i)}
              disabled={i === 0}
              aria-label="Move up"
              className="text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <ChevronUp className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => moveDown(i)}
              disabled={i === value.length - 1}
              aria-label="Move down"
              className="text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <ChevronDown className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="Remove"
              className="text-destructive hover:text-destructive/80"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          id={fieldId}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Add item…"
          className="h-9 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="button"
          onClick={add}
          className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-background px-3 text-sm hover:bg-surface"
        >
          <Plus className="size-4" /> Add
        </button>
      </div>
    </div>
  );
}

// --- FAQ editor ---
function FaqEditor({ value, onChange }: { value: FAQ[]; onChange: (v: FAQ[]) => void }) {
  function addFaq() {
    onChange([...value, { question: "", answer: "" }]);
  }
  function removeFaq(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }
  function updateFaq(i: number, field: keyof FAQ, text: string) {
    const arr = [...value];
    const existing = arr[i]!;
    arr[i] = { question: existing.question, answer: existing.answer, [field]: text };
    onChange(arr);
  }

  return (
    <div className="grid gap-3">
      <p className="text-xs font-bold uppercase text-muted-foreground">FAQs</p>
      {value.map((faq, i) => (
        <div key={i} className="rounded-md border border-border bg-background p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">FAQ {i + 1}</p>
            <button
              type="button"
              onClick={() => removeFaq(i)}
              aria-label="Remove FAQ"
              className="text-destructive hover:text-destructive/80"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
          <input
            type="text"
            value={faq.question}
            onChange={(e) => updateFaq(i, "question", e.target.value)}
            placeholder="Question"
            maxLength={300}
            className="h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <textarea
            value={faq.answer}
            onChange={(e) => updateFaq(i, "answer", e.target.value)}
            placeholder="Answer"
            maxLength={1000}
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addFaq}
        className="inline-flex h-9 w-fit items-center gap-1 rounded-md border border-border bg-background px-3 text-sm hover:bg-surface"
      >
        <Plus className="size-4" /> Add FAQ
      </button>
    </div>
  );
}

export function ServiceForm({
  initialData,
  categories,
  publishedServices,
  action,
}: ServiceFormProps) {
  const isEditing = !!initialData;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? categories[0]?.id ?? "");
  const [shortDescription, setShortDescription] = useState(initialData?.short_description ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [icon, setIcon] = useState(initialData?.icon ?? "Building2");
  const [features, setFeatures] = useState<string[]>(initialData?.features ?? []);
  const [requirements, setRequirements] = useState<string[]>(initialData?.requirements ?? []);
  const [processSteps, setProcessSteps] = useState<string[]>(initialData?.process ?? []);
  const [faqs, setFaqs] = useState<FAQ[]>(initialData?.faqs ?? []);
  const [relatedServices, setRelatedServices] = useState<string[]>(
    initialData?.related_services ?? [],
  );
  const [seoTitle, setSeoTitle] = useState(initialData?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seo_description ?? "");
  const [status, setStatus] = useState<"draft" | "published">(
    (initialData?.status as "draft" | "published") ?? "draft",
  );
  const [displayOrder, setDisplayOrder] = useState(initialData?.display_order ?? 0);

  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(title));
    }
  }, [title, slugTouched]);

  // Debounced live slug check (cross-table)
  useEffect(() => {
    if (!slug) return;
    setSlugError(null);
    setSlugChecking(true);
    const timer = setTimeout(async () => {
      const result = await checkServiceSlugAvailable(slug, initialData?.id);
      setSlugChecking(false);
      if (!result.available) {
        setSlugError(
          result.conflict === "category"
            ? `"${slug}" already exists as a category slug — using it here would cause a routing collision.`
            : `"${slug}" is already taken by another service.`,
        );
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [slug, initialData?.id]);

  function toggleRelated(svcSlug: string) {
    setRelatedServices((prev) =>
      prev.includes(svcSlug) ? prev.filter((s) => s !== svcSlug) : [...prev, svcSlug],
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (slugError) return;
    const fd = new FormData(e.currentTarget);
    // Append JSON-encoded arrays (FormData doesn't support nested structures natively)
    fd.set("features", JSON.stringify(features));
    fd.set("requirements", JSON.stringify(requirements));
    fd.set("process", JSON.stringify(processSteps));
    fd.set("faqs", JSON.stringify(faqs));
    fd.set("related_services", JSON.stringify(relatedServices));
    setFormError(null);
    startTransition(async () => {
      const result = await action(fd);
      if (result.error) {
        setFormError(result.error);
      } else {
        router.push("/admin/services");
        router.refresh();
      }
    });
  }

  const iconNames = Object.keys(iconRegistry);

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {formError && (
        <div
          role="alert"
          className="rounded-md border border-destructive bg-destructive/10 p-4 text-sm text-destructive"
        >
          {formError}
        </div>
      )}

      {/* Category */}
      <div className="grid gap-1.5">
        <label htmlFor="svc-category" className="text-xs font-bold uppercase text-muted-foreground">
          Category <span aria-hidden>*</span>
        </label>
        <select
          id="svc-category"
          name="category_id"
          required
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} {c.status === "draft" ? "(draft)" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div className="grid gap-1.5">
        <label htmlFor="svc-title" className="text-xs font-bold uppercase text-muted-foreground">
          Title <span aria-hidden>*</span>
        </label>
        <input
          id="svc-title"
          name="title"
          type="text"
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Slug */}
      <div className="grid gap-1.5">
        <label htmlFor="svc-slug" className="text-xs font-bold uppercase text-muted-foreground">
          Slug <span aria-hidden>*</span>
        </label>
        <input
          id="svc-slug"
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

      {/* Short Description */}
      <div className="grid gap-1.5">
        <label
          htmlFor="svc-short-desc"
          className="text-xs font-bold uppercase text-muted-foreground"
        >
          Short Description <span aria-hidden>*</span>
        </label>
        <textarea
          id="svc-short-desc"
          name="short_description"
          required
          rows={2}
          maxLength={500}
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
        />
        <p className="text-xs text-muted-foreground text-right">{shortDescription.length}/500</p>
      </div>

      {/* Description */}
      <div className="grid gap-1.5">
        <label htmlFor="svc-desc" className="text-xs font-bold uppercase text-muted-foreground">
          Description <span aria-hidden>*</span>
        </label>
        <textarea
          id="svc-desc"
          name="description"
          required
          rows={6}
          maxLength={5000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
        />
        <p className="text-xs text-muted-foreground text-right">{description.length}/5000</p>
      </div>

      {/* Icon */}
      <div className="grid gap-1.5">
        <label htmlFor="svc-icon" className="text-xs font-bold uppercase text-muted-foreground">
          Icon
        </label>
        <select
          id="svc-icon"
          name="icon"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className="h-10 w-64 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {iconNames.map((name) => {
            const IconComponent = iconRegistry[name];
            return (
              <option key={name} value={name}>
                {name}
              </option>
            );
          })}
        </select>
        {/* Visual preview of selected icon */}
        {icon && iconRegistry[icon] && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {(() => {
              const I = iconRegistry[icon];
              return <I className="size-5" />;
            })()}
            <span>{icon}</span>
          </div>
        )}
      </div>

      {/* Features */}
      <StringListEditor
        label="Features"
        value={features}
        onChange={setFeatures}
        fieldId="svc-features-input"
      />
      {/* Requirements */}
      <StringListEditor
        label="Requirements"
        value={requirements}
        onChange={setRequirements}
        fieldId="svc-req-input"
      />
      {/* Process Steps */}
      <StringListEditor
        label="Process Steps"
        value={processSteps}
        onChange={setProcessSteps}
        fieldId="svc-proc-input"
      />

      {/* FAQs */}
      <FaqEditor value={faqs} onChange={setFaqs} />

      {/* Related Services — multi-select constrained to published services */}
      <div className="grid gap-2">
        <p className="text-xs font-bold uppercase text-muted-foreground">Related Services</p>
        <p className="text-xs text-muted-foreground">
          Only published services are listed. Slugs are managed by the system — no free-text entry.
        </p>
        {publishedServices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No other published services available.</p>
        ) : (
          <div className="max-h-48 overflow-y-auto rounded-md border border-input bg-background p-2 space-y-1">
            {publishedServices.map((svc) => (
              <label
                key={svc.id}
                className="flex cursor-pointer items-center gap-3 rounded px-2 py-1.5 text-sm hover:bg-surface"
              >
                <input
                  type="checkbox"
                  checked={relatedServices.includes(svc.slug)}
                  onChange={() => toggleRelated(svc.slug)}
                  className="size-4 accent-primary"
                />
                <span>{svc.title}</span>
                <span className="font-mono text-xs text-muted-foreground">{svc.slug}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* SEO */}
      <div className="grid gap-4 rounded-md border border-border bg-surface p-4">
        <p className="text-xs font-bold uppercase text-muted-foreground">SEO</p>
        <div className="grid gap-1.5">
          <label htmlFor="svc-seo-title" className="text-xs text-muted-foreground">
            SEO Title
          </label>
          <input
            id="svc-seo-title"
            name="seo_title"
            type="text"
            maxLength={200}
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-muted-foreground text-right">{seoTitle.length}/200</p>
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="svc-seo-desc" className="text-xs text-muted-foreground">
            SEO Description
          </label>
          <textarea
            id="svc-seo-desc"
            name="seo_description"
            rows={2}
            maxLength={500}
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
          />
          <p className="text-xs text-muted-foreground text-right">{seoDescription.length}/500</p>
        </div>
      </div>

      {/* Status & Order */}
      <div className="flex flex-wrap gap-6">
        <div className="grid gap-1.5">
          <label htmlFor="svc-status" className="text-xs font-bold uppercase text-muted-foreground">
            Status
          </label>
          <select
            id="svc-status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
            className="h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="svc-order" className="text-xs font-bold uppercase text-muted-foreground">
            Display Order
          </label>
          <input
            id="svc-order"
            name="display_order"
            type="number"
            min={0}
            value={displayOrder}
            onChange={(e) => setDisplayOrder(Number(e.target.value))}
            className="h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending || !!slugError || slugChecking}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {isPending ? "Saving…" : isEditing ? "Save Changes" : "Create Service"}
        </button>
        {isEditing && status === "published" && (
          <a
            href={`/services/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Preview ↗
          </a>
        )}
        {isEditing && status === "draft" && (
          <span className="inline-flex h-10 items-center px-4 text-sm text-muted-foreground">
            Save as Draft first, then Preview will appear when Published.
          </span>
        )}
        <a
          href="/admin/services"
          className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-6 text-sm font-medium hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
