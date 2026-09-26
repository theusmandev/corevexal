import { BookOpen, ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import type { Metadata } from "next";

const topics = [
  "UK LTD vs US LLC: What Is the Difference?",
  "Business Banking: What Should You Prepare Before Applying?",
  "Understanding Business Payment Platforms",
  "Wise Business Setup: What Information May Be Required?",
  "How to Build Business Infrastructure for an Online Company",
  "Business Formation Checklist",
];

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

export default function Resources() {
  return (
    <main>
      <PageHero
        eyebrow="Resources"
        title="Clarity Before the Next Step."
        description="A growing library of practical guidance for founders building company, financial, payment, and digital infrastructure."
      />
      <section className="section bg-surface">
        <div className="site-container">
          <div className="flex flex-wrap gap-2">
            {[
              "Business Formation",
              "UK LTD",
              "US LLC",
              "Business Banking",
              "Payment Platforms",
              "Digital Business",
              "Technology",
              "Guides",
            ].map((x) => (
              <span
                className="border border-border bg-background px-3 py-2 text-xs font-semibold"
                key={x}
              >
                {x}
              </span>
            ))}
          </div>
          <div className="mt-10 grid gap-px bg-border grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
            {topics.map((x, i) => (
              <article className="min-h-64 bg-background p-7" key={x}>
                <BookOpen className="size-6 text-primary-text" />
                <p className="mt-12 text-xs font-bold uppercase text-muted-foreground">
                  Future guide · 0{i + 1}
                </p>
                <h2 className="mt-3 font-display text-xl font-bold">{x}</h2>
                <span className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
                  Coming soon <ArrowUpRight className="size-4" />
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
