import Link from "next/link";
import { createClient } from "@/integrations/supabase/server";
import { LEAD_STATUSES } from "@/lib/constants";
import { sanitizeSearchTerm } from "@/lib/search";
import { formatAdminDate } from "@/lib/format-date";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;

  // Pagination
  let page = 1;
  const pageParam = resolvedParams["page"];
  if (typeof pageParam === "string") {
    const parsed = parseInt(pageParam, 10);
    if (!isNaN(parsed) && parsed > 0) page = parsed;
  }
  const pageSize = 50;

  // Status filter
  const statusParam = typeof resolvedParams["status"] === "string" ? resolvedParams["status"] : "";
  const statusFilters = statusParam
    .split(",")
    .map((s) => s.trim())
    .filter((s) => (LEAD_STATUSES as readonly string[]).includes(s)) as (typeof LEAD_STATUSES)[number][];

  // Search filter - sanitize tightly
  const rawSearch = typeof resolvedParams["search"] === "string" ? resolvedParams["search"] : "";
  const safeSearch = sanitizeSearchTerm(rawSearch);

  const supabase = await createClient();

  let query = supabase
    .from("leads")
    .select("id, full_name, email, service_requested, country, status, created_at", {
      count: "exact",
    });

  if (statusFilters.length > 0) {
    query = query.in("status", statusFilters);
  }

  if (safeSearch) {
    const postgrestVal = `"%${safeSearch}%"`;
    query = query.or(
      `full_name.ilike.${postgrestVal},email.ilike.${postgrestVal},company_name.ilike.${postgrestVal}`,
    );
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query = query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);

  const { data: leads, count, error } = await query;

  if (error) {
    console.error("Error fetching leads:", error);
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="site-container py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold">Leads</h1>
      </div>

      <div className="mb-6 rounded-md border border-border bg-surface p-4">
        <form method="get" action="/admin/leads" className="flex flex-wrap gap-4 items-end">
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
              placeholder="Name, email, company..."
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
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
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
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Service</th>
              <th className="px-4 py-3 font-medium">Country</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {!leads || leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  No leads yet.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-border last:border-0 hover:bg-background transition-colors"
                >
                  <td className="px-4 py-3">{lead.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.email}</td>
                  <td className="px-4 py-3">{lead.service_requested}</td>
                  <td className="px-4 py-3">{lead.country}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold">
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatAdminDate(lead.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="text-primary-text hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {from + 1} to {Math.min(to + 1, total)} of {total} leads
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/leads?page=${page - 1}${statusParam ? `&status=${encodeURIComponent(statusParam)}` : ""}${safeSearch ? `&search=${encodeURIComponent(safeSearch)}` : ""}`}
                className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/leads?page=${page + 1}${statusParam ? `&status=${encodeURIComponent(statusParam)}` : ""}${safeSearch ? `&search=${encodeURIComponent(safeSearch)}` : ""}`}
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
