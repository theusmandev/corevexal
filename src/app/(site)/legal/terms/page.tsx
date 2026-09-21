import { LegalPage } from "@/components/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
 title: "Terms of Use | Corevexal",
 description: "Terms governing use of the Corevexal website and consulting information.",
 openGraph: {
 title: "Terms of Use | Corevexal",
 description: "Corevexal website terms.",
 type: "website",
 },
 twitter: {
 card: "summary_large_image",
 },
};

export default function TermsOfUse() {
 return (
 <LegalPage
 title="Terms of Use"
 intro="These terms describe the general basis for using the Corevexal website. Service-specific terms should be agreed before an engagement begins."
 sections={[
 {
 title: "Website information",
 body: "Website content is general information and does not constitute legal, tax, accounting, or regulated financial advice.",
 },
 {
 title: "Third-party services",
 body: "Banks, payment platforms, authorities, and other providers maintain their own rules and make independent decisions.",
 },
 {
 title: "Service engagements",
 body: "Scope, fees, responsibilities, and deliverables should be confirmed in a separate written service agreement.",
 },
 ]}
 />
 );
}
