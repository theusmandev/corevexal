import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { CtaBand } from "@/components/cta-band";
import {
  getPublishedCategories,
  getPublishedServiceBySlug,
  getAllPublishedServiceSlugs,
} from "@/lib/data/services";
import { ServiceDetail } from "@/components/service-detail";
import type { Metadata, ResolvingMetadata } from "next";
import { getIcon, getCategoryIcon } from "@/lib/icon-registry";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const revalidate = 60;
export const dynamicParams = false;

export async function generateStaticParams() {
  const categories = await getPublishedCategories();
  const serviceSlugs = await getAllPublishedServiceSlugs();

  const categoryParams = categories.map((c) => ({ slug: c.slug }));
  const serviceParams = serviceSlugs.map((slug) => ({ slug }));

  const allSlugs = [...categoryParams, ...serviceParams];
  const unique = Array.from(new Set(allSlugs.map((s) => s.slug))).map((slug) => ({ slug }));
  return unique;
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = await params;

  const categories = await getPublishedCategories();
  const category = categories.find((c) => c.slug === slug);
  if (category) {
    return {
      title: `${category.name} Services | Corevexal`,
      description: category.description,
      openGraph: {
        title: `${category.name} Services | Corevexal`,
        description: category.description,
        type: "website",
      },
      twitter: { card: "summary_large_image" },
      alternates: { canonical: `/services/${slug}` },
    };
  }

  const service = await getPublishedServiceBySlug(slug);
  if (service) {
    return {
      title: service.seo_title || `${service.title} | Corevexal`,
      description: service.seo_description || service.short_description,
      openGraph: {
        title: service.seo_title || service.title,
        description: service.seo_description || service.short_description,
        type: "website",
      },
      twitter: { card: "summary_large_image" },
      alternates: { canonical: `/services/${slug}` },
    };
  }

  return { title: "Not Found" };
}

export default async function CategoryOrServicePage({ params }: Props) {
  const { slug } = await params;

  const categories = await getPublishedCategories();
  const category = categories.find((c) => c.slug === slug);

  if (category) {
    return (
      <main>
        <PageHero
          eyebrow={category.name}
          title={category.name}
          description={category.description}
        />
        <section className="section">
          {category.services && category.services.length > 0 ? (
            <div className="site-container grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
              {category.services.map((service) => {
                const Icon = getIcon(service.icon || "");
                return (
                  <Link
                    href={`/services/${service.slug}`}
                    key={service.slug}
                    className="group min-h-52 bg-background p-7 transition-colors hover:bg-surface block"
                  >
                    <Icon className="size-7 text-primary-text" />
                    <h2 className="mt-10 font-display text-xl font-bold">{service.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {service.short_description}
                    </p>
                    <div className="mt-5 flex items-center justify-between text-sm font-bold text-primary-text opacity-0 transition-opacity group-hover:opacity-100">
                      View Service <ArrowRight className="size-4" />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="site-container py-20 text-center text-muted-foreground">
              Services in this category will be available soon.
            </div>
          )}
        </section>
        <CtaBand />
      </main>
    );
  }

  const service = await getPublishedServiceBySlug(slug);
  if (service) {
    return <ServiceDetail service={service} />;
  }

  notFound();
}
