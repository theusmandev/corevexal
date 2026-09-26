import { notFound } from "next/navigation";
import { createClient } from "@/integrations/supabase/server";
import { CategoryForm } from "@/components/admin/category-form";
import { DeleteCategoryButton } from "@/components/admin/delete-category-button";
import { updateCategory } from "@/app/actions/categories";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

type Props = { params: Promise<{ id: string }> };

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: cat } = await supabase
    .from("service_categories")
    .select("*, services(count)")
    .eq("id", id)
    .single();

  if (!cat) notFound();

  const svcCount = Array.isArray(cat.services)
    ? ((cat.services as unknown as { count: number }[])[0]?.count ?? 0)
    : 0;

  const boundUpdate = updateCategory.bind(null, id);

  const { count: pubCount } = await supabase
    .from("services")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id)
    .eq("status", "published");

  const publishedServiceCount = pubCount ?? 0;

  return (
    <div className="site-container py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Edit Category</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {svcCount} service{svcCount === 1 ? "" : "s"} in this category.
          </p>
        </div>
        <DeleteCategoryButton id={id} serviceCount={svcCount} />
      </div>
      <CategoryForm
        initialData={{
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          display_order: cat.display_order,
          status: cat.status,
        }}
        publishedServiceCount={publishedServiceCount}
        action={boundUpdate}
      />
    </div>
  );
}
