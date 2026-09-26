import Link from "next/link";
import { createClient } from "@/integrations/supabase/server";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

export default async function BlogCategoriesAdminPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from("blog_categories")
    .select(
      `
      id, name, slug,
      blog_posts(count)
    `,
    )
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching blog categories:", error.message);
  }

  return (
    <div className="site-container py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Blog Categories</h1>
        <Link
          href="/admin/blog-categories/new"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <Plus className="size-4" />
          New Category
        </Link>
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-background">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Posts</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!categories || categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  No blog categories yet.
                </td>
              </tr>
            ) : (
              categories.map((cat) => {
                const postCount = Array.isArray(cat.blog_posts)
                  ? ((cat.blog_posts as unknown as { count: number }[])[0]?.count ?? 0)
                  : 0;
                return (
                  <tr
                    key={cat.id}
                    className="border-b border-border last:border-0 hover:bg-background transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{cat.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {cat.slug}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{postCount}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/blog-categories/${cat.id}`}
                        className="text-primary-text hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
