import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { CtaBand } from "@/components/cta-band";
import type { Metadata } from "next";

const items = [
  [
    "Starting a New Business",
    "Formation, structure, documentation, and next-step planning.",
    "/services/business-formation",
  ],
  [
    "Expanding Internationally",
    "Consider company structures, accounts, and operational requirements.",
    "/services/business-formation",
  ],
  [
    "Setting Up Business Banking",
    "Prepare a stronger account application and financial workflow.",
    "/services/business-banking",
  ],
  [
    "Receiving Business Payments",
    "Evaluate payment platforms and prepare for verification.",
    "/services/payment-platforms",
  ],
  [
    "Building an Online Business",
    "Connect formation, payments, commerce, and digital presence.",
    "/services/digital-technology",
  ],
  [
    "Launching a Digital Product",
    "Plan and build websites, applications, SaaS, and integrations.",
    "/services/digital-technology",
  ],
  [
    "Modernizing Operations",
    "Use automation and connected systems to improve business workflows.",
    "/services/digital-technology",
  ],
] as const;

export const metadata: Metadata = {
  title: "Business Solutions | Corevexal",
  description: "Explore Corevexal solutions organized around what your business needs next.",
  openGraph: {
    title: "Business Solutions | Corevexal",
    description: "Connected formation, financial, payment, and digital solutions.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    canonical: "/solutions",
  },
};

export default function Solutions() {
  return (
    <main>
      <PageHero
        eyebrow="Solutions"
        title="Built Around Where You Are Going."
        description="Choose a pathway based on the outcome your business needs, not a list of disconnected technologies."
      />
      <section className="section">
        <div className="site-container grid gap-px bg-border md:grid-cols-2">
          {items.map(([a, b, to]) => (
            <Link key={a} href={to} className="group min-h-52 bg-background p-7 hover:bg-surface">
              <h2 className="font-display text-2xl font-bold">{a}</h2>
              <p className="mt-4 max-w-lg leading-7 text-muted-foreground">{b}</p>
              <ArrowRight className="mt-7 text-primary-text transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>
      <CtaBand />
    </main>
  );
}
