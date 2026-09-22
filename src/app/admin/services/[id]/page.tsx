import { notFound } from "next/navigation";
import { createClient } from "@/integrations/supabase/server";
import { ServiceForm } from "@/components/admin/service-form";
import { DeleteServiceButton } from "@/components/admin/delete-service-button";
import { updateService } from "@/app/actions/services";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

type Props = { params: Promise<{ id: string }> };

export default async function EditServicePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: svc } = await supabase.from("services").select("*").eq("id", id).single();
  if (!svc) notFound();

  const { data: categories } = await supabase
    .from("service_categories")
    .select("id, name, status")
    .order("display_order", { ascending: true });

  // Published services excluding this one (for related_services multi-select)
  const { data: publishedServices } = await supabase
    .from("services")
    .select("id, slug, title")
    .eq("status", "published")
    .neq("id", id)
    .order("title", { ascending: true });

  const boundUpdate = updateService.bind(null, id);

  // Parse jsonb fields safely
  const features = Array.isArray(svc.features) ? (svc.features as string[]) : [];
  const requirements = Array.isArray(svc.requirements) ? (svc.requirements as string[]) : [];
  const process = Array.isArray(svc.process) ? (svc.process as string[]) : [];
  const faqs = Array.isArray(svc.faqs) ? (svc.faqs as { question: string; answer: string }[]) : [];
  const related_services = Array.isArray(svc.related_services)
    ? (svc.related_services as string[])
    : [];

  return (
    <div className="site-container py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Edit Service</h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">{svc.slug}</p>
        </div>
        <DeleteServiceButton id={id} />
      </div>
      <ServiceForm
        initialData={{
          id: svc.id,
          category_id: svc.category_id,
          title: svc.title,
          slug: svc.slug,
          short_description: svc.short_description,
          description: svc.description,
          icon: svc.icon,
          features,
          requirements,
          process,
          faqs,
          related_services,
          seo_title: svc.seo_title,
          seo_description: svc.seo_description,
          status: svc.status,
          display_order: svc.display_order,
        }}
        categories={categories || []}
        publishedServices={publishedServices || []}
        action={boundUpdate}
      />
    </div>
  );
}
