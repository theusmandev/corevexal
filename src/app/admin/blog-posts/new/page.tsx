import { BlogPostForm } from "@/components/admin/blog-post-form";
import { createBlogPost } from "@/app/actions/blog-posts";
import { requireAdmin } from "@/lib/admin";
import { createClient } from "@/integrations/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

export default async function NewBlogPostPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("blog_categories")
    .select("id, name")
    .order("name");

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
        <h1 className="font-display text-3xl font-bold">New Blog Post</h1>
      </div>

      <BlogPostForm action={createBlogPost} categories={categories || []} />
    </div>
  );
}
