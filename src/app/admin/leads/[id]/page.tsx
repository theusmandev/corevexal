import { notFound } from "next/navigation";
import { createClient } from "@/integrations/supabase/server";
import { updateLeadStatus } from "../actions";
import Link from "next/link";
import { LEAD_STATUSES } from "@/lib/constants";
import { formatAdminDate } from "@/lib/format-date";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  if (!uuidRegex.test(id)) {
    notFound();
  }

  const supabase = await createClient();
  const { data: lead, error } = await supabase.from("leads").select("*").eq("id", id).single();

  if (error || !lead) {
    console.error("Lead fetch error or not found", error ? "Error occurred" : "No lead found");
    notFound();
  }

  return (
    <div className="site-container py-10 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/leads"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            &larr; Back to Leads
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-surface">
        <div className="border-b border-border bg-background px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">{lead.full_name}</h1>
            <p className="text-sm text-muted-foreground">{lead.email}</p>
          </div>
          <form
            action={async (formData) => {
              "use server";
              await updateLeadStatus(formData);
            }}
            className="flex items-center gap-2"
          >
            <input type="hidden" name="id" value={lead.id} />
            <label htmlFor="status" className="sr-only">
              Status
            </label>
            <select
              name="status"
              id="status"
              defaultValue={lead.status}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="h-9 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Update
            </button>
          </form>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase text-muted-foreground">Contact Details</h3>
              <dl className="mt-2 space-y-2 text-sm">
                <div className="flex flex-col">
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="font-medium">{lead.phone || "N/A"}</dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-muted-foreground">Country</dt>
                  <dd className="font-medium">{lead.country}</dd>
                </div>
              </dl>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="text-xs font-bold uppercase text-muted-foreground">Company Info</h3>
              <dl className="mt-2 space-y-2 text-sm">
                <div className="flex flex-col">
                  <dt className="text-muted-foreground">Company Name</dt>
                  <dd className="font-medium">{lead.company_name || "N/A"}</dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-muted-foreground">Company Status</dt>
                  <dd className="font-medium">{lead.company_status}</dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-muted-foreground">Business Type</dt>
                  <dd className="font-medium">{lead.business_type}</dd>
                </div>
              </dl>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="text-xs font-bold uppercase text-muted-foreground">System</h3>
              <dl className="mt-2 space-y-2 text-sm">
                <div className="flex flex-col">
                  <dt className="text-muted-foreground">Service Requested</dt>
                  <dd className="font-medium">{lead.service_requested}</dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-muted-foreground">Source</dt>
                  <dd className="font-medium">{lead.source}</dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-muted-foreground">Submitted</dt>
                  <dd className="font-medium">{formatAdminDate(lead.created_at)}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-muted-foreground">Message</h3>
            <div className="rounded-md border border-border bg-background p-4 text-sm whitespace-pre-wrap font-sans text-foreground">
              {lead.message}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
