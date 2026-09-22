import Link from "next/link";
import { createClient } from "@/integrations/supabase/server";
import { sanitizeSearchTerm } from "@/lib/search";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Services | Admin", robots: { index: false } };

export default async function ServicesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const supabase = await createClient();

  const rawSearch = typeof resolvedParams["search"] === "string" ? resolvedParams["search"] : "";
  const safeSearch = sanitizeSearchTerm(rawSearch);
  const categoryFilter =
    typeof resolvedParams["category"] === "string" ? resolvedParams["category"] : "";
  const statusFilter = typeof resolvedParams["status"] === "string" ? resolvedParams["status"] : "";

  // Fetch categories for filter dropdown
  const { data: categories } = await supabase
    .from("service_categories")
    .select("id, name")
    .order("display_order", { ascending: true });

  // Build services query
  let query = supabase
    .from("services")
    .select(
      `
      id, title, slug, status, display_order,
      service_categories ( name )
    `,
    )
    .order("display_order", { ascending: true })
    .order("title", { ascending: true });

  if (categoryFilter) query = query.eq("category_id", categoryFilter);
  if (statusFilter) query = query.eq("status", statusFilter);
  if (safeSearch) {
    const v = `"%${safeSearch}%"`;
    query = query.or(`title.ilike.${v},slug.ilike.${v}`);
  }

  const { data: services, error } = await query;
  if (error) console.error("Error fetching services:", error.message);

  return (
    <div className="site-container py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Services</h1>
        <Link
          href="/admin/services/new"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <Plus className="size-4" />
          New Service
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-md border border-border bg-surface p-4">
        <form method="get" action="/admin/services" className="flex flex-wrap gap-4 items-end">
          <div className="grid gap-1">
            <label
              htmlFor="svc-search"
              className="text-xs font-bold uppercase text-muted-foreground"
            >
              Search
            </label>
            <input
              type="text"
              name="search"
              id="svc-search"
              defaultValue={safeSearch}
              placeholder="Title or slug…"
              className="h-10 w-52 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="grid gap-1">
            <label
              htmlFor="svc-cat-filter"
              className="text-xs font-bold uppercase text-muted-foreground"
            >
              Category
            </label>
            <select
              name="category"
              id="svc-cat-filter"
              defaultValue={categoryFilter}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Categories</option>
              {(categories || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1">
            <label
              htmlFor="svc-status-filter"
              className="text-xs font-bold uppercase text-muted-foreground"
            >
              Status
            </label>
            <select
              name="status"
              id="svc-status-filter"
              defaultValue={statusFilter}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <button
            type="submit"
            className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
          >
            Filter
          </button>
          {(safeSearch || categoryFilter || statusFilter) && (
            <a
              href="/admin/services"
              className="inline-flex h-10 items-center px-3 text-sm text-muted-foreground hover:text-foreground"
            >
              Clear
            </a>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-background">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!services || services.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No services found.
                </td>
              </tr>
            ) : (
              services.map((svc) => {
                const catName = Array.isArray(svc.service_categories)
                  ? ((svc.service_categories as unknown as { name: string }[])[0]?.name ?? "—")
                  : ((svc.service_categories as { name: string } | null)?.name ?? "—");
                return (
                  <tr
                    key={svc.id}
                    className="border-b border-border last:border-0 hover:bg-background transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{svc.title}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {svc.slug}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{catName}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                          svc.status === "published"
                            ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {svc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{svc.display_order}</td>
                    <td className="px-4 py-3 flex items-center gap-3">
                      <Link
                        href={`/admin/services/${svc.id}`}
                        className="text-primary-text hover:underline"
                      >
                        Edit
                      </Link>
                      {svc.status === "published" && (
                        <a
                          href={`/services/${svc.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground text-xs"
                        >
                          ↗ View
                        </a>
                      )}
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
