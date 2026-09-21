import { PageHero } from "@/components/page-hero";
import { ContactForm } from "@/components/contact-form";
import type { Metadata } from "next";

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

export default function ContactPage() {
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
 Share your current position and intended service. We’ll use this information
 to understand the most relevant next step.
 </p>
 <p className="mt-8 border-l-2 border-primary pl-5 text-sm leading-6 text-muted-foreground">
 Submitting a request does not create an advisor-client relationship or
 guarantee third-party eligibility or approval.
 </p>
 </aside>
 <ContactForm />
 </div>
 </section>
 </main>
 );
}
