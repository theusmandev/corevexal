import { BlogCategoryForm } from "@/components/admin/blog-category-form";
import { createBlogCategory } from "@/app/actions/blog-categories";
import { requireAdmin } from "@/lib/admin";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

export default async function NewBlogCategoryPage() {
  await requireAdmin();

  return (
    <div className="site-container py-10">
      <div className="mb-8">
        <Link
          href="/admin/blog-categories"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary-text"
        >
          <ArrowLeft className="size-4" />
          Back to Blog Categories
        </Link>
        <h1 className="font-display text-3xl font-bold">New Blog Category</h1>
      </div>

      <div className="rounded-md border border-border bg-surface p-6 md:p-8">
        <BlogCategoryForm action={createBlogCategory} />
      </div>
    </div>
  );
}
