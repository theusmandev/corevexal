import Link from "next/link";
import { createClient } from "@/integrations/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { sanitizeSearchTerm } from "@/lib/search";
import { formatAdminDate } from "@/lib/format-date";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

export default async function BlogPostsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdmin();
  const resolvedParams = await searchParams;

  const pageParam = resolvedParams["page"];
  let page = 1;
  if (typeof pageParam === "string") {
    const parsed = parseInt(pageParam, 10);
    if (!isNaN(parsed) && parsed > 0) page = parsed;
  }
  const pageSize = 50;

  const statusParam = typeof resolvedParams["status"] === "string" ? resolvedParams["status"] : "";
  const categoryParam =
    typeof resolvedParams["category"] === "string" ? resolvedParams["category"] : "";

  const rawSearch = typeof resolvedParams["search"] === "string" ? resolvedParams["search"] : "";
  const safeSearch = sanitizeSearchTerm(rawSearch);

  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("blog_categories")
    .select("id, name")
    .order("name");

  let query = supabase
    .from("blog_posts")
    .select("id, title, slug, status, published_at, category:blog_categories(name)", {
      count: "exact",
    });

  if (statusParam) {
    query = query.eq("status", statusParam);
  }

  if (categoryParam === "uncategorized") {
    query = query.is("category_id", null);
  } else if (categoryParam) {
    query = query.eq("category_id", categoryParam);
  }

  if (safeSearch) {
    const postgrestVal = `"%${safeSearch}%"`;
    query = query.or(`title.ilike.${postgrestVal},slug.ilike.${postgrestVal}`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data: posts, count, error } = await query;

  if (error) {
    console.error("Error fetching blog posts:", error);
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="site-container py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Blog Posts</h1>
        <Link
          href="/admin/blog-posts/new"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <Plus className="size-4" />
          New Post
        </Link>
      </div>

      <div className="mb-6 rounded-md border border-border bg-surface p-4">
        <form method="get" action="/admin/blog-posts" className="flex flex-wrap gap-4 items-end">
          <div className="grid gap-1">
            <label htmlFor="search" className="text-xs font-bold uppercase text-muted-foreground">
              Search
            </label>
            <input
              type="text"
              name="search"
              id="search"
              defaultValue={safeSearch}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Title or slug..."
            />
          </div>
          <div className="grid gap-1">
            <label htmlFor="status" className="text-xs font-bold uppercase text-muted-foreground">
              Status
            </label>
            <select
              name="status"
              id="status"
              defaultValue={statusParam}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div className="grid gap-1">
            <label htmlFor="category" className="text-xs font-bold uppercase text-muted-foreground">
              Category
            </label>
            <select
              name="category"
              id="category"
              defaultValue={categoryParam}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="uncategorized">Uncategorized</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="h-10 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
          >
            Filter
          </button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-background">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Published</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!posts || posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No blog posts yet.
                </td>
              </tr>
            ) : (
              posts.map((post) => {
                const catName =
                  post.category && !Array.isArray(post.category)
                    ? post.category.name
                    : "Uncategorized";
                return (
                  <tr
                    key={post.id}
                    className="border-b border-border last:border-0 hover:bg-background transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">
                      {post.title}
                      <div className="text-xs font-mono text-muted-foreground mt-0.5">
                        {post.slug}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{catName}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                          post.status === "published"
                            ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {post.published_at ? formatAdminDate(post.published_at) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/blog-posts/${post.id}`}
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

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {from + 1} to {Math.min(to + 1, total)} of {total} posts
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/blog-posts?page=${page - 1}${statusParam ? `&status=${encodeURIComponent(statusParam)}` : ""}${categoryParam ? `&category=${encodeURIComponent(categoryParam)}` : ""}${safeSearch ? `&search=${encodeURIComponent(safeSearch)}` : ""}`}
                className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/blog-posts?page=${page + 1}${statusParam ? `&status=${encodeURIComponent(statusParam)}` : ""}${categoryParam ? `&category=${encodeURIComponent(categoryParam)}` : ""}${safeSearch ? `&search=${encodeURIComponent(safeSearch)}` : ""}`}
                className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
