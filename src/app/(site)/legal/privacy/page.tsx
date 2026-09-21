import { LegalPage } from "@/components/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
 title: "Privacy Policy | Corevexal",
 description: "How Corevexal handles information submitted through this website.",
 openGraph: {
 title: "Privacy Policy | Corevexal",
 description: "Corevexal privacy information.",
 type: "website",
 },
 twitter: {
 card: "summary_large_image",
 },
};

export default function PrivacyPolicy() {
 return (
 <LegalPage
 title="Privacy Policy"
 intro="This policy explains the types of information Corevexal may collect through this website and how that information is used."
 sections={[
 {
 title: "Information you provide",
 body: "When you submit a request, we collect the contact, company, service, and message information you choose to provide.",
 },
 {
 title: "How information is used",
 body: "Information is used to review enquiries, communicate about requested services, improve service delivery, and meet applicable operational or legal requirements.",
 },
 {
 title: "Data choices",
 body: "You may request access, correction, or deletion of your information where applicable. Formal contact details and retention periods should be confirmed before publication.",
 },
 ]}
 />
 );
}
