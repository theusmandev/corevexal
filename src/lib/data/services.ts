import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// We use a standalone static client here (without cookies) so Next.js can
// cache these requests and statically generate pages (SSG) at build time.
// If we used the cookie-based server client, Next.js would mark all routes
// using this file as dynamic.
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

export type CategoryWithServices = Database["public"]["Tables"]["service_categories"]["Row"] & {
  services: Database["public"]["Tables"]["services"]["Row"][];
};

export type PublishedService = Database["public"]["Tables"]["services"]["Row"];

export async function getPublishedCategories(): Promise<CategoryWithServices[]> {
  const { data, error } = await supabaseStatic
    .from("service_categories")
    .select(
      `
      *,
      services (*)
    `,
    )
    .eq("status", "published")
    .eq("services.status", "published")
    .order("display_order", { ascending: true })
    .order("display_order", { foreignTable: "services", ascending: true });

  if (error) {
    console.error("Error fetching published categories:", error.message);
    return [];
  }

  // Filter out any null nested relations if they happen
  return (data || []).map((cat) => ({
    ...cat,
    services: cat.services || [],
  }));
}

export async function getPublishedServiceBySlug(slug: string): Promise<PublishedService | null> {
  const { data, error } = await supabaseStatic
    .from("services")
    .select("*")
    .eq("status", "published")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      // 0 rows returned is expected for 404s
      console.error("Error fetching published service by slug:", error.message);
    }
    return null;
  }
  return data;
}

export async function getAllPublishedServiceSlugs(): Promise<string[]> {
  const { data, error } = await supabaseStatic
    .from("services")
    .select("slug")
    .eq("status", "published");

  if (error) {
    console.error("Error fetching published service slugs:", error.message);
    return [];
  }
  return (data || []).map((s) => s.slug);
}

export async function getRelatedServices(slugs: string[]): Promise<PublishedService[]> {
  if (!slugs || slugs.length === 0) return [];

  const { data, error } = await supabaseStatic
    .from("services")
    .select("*")
    .eq("status", "published")
    .in("slug", slugs);

  if (error) {
    console.error("Error fetching related services:", error.message);
    return [];
  }

  // Maintain requested order if possible
  const serviceMap = new Map(data.map((s) => [s.slug, s]));
  return slugs
    .map((slug) => serviceMap.get(slug))
    .filter((s): s is PublishedService => s !== undefined);
}
