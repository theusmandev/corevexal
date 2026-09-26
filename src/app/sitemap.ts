import { MetadataRoute } from "next";
import { getAllPublishedServiceSlugs, getPublishedCategories } from "@/lib/data/services";
import { getAllPublishedPostSlugs } from "@/lib/data/blog";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] || "https://corevexal.com";

  // Static routes
  const routes = ["", "/about", "/services", "/solutions", "/resources", "/faq", "/contact"].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    }),
  );

  // Categories and Services
  const categories = await getPublishedCategories();
  const serviceSlugs = await getAllPublishedServiceSlugs();

  const categorySlugs = categories.map((c) => c.slug);
  const allSlugs = Array.from(new Set([...categorySlugs, ...serviceSlugs]));

  const dynamicRoutes = allSlugs.map((slug) => ({
    url: `${baseUrl}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Blog posts
  const postSlugs = await getAllPublishedPostSlugs();
  const postRoutes = postSlugs.map((slug) => ({
    url: `${baseUrl}/resources/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...routes, ...dynamicRoutes, ...postRoutes];
}
