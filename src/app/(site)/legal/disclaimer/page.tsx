import { LegalPage } from "@/components/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service Disclaimer | Corevexal",
  description:
    "Important boundaries for Corevexal formation, banking, payment, and consulting services.",
  openGraph: {
    title: "Service Disclaimer | Corevexal",
    description: "Important service and third-party approval information.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function Disclaimer() {
  return (
    <LegalPage
      title="Service Disclaimer"
      intro="Clear boundaries are part of responsible business guidance."
      sections={[
        {
          title: "Independent providers",
          body: "Corevexal provides business formation, financial technology setup guidance, and consulting services. Third-party financial institutions, payment platforms, and other service providers independently determine eligibility, verification, approval, account access, and ongoing compliance. Corevexal does not guarantee approval or account opening.",
        },
        {
          title: "No regulated status implied",
          body: "Corevexal is not presented as a bank or financial institution. No official affiliation with a bank, payment platform, or government agency is implied unless expressly confirmed.",
        },
        {
          title: "Professional advice",
          body: "Formation, legal, tax, and compliance requirements depend on individual circumstances. Consider qualified legal, tax, or accounting advice where appropriate.",
        },
      ]}
    />
  );
}
