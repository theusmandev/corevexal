import { PageHero } from "@/components/page-hero";
import { ContactForm } from "@/components/contact-form";
import type { Metadata } from "next";
import { getPublicSettings } from "@/lib/data/settings";
import { getPublishedCategories } from "@/lib/data/services";

export const metadata: Metadata = {
  title: "Contact Corevexal | Start a Request",
  description: "Tell Corevexal what you are building and what you need help setting up.",
  openGraph: {
    title: "Start at the Core | Corevexal",
    description: "Start a formation, banking, payment, or digital service request.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    canonical: "/contact",
  },
};

export default async function ContactPage() {
  const { contactInfo } = await getPublicSettings();
  const hasContact = contactInfo && (contactInfo.email || contactInfo.phone || contactInfo.address);

  let serviceOptions: string[] = [];
  try {
    const categories = await getPublishedCategories();
    serviceOptions = categories.flatMap((cat) => cat.services.map((s) => s.title));
  } catch (error) {
    console.error("Failed to fetch service options:", error);
  }

  return (
    <main>
      <PageHero
        eyebrow="Get started"
        title="Start at the Core."
        description="Tell us what you're building and what you need help setting up."
      />
      <section className="section">
        <div className="site-container grid gap-12 lg:grid-cols-[.55fr_1fr]">
          <aside>
            <h2 className="font-display text-2xl font-bold">A structured first step.</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Share your current position and intended service. We’ll use this information to
              understand the most relevant next step.
            </p>
            {hasContact && (
              <div className="mt-8 space-y-4 text-sm text-foreground">
                {contactInfo.email && (
                  <div>
                    <strong className="block text-xs uppercase text-muted-foreground">Email</strong>
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                )}
                {contactInfo.phone && (
                  <div>
                    <strong className="block text-xs uppercase text-muted-foreground">Phone</strong>
                    <div className="flex flex-col gap-1 items-start mt-1">
                      <a
                        href={`tel:${contactInfo.phone}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {contactInfo.phone}
                      </a>
                      <a
                        href={`https://wa.me/${contactInfo.phone.replace(/\D/g, "")}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Message us on WhatsApp &rarr;
                      </a>
                    </div>
                  </div>
                )}
                {contactInfo.address && (
                  <div>
                    <strong className="block text-xs uppercase text-muted-foreground">
                      Address
                    </strong>
                    <p className="whitespace-pre-line">{contactInfo.address}</p>
                  </div>
                )}
              </div>
            )}
            <p className="mt-8 border-l-2 border-primary pl-5 text-sm leading-6 text-muted-foreground">
              Submitting a request does not create an advisor-client relationship or guarantee
              third-party eligibility or approval.
            </p>
          </aside>
          <ContactForm serviceOptions={serviceOptions} />
        </div>
      </section>
    </main>
  );
}
