import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { CtaBand } from "@/components/cta-band";
import { paymentPlatforms, platformContent, sharedDisclaimer } from "@/lib/services";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Platform Setup Guidance | Corevexal",
  description: "Setup and documentation guidance for Wise, Payoneer, PayPal, Stripe, and TapTap.",
  openGraph: {
    title: "Payment Platform Setup Guidance | Corevexal",
    description: "Connect your business to modern payment infrastructure.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function PaymentPlatforms() {
  return (
    <main>
      <PageHero
        eyebrow="Payment platforms"
        title="Connect Your Business to Modern Payment Infrastructure."
        description="Evaluate platform fit, prepare business information, and navigate setup and verification with structured guidance."
      />
      <section className="section bg-surface">
        <div className="site-container grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
          {paymentPlatforms.map((p) => (
            <Link
              href={`/services/payment-platforms/${p}`}
              key={p}
              className="group bg-background p-7"
            >
              <p className="text-xs font-bold uppercase text-primary-text">
                Independent setup guidance
              </p>
              <h2 className="mt-8 font-display text-3xl font-bold">
                {platformContent[p].name}
              </h2>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                {[
                  "Business setup guidance",
                  "Documentation support",
                  "Application guidance",
                  "Operational considerations",
                ].map((x) => (
                  <li className="flex gap-2" key={x}>
                    <Check className="size-4 text-primary-text" />
                    {x}
                  </li>
                ))}
              </ul>
              <span className="mt-8 inline-flex items-center gap-2 font-bold">
                Learn More <ArrowRight className="size-4" />
              </span>
            </Link>
          ))}
        </div>
        <p className="site-container mt-10 max-w-3xl border-l-2 border-primary pl-5 text-sm text-muted-foreground">
          {sharedDisclaimer} Corevexal is not presented as an official partner of these platforms.
        </p>
      </section>
      <CtaBand />
    </main>
  );
}
