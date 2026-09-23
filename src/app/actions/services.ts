"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const ServiceSchema = z.object({
  category_id: z.string().uuid("Category is required"),
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(slugPattern, "Slug must be lowercase letters, numbers, and hyphens only"),
  short_description: z.string().min(1, "Short description is required").max(500),
  description: z.string().min(1, "Description is required").max(5000),
  icon: z.string().max(100).optional().default("Building2"),
  features: z.array(z.string().max(300)).default([]),
  requirements: z.array(z.string().max(300)).default([]),
  process: z.array(z.string().max(300)).default([]),
  faqs: z
    .array(z.object({ question: z.string().max(300), answer: z.string().max(1000) }))
    .default([]),
  related_services: z.array(z.string().max(100)).default([]),
  seo_title: z.string().max(200).optional().default(""),
  seo_description: z.string().max(500).optional().default(""),
  status: z.enum(["draft", "published"]),
  display_order: z.coerce.number().int().min(0).default(0),
});

// ---------------------------------------------------------------------------
// Cross-table slug uniqueness check
// The slug must not exist in EITHER services OR service_categories.
// ---------------------------------------------------------------------------

export async function checkServiceSlugAvailable(
  slug: string,
  excludeId?: string,
): Promise<{ available: boolean; conflict: "service" | "category" | null }> {
  const { supabase } = await requireAdmin();

  // Check services (excluding self on update)
  let svcQuery = supabase.from("services").select("id").eq("slug", slug);
  if (excludeId) svcQuery = svcQuery.neq("id", excludeId);
  const { data: svcConflict } = await svcQuery.maybeSingle();
  if (svcConflict) return { available: false, conflict: "service" };

  // Check service_categories — service slugs must never match any category slug
  const { data: catConflict } = await supabase
    .from("service_categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (catConflict) return { available: false, conflict: "category" };

  return { available: true, conflict: null };
}

// ---------------------------------------------------------------------------
// Helper: parse the repeated jsonb-ish fields from FormData
// ---------------------------------------------------------------------------

function parseFormDataJson<T>(formData: FormData, key: string, fallback: T): T {
  const raw = formData.get(key);
  if (typeof raw !== "string" || raw.trim() === "") return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Create Service
// ---------------------------------------------------------------------------

export async function createService(formData: FormData) {
  const { supabase } = await requireAdmin();

  const raw = {
    category_id: formData.get("category_id"),
    title: formData.get("title"),
    slug: formData.get("slug"),
    short_description: formData.get("short_description"),
    description: formData.get("description"),
    icon: formData.get("icon"),
    features: parseFormDataJson<string[]>(formData, "features", []),
    requirements: parseFormDataJson<string[]>(formData, "requirements", []),
    process: parseFormDataJson<string[]>(formData, "process", []),
    faqs: parseFormDataJson<{ question: string; answer: string }[]>(formData, "faqs", []),
    related_services: parseFormDataJson<string[]>(formData, "related_services", []),
    seo_title: formData.get("seo_title"),
    seo_description: formData.get("seo_description"),
    status: formData.get("status"),
    display_order: formData.get("display_order"),
  };

  const parsed = ServiceSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join("; ") };
  }

  const data = parsed.data;

  // Cross-table slug uniqueness — server-side re-check to catch races
  const slugCheck = await checkServiceSlugAvailable(data.slug);
  if (!slugCheck.available) {
    return {
      error:
        slugCheck.conflict === "category"
          ? `Slug "${data.slug}" already exists as a category slug. Using the same slug would cause a routing collision.`
          : `Slug "${data.slug}" is already taken by another service.`,
    };
  }

  const { data: inserted, error } = await supabase
    .from("services")
    .insert(data)
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/sitemap.xml");
  return { id: inserted.id };
}

// ---------------------------------------------------------------------------
// Update Service
// ---------------------------------------------------------------------------

export async function updateService(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();

  const raw = {
    category_id: formData.get("category_id"),
    title: formData.get("title"),
    slug: formData.get("slug"),
    short_description: formData.get("short_description"),
    description: formData.get("description"),
    icon: formData.get("icon"),
    features: parseFormDataJson<string[]>(formData, "features", []),
    requirements: parseFormDataJson<string[]>(formData, "requirements", []),
    process: parseFormDataJson<string[]>(formData, "process", []),
    faqs: parseFormDataJson<{ question: string; answer: string }[]>(formData, "faqs", []),
    related_services: parseFormDataJson<string[]>(formData, "related_services", []),
    seo_title: formData.get("seo_title"),
    seo_description: formData.get("seo_description"),
    status: formData.get("status"),
    display_order: formData.get("display_order"),
  };

  const parsed = ServiceSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join("; ") };
  }

  const data = parsed.data;

  // Cross-table slug uniqueness — exclude self in services check
  const slugCheck = await checkServiceSlugAvailable(data.slug, id);
  if (!slugCheck.available) {
    return {
      error:
        slugCheck.conflict === "category"
          ? `Slug "${data.slug}" already exists as a category slug. Using the same slug would cause a routing collision.`
          : `Slug "${data.slug}" is already taken by another service.`,
    };
  }

  const { error } = await supabase
    .from("services")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/services");
  revalidatePath(`/admin/services/${id}`);
  revalidatePath("/services");
  revalidatePath(`/services/${data.slug}`);
  revalidatePath("/sitemap.xml");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Delete Service
// ---------------------------------------------------------------------------

export async function deleteService(id: string) {
  const { supabase } = await requireAdmin();

  // Get the slug of the service being deleted
  const { data: svc, error: fetchError } = await supabase
    .from("services")
    .select("slug")
    .eq("id", id)
    .single();
  if (fetchError) return { error: fetchError.message };

  const slug = svc.slug;

  // Check if any other service references this slug in related_services
  const { data: referencing, error: refError } = await supabase
    .from("services")
    .select("title, slug")
    .neq("id", id)
    .contains("related_services", JSON.stringify([slug]));

  if (refError) return { error: refError.message };

  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/sitemap.xml");

  // Return a warning if other services referenced this slug
  if (referencing && referencing.length > 0) {
    const names = referencing.map((s) => `"${s.title}"`).join(", ");
    return {
      success: true,
      warning: `Deleted. ${referencing.length} service${referencing.length === 1 ? "" : "s"} (${names}) still reference "${slug}" in their related-services — those links are now silently broken.`,
    };
  }

  return { success: true };
}
