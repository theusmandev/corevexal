import Link from "next/link";
import { createClient } from "@/integrations/supabase/server";
import { LEAD_STATUSES } from "@/lib/constants";
import { formatAdminDate } from "@/lib/format-date";

export const metadata = {
 robots: "noindex, nofollow"
};

export default async function AdminDashboardPage() {
 const supabase = await createClient();

 // Create parallel queries
 const sevenDaysAgo = new Date();
 sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
 const sevenDaysIso = sevenDaysAgo.toISOString();

 const [
 { count: totalCount, error: totalError },
 { count: newCount, error: newError },
 { count: inProgressCount, error: inProgressError },
 { count: completedCount, error: completedError },
 { count: recentCount, error: recentError },
 { data: latestLeads, error: latestError },
 { data: statusCountsData, error: statusError }
 ] = await Promise.all([
 supabase.from("leads").select("*", { count: "exact", head: true }),
 supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "New"),
 supabase.from("leads").select("*", { count: "exact", head: true }).in("status", ["Contacted", "In Progress", "Waiting for Client"]),
 supabase.from("leads").select("*", { count: "exact", head: true }).in("status", ["Completed", "Closed"]),
 supabase.from("leads").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysIso),
 supabase.from("leads").select("id, full_name, service_requested, status, created_at").order("created_at", { ascending: false }).limit(5),
 // Supabase RPC or aggregate to group by status isn't natively exposed via JS standard select except with RPC.
 // Instead of doing an RPC which we can't create, we can just select all statuses and aggregate in memory.
 // Wait, what if there are 100,000 leads? The prompt says "The per-status counts must add up to the total. If they do not, show an 'Other' row". 
 // I will fetch the counts for EACH status individually in Promise.all to avoid downloading all leads.
 ]);

 // Wait, I didn't fetch individual status counts above. Let me fetch them now cleanly or refactor.
 // Actually, I can just fetch all counts in one go. I will construct promises for all LEAD_STATUSES.
 
 const statusPromises = LEAD_STATUSES.map(s => supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", s));
 const statusResults = await Promise.all(statusPromises);

 // Check for errors
 const hasError = [totalError, newError, inProgressError, completedError, recentError, latestError, statusError, ...statusResults.map(r => r.error)].some(e => e !== null);
 if (hasError) {
 console.error("Dashboard query failed");
 }

 // Aggregate status counts
 let accountedTotal = 0;
 const statusCounts: Record<string, number> = {};
 
 if (!hasError) {
 LEAD_STATUSES.forEach((s, i) => {
 const cnt = statusResults[i].count || 0;
 statusCounts[s] = cnt;
 accountedTotal += cnt;
 });
 }
 const otherCount = (totalCount || 0) - accountedTotal;
 if (otherCount > 0) {
 statusCounts["Other"] = otherCount;
 }

 return (
 <div className="site-container py-10">
 <h1 className="font-display text-3xl font-bold mb-8">Dashboard</h1>

 {hasError && (
 <div className="mb-8 rounded-md bg-destructive/10 p-4 border border-destructive/20 text-destructive text-sm font-medium">
 Failed to load dashboard statistics.
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
 <Link href="/admin/leads" className="block rounded-lg border border-border bg-surface p-6 hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
 <h2 className="text-sm font-bold uppercase text-muted-foreground">Total Leads</h2>
 <p className="mt-2 text-4xl font-display font-bold">{hasError ? "-" : totalCount || 0}</p>
 </Link>
 <Link href="/admin/leads?status=New" className="block rounded-lg border border-border bg-surface p-6 hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
 <h2 className="text-sm font-bold uppercase text-muted-foreground">New</h2>
 <p className="mt-2 text-4xl font-display font-bold text-primary">{hasError ? "-" : newCount || 0}</p>
 </Link>
 <Link href="/admin/leads?status=Contacted,In%20Progress,Waiting%20for%20Client" className="block rounded-lg border border-border bg-surface p-6 hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
 <h2 className="text-sm font-bold uppercase text-muted-foreground">In Progress</h2>
 <p className="mt-2 text-4xl font-display font-bold text-amber-500">{hasError ? "-" : inProgressCount || 0}</p>
 </Link>
 <Link href="/admin/leads?status=Completed,Closed" className="block rounded-lg border border-border bg-surface p-6 hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
 <h2 className="text-sm font-bold uppercase text-muted-foreground">Closed / Completed</h2>
 <p className="mt-2 text-4xl font-display font-bold text-muted-foreground">{hasError ? "-" : completedCount || 0}</p>
 </Link>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="lg:col-span-2">
 <h2 className="text-lg font-bold mb-4">Latest Leads</h2>
 <div className="rounded-md border border-border bg-surface overflow-x-auto">
 <table className="w-full text-left text-sm">
 <thead className="border-b border-border bg-background">
 <tr>
 <th className="px-4 py-3 font-medium">Name</th>
 <th className="px-4 py-3 font-medium">Service</th>
 <th className="px-4 py-3 font-medium">Status</th>
 <th className="px-4 py-3 font-medium">Date</th>
 <th className="px-4 py-3 font-medium">Action</th>
 </tr>
 </thead>
 <tbody>
 {hasError ? (
 <tr>
 <td colSpan={5} className="px-4 py-8 text-center text-destructive">
 Error loading recent leads.
 </td>
 </tr>
 ) : !latestLeads || latestLeads.length === 0 ? (
 <tr>
 <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
 No leads yet.
 </td>
 </tr>
 ) : (
 latestLeads.map((lead) => (
 <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-background transition-colors">
 <td className="px-4 py-3 font-medium">{lead.full_name}</td>
 <td className="px-4 py-3">{lead.service_requested}</td>
 <td className="px-4 py-3">
 <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold">
 {lead.status}
 </span>
 </td>
 <td className="px-4 py-3 text-muted-foreground">
 {formatAdminDate(lead.created_at)}
 </td>
 <td className="px-4 py-3">
 <Link href={`/admin/leads/${lead.id}`} className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
 View
 </Link>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>

 <div>
 <h2 className="text-lg font-bold mb-4">Breakdown</h2>
 <div className="rounded-md border border-border bg-surface p-4">
 {hasError ? (
 <p className="text-sm text-destructive">Error loading breakdown.</p>
 ) : (
 <ul className="space-y-3 text-sm">
 {Object.entries(statusCounts).map(([status, cnt]) => (
 <li key={status} className="flex items-center justify-between">
 <span className="text-muted-foreground">{status}</span>
 <span className="font-bold">{cnt}</span>
 </li>
 ))}
 </ul>
 )}
 
 <div className="mt-6 pt-6 border-t border-border">
 <div className="flex items-center justify-between text-sm">
 <span className="text-muted-foreground">Last 7 Days</span>
 <span className="font-bold text-primary">{hasError ? "-" : recentCount || 0}</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
