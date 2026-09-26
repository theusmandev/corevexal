import { notFound } from "next/navigation";
import { BlogCategoryForm } from "@/components/admin/blog-category-form";
import { DeleteBlogCategoryButton } from "@/components/admin/delete-blog-category-button";
import { updateBlogCategory } from "@/app/actions/blog-categories";
import { createClient } from "@/integrations/supabase/server";
import { requireAdmin } from "@/lib/admin";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

export default async function EditBlogCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const { data: category, error } = await supabase
    .from("blog_categories")
    .select(
      `
      *,
      blog_posts(count)
    `,
    )
    .eq("id", id)
    .single();

  if (error || !category) {
    notFound();
  }

  const postCount = Array.isArray(category.blog_posts)
    ? ((category.blog_posts as unknown as { count: number }[])[0]?.count ?? 0)
    : 0;

  const updateWithId = updateBlogCategory.bind(null, id);

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
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="font-display text-3xl font-bold">Edit Blog Category</h1>
          <DeleteBlogCategoryButton id={category.id} postCount={postCount} />
        </div>
      </div>

      <div className="rounded-md border border-border bg-surface p-6 md:p-8">
        <BlogCategoryForm initialData={category} action={updateWithId} />
      </div>
    </div>
  );
}
