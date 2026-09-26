import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createClient } from "@/integrations/supabase/server";
import { BlogRenderer } from "@/components/blog-renderer";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

const siteUrl = process.env["NEXT_PUBLIC_APP_URL"] || "https://corevexal.com";

const formatDate = (dateStr: string) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
};

export default async function AdminBlogPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdmin();
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("*, category:blog_categories(name)")
    .eq("slug", slug)
    .single();

  if (error || !post) {
    notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = post as any;

  const categoryName =
    p.category && !Array.isArray(p.category) ? p.category.name : "Uncategorized";

  return (
    <main>
      <div className="bg-amber-500/10 text-amber-700 dark:text-amber-400 p-3 text-center text-sm font-semibold border-b border-amber-500/20">
        ADMIN PREVIEW MODE — Viewing live draft data for: {p.slug}
      </div>

      <article className="section bg-surface min-h-screen">
        <div className="site-container max-w-3xl pt-10 pb-20">
          <header className="mb-12">
            <div className="flex items-center gap-4 text-sm font-bold uppercase text-primary mb-6">
              <span>{categoryName}</span>
              <span className="text-muted-foreground/40">•</span>
              <time
                className="text-muted-foreground"
                dateTime={p.published_at || p.created_at}
              >
                {formatDate(p.published_at || p.created_at)}
              </time>
            </div>

            <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl lg:text-6xl text-primary-text mb-6">
              {p.title}
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed">{p.excerpt}</p>
          </header>

          {p.featured_image_url && (
            <div className="mb-14 overflow-hidden rounded-xl border border-border bg-muted">
              <img
                src={p.featured_image_url}
                alt={p.featured_image_alt || p.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          <div className="mt-12 bg-background p-8 md:p-12 rounded-2xl border border-border">
            <BlogRenderer content={p.content} />
          </div>
        </div>
      </article>
    </main>
  );
}
