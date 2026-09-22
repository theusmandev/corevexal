"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const CategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(slugPattern, "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().max(500).optional().default(""),
  display_order: z.coerce.number().int().min(0).default(0),
  status: z.enum(["draft", "published"]),
});

// ---------------------------------------------------------------------------
// Cross-table slug uniqueness check (used by both create and update)
// The slug must not exist in EITHER service_categories OR services.
// ---------------------------------------------------------------------------

export async function checkCategorySlugAvailable(
  slug: string,
  excludeId?: string,
): Promise<{ available: boolean; conflict: "category" | "service" | null }> {
  const { supabase } = await requireAdmin();

  // Check service_categories (excluding self on update)
  let catQuery = supabase.from("service_categories").select("id").eq("slug", slug);
  if (excludeId) catQuery = catQuery.neq("id", excludeId);
  const { data: catConflict } = await catQuery.maybeSingle();
  if (catConflict) return { available: false, conflict: "category" };

  // Check services table (no exclusion — category slugs must never match any service slug)
  const { data: svcConflict } = await supabase
    .from("services")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (svcConflict) return { available: false, conflict: "service" };

  return { available: true, conflict: null };
}

// ---------------------------------------------------------------------------
// Create Category
// ---------------------------------------------------------------------------

export async function createCategory(formData: FormData) {
  const { supabase } = await requireAdmin();

  const raw = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    display_order: formData.get("display_order"),
    status: formData.get("status"),
  };

  const parsed = CategorySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join("; ") };
  }

  const { name, slug, description, display_order, status } = parsed.data;

  // Cross-table slug uniqueness — server-side re-check to catch races
  const slugCheck = await checkCategorySlugAvailable(slug);
  if (!slugCheck.available) {
    return {
      error:
        slugCheck.conflict === "service"
          ? `Slug "${slug}" already exists as a service slug. Using the same slug would cause a routing collision.`
          : `Slug "${slug}" is already taken by another category.`,
    };
  }

  const { data, error } = await supabase
    .from("service_categories")
    .insert({ name, slug, description, display_order, status })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/services");
  return { id: data.id };
}

// ---------------------------------------------------------------------------
// Update Category
// ---------------------------------------------------------------------------

export async function updateCategory(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();

  const raw = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    display_order: formData.get("display_order"),
    status: formData.get("status"),
  };

  const parsed = CategorySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join("; ") };
  }

  const { name, slug, description, display_order, status } = parsed.data;

  // Cross-table slug uniqueness — exclude self in category table check
  const slugCheck = await checkCategorySlugAvailable(slug, id);
  if (!slugCheck.available) {
    return {
      error:
        slugCheck.conflict === "service"
          ? `Slug "${slug}" already exists as a service slug. Using the same slug would cause a routing collision.`
          : `Slug "${slug}" is already taken by another category.`,
    };
  }

  const { error } = await supabase
    .from("service_categories")
    .update({
      name,
      slug,
      description,
      display_order,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${id}`);
  revalidatePath("/services");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Delete Category
// ---------------------------------------------------------------------------

export async function deleteCategory(id: string) {
  const { supabase } = await requireAdmin();

  // Count services in this category — refuse to delete if any exist
  const { count, error: countError } = await supabase
    .from("services")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if (countError) return { error: countError.message };
  if (count && count > 0) {
    return {
      error: `Cannot delete: this category has ${count} service${count === 1 ? "" : "s"}. Move or delete its services first.`,
    };
  }

  const { error } = await supabase.from("service_categories").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/services");
  return { success: true };
}
