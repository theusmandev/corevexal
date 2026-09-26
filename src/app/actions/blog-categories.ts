"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const BlogCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(slugPattern, "Slug must be lowercase letters, numbers, and hyphens only"),
});

export async function checkBlogCategorySlugAvailable(
  slug: string,
  excludeId?: string,
): Promise<{ available: boolean; conflict: boolean }> {
  const { supabase } = await requireAdmin();

  let catQuery = supabase.from("blog_categories").select("id").eq("slug", slug);
  if (excludeId) catQuery = catQuery.neq("id", excludeId);
  const { data: catConflict } = await catQuery.maybeSingle();

  if (catConflict) return { available: false, conflict: true };

  return { available: true, conflict: false };
}

export async function createBlogCategory(formData: FormData) {
  const { supabase } = await requireAdmin();

  const raw = {
    name: formData.get("name"),
    slug: formData.get("slug"),
  };

  const parsed = BlogCategorySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join("; ") };
  }

  const { name, slug } = parsed.data;

  const slugCheck = await checkBlogCategorySlugAvailable(slug);
  if (!slugCheck.available) {
    return { error: `Slug "${slug}" is already taken by another blog category.` };
  }

  const { data, error } = await supabase
    .from("blog_categories")
    .insert({ name, slug })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/blog-categories");
  revalidatePath("/resources");
  return { id: data.id };
}

export async function updateBlogCategory(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();

  const raw = {
    name: formData.get("name"),
    slug: formData.get("slug"),
  };

  const parsed = BlogCategorySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join("; ") };
  }

  const { name, slug } = parsed.data;

  const slugCheck = await checkBlogCategorySlugAvailable(slug, id);
  if (!slugCheck.available) {
    return { error: `Slug "${slug}" is already taken by another blog category.` };
  }

  const { error } = await supabase.from("blog_categories").update({ name, slug }).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/blog-categories");
  revalidatePath(`/admin/blog-categories/${id}`);
  revalidatePath("/resources");

  return { success: true };
}

export async function deleteBlogCategory(id: string) {
  const { supabase } = await requireAdmin();

  const { count, error: countError } = await supabase
    .from("blog_posts")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if (countError) return { error: countError.message };
  if (count && count > 0) {
    return {
      error: `Cannot delete: this category has ${count} post${count === 1 ? "" : "s"}. Move or delete its posts first.`,
    };
  }

  const { error } = await supabase.from("blog_categories").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/blog-categories");
  revalidatePath("/resources");
  return { success: true };
}
