import { PageHero } from "@/components/page-hero";
import { FaqClient } from "./faq-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Corevexal",
  description: "Answers about company formation, business banking, payment platforms, and digital services.",
  openGraph: {
    title: "Corevexal FAQ",
    description: "Clear answers about Corevexal services and third-party approval boundaries.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function FaqPage() {
  return (
    <main>
      <PageHero
        eyebrow="FAQ"
        title="Clear Answers. Clear Boundaries."
        description="Search common questions about formation, financial infrastructure, payment platforms, and digital services."
      />
      <section className="section">
        <FaqClient />
      </section>
    </main>
  );
}
