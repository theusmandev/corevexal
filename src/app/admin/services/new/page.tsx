import { createClient } from "@/integrations/supabase/server";
import { ServiceForm } from "@/components/admin/service-form";
import { createService } from "@/app/actions/services";

export const dynamic = "force-dynamic";
export const metadata = { title: "New Service | Admin", robots: { index: false } };

export default async function NewServicePage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("service_categories")
    .select("id, name, status")
    .order("display_order", { ascending: true });

  // Published services (excluding none, since this is a new service)
  const { data: publishedServices } = await supabase
    .from("services")
    .select("id, slug, title")
    .eq("status", "published")
    .order("title", { ascending: true });

  return (
    <div className="site-container py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">New Service</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new service. Save as Draft first, then publish when ready.
        </p>
      </div>
      <ServiceForm
        categories={categories || []}
        publishedServices={publishedServices || []}
        action={createService}
      />
    </div>
  );
}
