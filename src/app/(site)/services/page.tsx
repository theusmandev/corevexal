import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { CtaBand } from "@/components/cta-band";
import { getPublishedCategories } from "@/lib/data/services";
import { getCategoryIcon } from "@/lib/icon-registry";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Services | Corevexal",
  description: "Business formation, banking, payment setup, and digital services.",
  openGraph: {
    title: "Corevexal Services",
    description: "Build your business foundation with connected services.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    canonical: "/services",
  },
};

export default async function Services() {
  const categories = await getPublishedCategories();

  return (
    <main>
      <PageHero
        eyebrow="Services"
        title="One Core. Multiple Solutions."
        description="Build your company, financial infrastructure, payment capability, and digital operations through a connected service system."
      />
      <section className="section">
        <div className="site-container grid gap-px bg-border md:grid-cols-2">
          {categories.map((cat, i) => {
            const Icon = getCategoryIcon(cat.slug);
            return (
              <Link
                key={cat.slug}
                href={`/services/${cat.slug}`}
                className="group min-h-72 bg-background p-8 transition-colors hover:bg-surface"
              >
                <div className="flex justify-between">
                  <span className="font-mono text-sm text-primary-text">0{i + 1}</span>
                  <Icon className="size-7 text-muted-foreground group-hover:text-primary-text" />
                </div>
                <h2 className="mt-16 font-display text-3xl font-bold">{cat.name}</h2>
                <p className="mt-4 max-w-md leading-7 text-muted-foreground">{cat.description}</p>
                <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold">
                  Explore <ArrowRight className="size-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
      <CtaBand />
    </main>
  );
}
