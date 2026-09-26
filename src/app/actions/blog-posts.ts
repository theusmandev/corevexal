"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const BlogPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(150),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(150)
    .regex(slugPattern, "Slug must be lowercase letters, numbers, and hyphens only"),
  category_id: z.string().nullable(),
  excerpt: z.string().max(300).optional().default(""),
  content: z.string().min(1, "Content is required"), // JSON string from TipTap
  featured_image_url: z.string().url().max(500).nullable().or(z.literal("")),
  featured_image_alt: z.string().max(200).nullable().or(z.literal("")),
  seo_title: z.string().max(100).nullable().or(z.literal("")),
  seo_description: z.string().max(200).nullable().or(z.literal("")),
  status: z.enum(["draft", "published"]),
  published_at: z.string().nullable().optional(),
});

export async function checkBlogPostSlugAvailable(
  slug: string,
  excludeId?: string,
): Promise<{ available: boolean }> {
  const { supabase } = await requireAdmin();

  let query = supabase.from("blog_posts").select("id").eq("slug", slug);
  if (excludeId) query = query.neq("id", excludeId);
  const { data: conflict } = await query.maybeSingle();

  return { available: !conflict };
}

export async function createBlogPost(formData: FormData) {
  const { supabase } = await requireAdmin();

  const raw = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    category_id: formData.get("category_id") || null,
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    featured_image_url: formData.get("featured_image_url") || null,
    featured_image_alt: formData.get("featured_image_alt") || null,
    seo_title: formData.get("seo_title") || null,
    seo_description: formData.get("seo_description") || null,
    status: formData.get("status"),
    published_at: formData.get("published_at") || null,
  };

  const parsed = BlogPostSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join("; ") };
  }

  const data = parsed.data;

  const slugCheck = await checkBlogPostSlugAvailable(data.slug);
  if (!slugCheck.available) {
    return { error: `Slug "${data.slug}" is already taken by another blog post.` };
  }

  let contentJson;
  try {
    contentJson = JSON.parse(data.content);
  } catch (e) {
    return { error: "Invalid content JSON format." };
  }

  // Handle published_at logic
  let finalPublishedAt = data.published_at;
  if (data.status === "published" && !finalPublishedAt) {
    finalPublishedAt = new Date().toISOString();
  } else if (data.status === "draft") {
    // If it's a draft and we are creating, we might want it null, but user could supply one if they want.
    // We'll trust whatever finalPublishedAt is.
  }

  const { data: inserted, error } = await supabase
    .from("blog_posts")
    .insert({
      title: data.title,
      slug: data.slug,
      category_id: data.category_id,
      excerpt: data.excerpt,
      content: contentJson,
      featured_image_url: data.featured_image_url || null,
      featured_image_alt: data.featured_image_alt || null,
      seo_title: data.seo_title || null,
      seo_description: data.seo_description || null,
      status: data.status,
      published_at: finalPublishedAt || null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/blog-posts");
  revalidatePath("/resources");
  revalidatePath("/sitemap.xml");
  return { id: inserted.id };
}

export async function updateBlogPost(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();

  // First fetch existing to check status transition
  const { data: existingPost } = await supabase
    .from("blog_posts")
    .select("status, published_at")
    .eq("id", id)
    .single();

  if (!existingPost) {
    return { error: "Post not found." };
  }

  const raw = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    category_id: formData.get("category_id") || null,
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    featured_image_url: formData.get("featured_image_url") || null,
    featured_image_alt: formData.get("featured_image_alt") || null,
    seo_title: formData.get("seo_title") || null,
    seo_description: formData.get("seo_description") || null,
    status: formData.get("status"),
    published_at: formData.get("published_at") || null,
  };

  const parsed = BlogPostSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join("; ") };
  }

  const data = parsed.data;

  const slugCheck = await checkBlogPostSlugAvailable(data.slug, id);
  if (!slugCheck.available) {
    return { error: `Slug "${data.slug}" is already taken by another blog post.` };
  }

  let contentJson;
  try {
    contentJson = JSON.parse(data.content);
  } catch (e) {
    return { error: "Invalid content JSON format." };
  }

  // Handle published_at logic
  let finalPublishedAt = data.published_at;

  if (data.status === "published") {
    if (existingPost.status === "draft" && !finalPublishedAt) {
      finalPublishedAt = new Date().toISOString();
    } else if (existingPost.status === "published" && !finalPublishedAt) {
      finalPublishedAt = existingPost.published_at; // keep original if override is empty
    }
  }

  const { error } = await supabase
    .from("blog_posts")
    .update({
      title: data.title,
      slug: data.slug,
      category_id: data.category_id,
      excerpt: data.excerpt,
      content: contentJson,
      featured_image_url: data.featured_image_url || null,
      featured_image_alt: data.featured_image_alt || null,
      seo_title: data.seo_title || null,
      seo_description: data.seo_description || null,
      status: data.status,
      published_at: finalPublishedAt || null,
      updated_at: new Date().toISOString(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/blog-posts");
  revalidatePath(`/admin/blog-posts/${id}`);
  revalidatePath("/resources");
  revalidatePath(`/resources/${data.slug}`);
  revalidatePath("/sitemap.xml");

  return { success: true };
}

export async function deleteBlogPost(id: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/blog-posts");
  revalidatePath("/resources");
  revalidatePath("/sitemap.xml");
  return { success: true };
}
