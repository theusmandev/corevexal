import { LegalPage } from "@/components/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
 title: "Cookie Policy | Corevexal",
 description: "Information about cookies used by the Corevexal website.",
 openGraph: {
 title: "Cookie Policy | Corevexal",
 description: "Corevexal cookie information.",
 type: "website",
 },
 twitter: {
 card: "summary_large_image",
 },
};

export default function CookiePolicy() {
 return (
 <LegalPage
 title="Cookie Policy"
 intro="This website may use essential cookies required for reliable and secure operation."
 sections={[
 {
 title: "Essential cookies",
 body: "Essential cookies support core site functions and cannot be switched off through the site.",
 },
 {
 title: "Analytics and marketing",
 body: "No non-essential analytics or marketing cookies are described as active in this version of the website. If added later, this policy and consent controls should be updated.",
 },
 {
 title: "Browser controls",
 body: "You can control cookies through your browser settings, though disabling essential cookies may affect site functionality.",
 },
 ]}
 />
 );
}
