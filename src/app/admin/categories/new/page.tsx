import { CategoryForm } from "@/components/admin/category-form";
import { createCategory } from "@/app/actions/categories";

export const dynamic = "force-dynamic";
export const metadata = { title: "New Category | Admin", robots: { index: false } };

export default function NewCategoryPage() {
  return (
    <div className="site-container py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">New Category</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new service category. Categories group related services on the public site.
        </p>
      </div>
      <CategoryForm action={createCategory} />
    </div>
  );
}
