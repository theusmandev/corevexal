import { BookOpen, ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts, getAllBlogCategories } from "@/lib/data/blog";

export const metadata: Metadata = {
  title: "Business Resources & Guides | Corevexal",
  description:
    "Practical guides about company formation, banking, payment platforms, and digital business.",
  openGraph: {
    title: "Corevexal Resources",
    description: "Practical guidance for building your business foundation.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

const formatDate = (dateStr: string) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
};

export default async function Resources() {
  const posts = await getPublishedPosts();
  const categories = await getAllBlogCategories();

  return (
    <main>
      <PageHero
        eyebrow="Resources"
        title="Clarity Before the Next Step."
        description="A growing library of practical guidance for founders building company, financial, payment, and digital infrastructure."
      />
      <section className="section bg-surface">
        <div className="site-container">
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span
                  className="border border-border bg-background px-3 py-2 text-xs font-semibold"
                  key={cat.id}
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}

          {posts.length === 0 ? (
            <div className="mt-10 py-20 text-center">
              <BookOpen className="mx-auto size-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-bold">No articles published yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Check back soon for new business guides and resources.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-px bg-border grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
              {posts.map((post) => (
                <Link
                  href={`/resources/${post.slug}`}
                  key={post.id}
                  className="group relative flex flex-col min-h-64 bg-background p-7 hover:bg-muted/30 transition-colors"
                >
                  {post.featured_image_url ? (
                    <div className="mb-6 -mx-7 -mt-7 overflow-hidden h-48 border-b border-border bg-muted">
                      <img
                        src={post.featured_image_url}
                        alt={post.featured_image_alt || post.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <BookOpen className="size-6 text-primary-text" />
                  )}

                  <div className="flex-1 mt-auto">
                    <p className="mt-12 text-xs font-bold uppercase text-muted-foreground flex justify-between items-center gap-4">
                      <span>{post.category?.name || "Uncategorized"}</span>
                      {post.published_at && <span>{formatDate(post.published_at)}</span>}
                    </p>
                    <h2 className="mt-3 font-display text-xl font-bold group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      Read article <ArrowUpRight className="size-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
