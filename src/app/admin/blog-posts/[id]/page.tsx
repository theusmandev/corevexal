import { notFound } from "next/navigation";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import { DeleteBlogPostButton } from "@/components/admin/delete-blog-post-button";
import { updateBlogPost } from "@/app/actions/blog-posts";
import { createClient } from "@/integrations/supabase/server";
import { requireAdmin } from "@/lib/admin";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: post, error }, { data: categories }] = await Promise.all([
    supabase.from("blog_posts").select("*").eq("id", id).single(),
    supabase.from("blog_categories").select("id, name").order("name"),
  ]);

  if (error || !post) {
    notFound();
  }

  const updateWithId = updateBlogPost.bind(null, id);

  return (
    <div className="site-container py-10">
      <div className="mb-8">
        <Link
          href="/admin/blog-posts"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary-text"
        >
          <ArrowLeft className="size-4" />
          Back to Blog Posts
        </Link>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="font-display text-3xl font-bold">Edit Blog Post</h1>
          <DeleteBlogPostButton id={post.id} />
        </div>
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <BlogPostForm initialData={post as any} categories={categories || []} action={updateWithId} />
    </div>
  );
}
