import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"]!;
const supabaseAnonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!;

const supabaseStatic = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (url, init) => {
      return fetch(url, {
        ...init,
        next: { revalidate: 60 },
      });
    },
  },
});

export type BlogCategory = Database["public"]["Tables"]["blog_categories"]["Row"];
export type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"] & {
  featured_image_url?: string | null;
  featured_image_alt?: string | null;
};
export type PublishedPostWithCategory = BlogPost & {
  category: Pick<BlogCategory, "name" | "slug"> | null;
};

export async function getPublishedPosts(): Promise<PublishedPostWithCategory[]> {
  const { data, error } = await supabaseStatic
    .from("blog_posts")
    .select(
      `
      *,
      category:blog_categories ( name, slug )
    `,
    )
    .eq("status", "published");

  if (error) {
    console.error("Error fetching published posts:", error.message);
    return [];
  }

  const posts = (data || []) as unknown as PublishedPostWithCategory[];
  return posts.sort((a, b) => {
    const dateA = new Date(a.published_at || a.created_at).getTime();
    const dateB = new Date(b.published_at || b.created_at).getTime();
    return dateB - dateA;
  });
}

export async function getPublishedPostBySlug(
  slug: string,
): Promise<PublishedPostWithCategory | null> {
  const { data, error } = await supabaseStatic
    .from("blog_posts")
    .select(
      `
      *,
      category:blog_categories ( name, slug )
    `,
    )
    .eq("status", "published")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("Error fetching published post by slug:", error.message);
    }
    return null;
  }
  return data as unknown as PublishedPostWithCategory;
}

export async function getAllPublishedPostSlugs(): Promise<string[]> {
  const { data, error } = await supabaseStatic
    .from("blog_posts")
    .select("slug")
    .eq("status", "published");

  if (error) {
    console.error("Error fetching published post slugs:", error.message);
    return [];
  }
  return (data || []).map((p) => p.slug);
}

export async function getAllBlogCategories(): Promise<BlogCategory[]> {
  const { data, error } = await supabaseStatic
    .from("blog_categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching blog categories:", error.message);
    return [];
  }
  return data || [];
}
