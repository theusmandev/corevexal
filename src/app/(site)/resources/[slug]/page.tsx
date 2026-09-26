import { notFound } from "next/navigation";
import { getPublishedPostBySlug } from "@/lib/data/blog";
import { BlogRenderer } from "@/components/blog-renderer";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

const siteUrl = process.env["NEXT_PUBLIC_APP_URL"] || "https://corevexal.com";

const formatDate = (dateStr: string) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt;
  const image = post.featured_image_url || `${siteUrl}/opengraph-image.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.published_at || post.created_at,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at,
    image: post.featured_image_url ? [post.featured_image_url] : [],
    publisher: {
      "@type": "Organization",
      name: "Corevexal",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/brand/mark.svg`,
      },
    },
    author: {
      "@type": "Organization",
      name: "Corevexal",
      url: siteUrl,
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="section bg-surface min-h-screen">
        <div className="site-container max-w-3xl pt-10 pb-20">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-12"
          >
            <ArrowLeft className="size-4" />
            Back to Resources
          </Link>

          <header className="mb-12">
            <div className="flex items-center gap-4 text-sm font-bold uppercase text-primary mb-6">
              <span>{post.category?.name || "Uncategorized"}</span>
              <span className="text-muted-foreground/40">•</span>
              <time
                className="text-muted-foreground"
                dateTime={post.published_at || post.created_at}
              >
                {formatDate(post.published_at || post.created_at)}
              </time>
            </div>

            <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl lg:text-6xl text-primary-text mb-6">
              {post.title}
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed">{post.excerpt}</p>
          </header>

          {post.featured_image_url && (
            <div className="mb-14 overflow-hidden rounded-xl border border-border bg-muted">
              <img
                src={post.featured_image_url}
                alt={post.featured_image_alt || post.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          <div className="mt-12 bg-background p-8 md:p-12 rounded-2xl border border-border">
            <BlogRenderer content={post.content} />
          </div>
        </div>
      </article>
    </main>
  );
}
