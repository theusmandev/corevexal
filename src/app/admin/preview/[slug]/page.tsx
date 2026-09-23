import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { ServiceDetail } from "@/components/service-detail";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

type Props = { params: Promise<{ slug: string }> };

export default async function AdminPreviewPage({ params }: Props) {
  // requireAdmin() verifies the visitor is an authenticated admin via getUser()
  // and returns the cookie-based supabase client. That client carries the admin's
  // JWT, which satisfies the RLS policy:
  //   USING (status = 'published' OR has_role(auth.uid(), 'admin') OR ...)
  // so draft rows are visible to this query.
  const { supabase } = await requireAdmin();

  const { slug } = await params;

  const { data: service, error } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Admin preview fetch error:", error.message);
  }

  if (!service) notFound();

  return (
    <div>
      {/* Preview banner — only admins can reach this page */}
      <div className="sticky top-0 z-50 flex items-center justify-between bg-amber-500/95 px-4 py-2 text-sm font-medium text-amber-950 backdrop-blur-sm">
        <span>
          🔍 Admin Preview — status:{" "}
          <span className="font-mono font-bold">{service.status}</span>. This
          page is not visible to the public
          {service.status === "draft" ? " until published." : "."}
        </span>
        <Link
          href={`/admin/services/${service.id}`}
          className="rounded bg-amber-950/20 px-3 py-1 text-xs font-bold hover:bg-amber-950/30"
        >
          ← Back to editor
        </Link>
      </div>
      <ServiceDetail service={service} />
    </div>
  );
}
