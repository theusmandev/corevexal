import { PageHero } from "@/components/page-hero";
import { CtaBand } from "@/components/cta-band";
import type { Metadata } from "next";

const sections = [
  ["Our Philosophy", "Strong businesses begin with deliberate foundations. We focus on the company, structure, accounts, and systems that make responsible growth possible."],
  ["Our Approach", "We turn complex setup journeys into clear stages, helping clients understand what to prepare, what to expect, and where third-party decisions apply."],
  ["What We Do", "Corevexal brings formation guidance, financial infrastructure consulting, payment platform support, and digital delivery into one connected service model."],
  ["Who We Serve", "Entrepreneurs, international founders, online businesses, and established companies preparing for a new market or operational stage."],
  ["Our Vision", "A simpler way for businesses to establish the core infrastructure they need, with services that expand as their needs evolve."],
];

export const metadata: Metadata = {
  title: "About Corevexal | Everything Starts at the Core",
  description: "Corevexal brings formation, financial infrastructure, payment setup, and digital technology together.",
  openGraph: {
    title: "About Corevexal",
    description: "Everything starts at the core.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    canonical: "/about",
  },
};

export default function About() {
  return (
    <main>
      <PageHero
        eyebrow="About Corevexal"
        title="Everything Starts at the Core."
        description="Businesses need strong foundations before they can scale. Corevexal brings company formation, financial infrastructure, payment setup, and digital technology together so businesses can build from a stronger core."
      />
      <section className="section">
        <div className="site-container divide-y divide-border">
          {sections.map(([a, b], i) => (
            <article key={a} className="grid gap-5 py-10 md:grid-cols-[8rem_1fr_1fr]">
              <span className="font-mono text-sm text-primary-text">0{i + 1}</span>
              <h2 className="font-display text-2xl font-bold">{a}</h2>
              <p className="leading-7 text-muted-foreground">{b}</p>
            </article>
          ))}
        </div>
      </section>
      <CtaBand />
    </main>
  );
}
