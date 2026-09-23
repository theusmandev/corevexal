import Link from "next/link";
import { ArrowUpRight, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Brand } from "./brand";
import type { PublicSettings } from "@/lib/data/settings";

const groups = [
  {
    title: "Business Formation",
    links: [
      ["UK LTD", "/services/uk-ltd-formation"],
      ["US LLC", "/services/us-llc-formation"],
      ["Company Setup", "/services/business-formation"],
    ],
  },
  {
    title: "Financial Solutions",
    links: [
      ["Business Banking", "/services/business-banking"],
      ["Wise", "/services/payment-platforms/wise"],
      ["Payoneer", "/services/payment-platforms/payoneer"],
      ["PayPal", "/services/payment-platforms/paypal"],
      ["Stripe", "/services/payment-platforms/stripe"],
      ["TapTap", "/services/payment-platforms/taptap"],
    ],
  },
  {
    title: "Digital",
    links: [
      ["Web Development", "/services/digital-technology"],
      ["Software", "/services/digital-technology"],
      ["SaaS", "/services/digital-technology"],
      ["Automation", "/services/digital-technology"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "/about"],
      ["Solutions", "/solutions"],
      ["Resources", "/resources"],
      ["FAQ", "/faq"],
      ["Contact", "/contact"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy", "/legal/privacy"],
      ["Terms", "/legal/terms"],
      ["Cookies", "/legal/cookies"],
      ["Disclaimer", "/legal/disclaimer"],
    ],
  },
] as const;

export function SiteFooter({ settings }: { settings?: PublicSettings }) {
  const hasContact = settings?.contactInfo && (settings.contactInfo.email || settings.contactInfo.phone || settings.contactInfo.address);
  const hasSocials = settings?.socialLinks && (settings.socialLinks.linkedin || settings.socialLinks.twitter || settings.socialLinks.instagram || settings.socialLinks.facebook);

  return (
    <footer className="bg-deep text-inverse">
      <div className="site-container py-16 lg:py-20">
        <div className="grid gap-12 border-b border-inverse/15 pb-14 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Brand inverse />
            <p className="mt-6 max-w-sm text-sm leading-7 text-inverse-muted">
              Business formation, financial infrastructure, payment setup guidance, and digital
              solutions built around your business.
            </p>
            {(hasContact || hasSocials) && (
              <div className="mt-8 space-y-4 text-sm text-inverse-muted">
                {settings?.contactInfo?.email && (
                  <div>
                    <a href={`mailto:${settings.contactInfo.email}`} className="hover:text-primary-text transition-colors">{settings.contactInfo.email}</a>
                  </div>
                )}
                {settings?.contactInfo?.phone && (
                  <div>
                    <a href={`tel:${settings.contactInfo.phone}`} className="hover:text-primary-text transition-colors">{settings.contactInfo.phone}</a>
                  </div>
                )}
                {settings?.contactInfo?.address && (
                  <div className="whitespace-pre-line">{settings.contactInfo.address}</div>
                )}
                {hasSocials && (
                  <div className="flex items-center gap-4 pt-2">
                    {settings?.socialLinks?.linkedin && (
                      <a href={settings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-primary-text transition-colors">
                        <Linkedin className="size-5" />
                        <span className="sr-only">LinkedIn</span>
                      </a>
                    )}
                    {settings?.socialLinks?.twitter && (
                      <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-primary-text transition-colors">
                        <Twitter className="size-5" />
                        <span className="sr-only">Twitter</span>
                      </a>
                    )}
                    {settings?.socialLinks?.instagram && (
                      <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-primary-text transition-colors">
                        <Instagram className="size-5" />
                        <span className="sr-only">Instagram</span>
                      </a>
                    )}
                    {settings?.socialLinks?.facebook && (
                      <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-primary-text transition-colors">
                        <Facebook className="size-5" />
                        <span className="sr-only">Facebook</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
            <p className="mt-8 text-xs font-bold uppercase text-primary-text">
              Where everything starts at the core
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {groups.map((group) => (
              <div key={group.title}>
                <h2 className="text-xs font-bold uppercase text-inverse">{group.title}</h2>
                <ul className="mt-4 space-y-3">
                  {group.links.map(([label, href]) => {
                    const isExternal = href.startsWith("http");
                    return (
                      <li key={label}>
                        <Link
                          href={href}
                          target={isExternal ? "_blank" : undefined}
                          rel={isExternal ? "noopener noreferrer" : undefined}
                          className="inline-flex items-center gap-1 text-sm text-inverse-muted transition-colors hover:text-primary-text"
                        >
                          {label}
                          {isExternal && <ArrowUpRight className="size-3" />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-7 text-xs text-inverse-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Corevexal. All rights reserved.</p>
          <p>Business guidance with clear boundaries and transparent communication.</p>
        </div>
      </div>
    </footer>
  );
}
