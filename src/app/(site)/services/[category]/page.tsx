import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { CtaBand } from "@/components/cta-band";
import { formationServices, getService } from "@/lib/services";
import { ServiceDetail } from "@/components/service-detail";
import type { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const { category } = await params;

  if (category === "business-formation") {
    return {
      title: "Business Formation Services | Corevexal",
      description: "UK LTD, US LLC, registration, structure, tax ID, and documentation guidance.",
      openGraph: {
        title: "Business Formation Services | Corevexal",
        description: "Build your company on a clear, structured foundation.",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
      },
      alternates: {
        canonical: `/services/${category}`,
      },
    };
  }

  const service = getService(category);
  if (service) {
    return {
      title: service.seoTitle ?? "Service not found | Corevexal",
      description: service.seoDescription ?? "Corevexal service information.",
      openGraph: {
        title: service.seoTitle ?? "Corevexal",
        description: service.seoDescription ?? "Corevexal service information.",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
      },
      alternates: {
        canonical: `/services/${category}`,
      },
    };
  }

  return { title: "Not Found" };
}

export default async function CategoryOrServicePage({ params }: Props) {
  const { category } = await params;

  if (category === "business-formation") {
    return (
      <main>
        <PageHero
          eyebrow="Business formation"
          title="Form Your Business With Confidence."
          description="Choose the right business structure, organize the required information, and prepare the foundation for your next step."
        />
        <section className="section">
          <div className="site-container grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
            {formationServices.map(({ title, icon: Icon }) => (
              <div className="min-h-52 bg-background p-7" key={title}>
                <Icon className="size-7 text-primary-text" />
                <h2 className="mt-10 font-display text-xl font-bold">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Structured setup and documentation guidance tailored to the service.
                </p>
              </div>
            ))}
          </div>
          <div className="site-container mt-12 grid gap-4 md:grid-cols-2">
            {[
              ["UK LTD Formation", "/services/uk-ltd-formation"],
              ["US LLC Formation", "/services/us-llc-formation"],
            ].map(([label, to]) => (
              <Link
                key={label}
                href={to as string}
                className="flex items-center justify-between border border-border p-6 font-bold hover:border-primary"
              >
                {label}
                <ArrowRight />
              </Link>
            ))}
          </div>
        </section>
        <CtaBand />
      </main>
    );
  }

  const service = getService(category);
  if (service) {
    return <ServiceDetail service={service} />;
  }

  notFound();
}
