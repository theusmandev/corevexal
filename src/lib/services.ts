/**
 * @deprecated This file is deprecated. It was previously used as a static
 * data source for services. Services are now fetched from the Supabase database.
 * This file is kept only for reference and should not be imported in UI components.
 */
import {
  BadgeDollarSign,
  Banknote,
  Building2,
  Code2,
  CreditCard,
  FileCheck2,
  Globe2,
  Landmark,
  Layers3,
  type LucideIcon,
} from "lucide-react";

export type ServiceCategory = "formation" | "banking" | "payments" | "digital" | "consulting";

export type Service = {
  id: string;
  slug: string;
  category: ServiceCategory;
  title: string;
  shortDescription: string;
  description: string;
  features: string[];
  requirements: string[];
  process: string[];
  faqs: { question: string; answer: string }[];
  relatedServices: string[];
  seoTitle: string;
  seoDescription: string;
  status: "published" | "draft";
  icon: LucideIcon;
};

const sharedDisclaimer =
  "Eligibility, verification, approval, and account availability are determined independently by the relevant institution or provider. Corevexal provides guidance and does not guarantee approval.";

export const services: Service[] = [
  {
    id: "uk-ltd",
    slug: "uk-ltd-formation",
    category: "formation",
    title: "UK LTD Company Formation",
    shortDescription:
      "Structured guidance from registration through the next stages of business setup.",
    description:
      "Set up a UK private limited company with a clear formation pathway, organized documentation, and practical guidance for what comes next.",
    features: [
      "Formation pathway",
      "Company setup guidance",
      "Documentation checklist",
      "Registered address guidance",
      "Post-formation roadmap",
    ],
    requirements: [
      "Proposed company details",
      "Director and shareholder information",
      "Identity and address documentation",
      "Business activity description",
    ],
    process: [
      "Discuss your intended structure",
      "Prepare the required information",
      "Review formation details",
      "Complete registration steps",
      "Plan post-formation setup",
    ],
    faqs: [
      {
        question: "Can a non-UK resident form a UK LTD?",
        answer:
          "Formation may be possible for non-residents, but eligibility and practical requirements depend on individual circumstances and the services you plan to use.",
      },
      {
        question: "Does formation include a bank account?",
        answer:
          "No. Banking providers assess applications independently. Corevexal can provide separate preparation and application guidance.",
      },
    ],
    relatedServices: ["business-banking", "payment-platforms"],
    seoTitle: "UK LTD Company Formation Guidance | Corevexal",
    seoDescription:
      "Structured UK LTD formation guidance, documentation support, and practical next-step planning from Corevexal.",
    status: "published",
    icon: Building2,
  },
  {
    id: "us-llc",
    slug: "us-llc-formation",
    category: "formation",
    title: "US LLC Formation",
    shortDescription: "Build a US business structure with organized formation and setup guidance.",
    description:
      "Understand state selection considerations, prepare formation details, and establish an organized path toward an operational US LLC.",
    features: [
      "LLC formation guidance",
      "State selection considerations",
      "EIN guidance",
      "Documentation planning",
      "Ongoing responsibility overview",
    ],
    requirements: [
      "Member information",
      "Business purpose",
      "Preferred state",
      "Identity and address documentation",
    ],
    process: [
      "Clarify business needs",
      "Consider state options",
      "Prepare formation information",
      "Complete registration steps",
      "Plan EIN and operational setup",
    ],
    faqs: [
      {
        question: "Which state should I choose?",
        answer:
          "The right state depends on where you operate, your business model, costs, and compliance needs. Corevexal provides general considerations, not legal or tax advice.",
      },
      {
        question: "Is an EIN guaranteed?",
        answer:
          "No. The relevant US authority determines issuance and processing. We can help you prepare the required information.",
      },
    ],
    relatedServices: ["business-banking", "payment-platforms"],
    seoTitle: "US LLC Formation Guidance | Corevexal",
    seoDescription:
      "Plan a US LLC with state selection considerations, EIN guidance, documentation support, and clear setup steps.",
    status: "published",
    icon: Landmark,
  },
  {
    id: "banking",
    slug: "business-banking",
    category: "banking",
    title: "Business Banking",
    shortDescription: "Plan banking and multi-currency account infrastructure around your company.",
    description:
      "Compare account types, prepare business documentation, and approach applications with a structure suited to your operations.",
    features: [
      "Business bank account guidance",
      "Multi-currency account guidance",
      "Documentation preparation",
      "Application guidance",
      "Account infrastructure planning",
    ],
    requirements: [
      "Company documents",
      "Ownership information",
      "Business activity details",
      "Expected transaction profile",
      "Identity and address evidence",
    ],
    process: [
      "Assess operational needs",
      "Map suitable account types",
      "Prepare documentation",
      "Support the application process",
      "Plan account workflows",
    ],
    faqs: [{ question: "Does Corevexal open the account?", answer: sharedDisclaimer }],
    relatedServices: ["uk-ltd-formation", "us-llc-formation", "payment-platforms"],
    seoTitle: "Business Banking Setup Guidance | Corevexal",
    seoDescription:
      "Business bank account, multi-currency account, documentation, and application guidance for international companies.",
    status: "published",
    icon: Banknote,
  },
  {
    id: "digital",
    slug: "digital-technology",
    category: "digital",
    title: "Digital & Technology",
    shortDescription: "Build the digital systems that help your business operate and grow.",
    description:
      "Connect your business foundation to a practical digital layer, from web presence and commerce to automation and software.",
    features: [
      "Website development",
      "Next.js development",
      "SaaS products",
      "UI/UX design",
      "E-commerce",
      "Automation",
      "API integration",
      "Software engineering",
    ],
    requirements: [
      "Business goals",
      "Audience and workflow",
      "Existing systems",
      "Scope and timeline",
    ],
    process: [
      "Discover the business need",
      "Define the digital scope",
      "Design the experience",
      "Build and validate",
      "Launch and improve",
    ],
    faqs: [
      {
        question: "Can digital work be added after formation?",
        answer:
          "Yes. Digital services are modular and can be planned once your company and operational foundations are ready.",
      },
    ],
    relatedServices: ["business-banking", "payment-platforms"],
    seoTitle: "Digital & Technology Services | Corevexal",
    seoDescription:
      "Web development, SaaS, e-commerce, automation, API integration, and digital consulting for growing businesses.",
    status: "published",
    icon: Code2,
  },
];

export const paymentPlatforms = ["wise", "payoneer", "paypal", "stripe", "taptap"] as const;
export type PaymentPlatform = (typeof paymentPlatforms)[number];

export const platformContent: Record<
  PaymentPlatform,
  { name: string; suitableFor: string; considerations: string[] }
> = {
  wise: {
    name: "Wise Business",
    suitableFor: "Businesses exploring multi-currency operations and international transfers.",
    considerations: [
      "Company jurisdiction",
      "Business activity",
      "Ownership details",
      "Expected payment flows",
    ],
  },
  payoneer: {
    name: "Payoneer Business",
    suitableFor: "Businesses receiving marketplace or cross-border commercial payments.",
    considerations: [
      "Business registration",
      "Marketplace relationships",
      "Transaction profile",
      "Verification documents",
    ],
  },
  paypal: {
    name: "PayPal Business",
    suitableFor: "Online businesses seeking a widely recognized payment account option.",
    considerations: [
      "Business identity",
      "Website readiness",
      "Product or service clarity",
      "Account verification",
    ],
  },
  stripe: {
    name: "Stripe Business",
    suitableFor: "Digital businesses that need online checkout and programmable payment workflows.",
    considerations: [
      "Supported jurisdiction",
      "Website and policy readiness",
      "Fulfilment model",
      "Business verification",
    ],
  },
  taptap: {
    name: "TapTap Business",
    suitableFor: "Businesses assessing an additional digital payment platform for their market.",
    considerations: [
      "Regional availability",
      "Business eligibility",
      "Use case",
      "Required verification",
    ],
  },
};

export const serviceGroups = [
  {
    title: "Business Formation",
    description: "Establish the company, structure, and documentation.",
    href: "/services/business-formation",
    icon: Building2,
  },
  {
    title: "Business Banking",
    description: "Prepare the financial infrastructure for operations.",
    href: "/services/business-banking",
    icon: Banknote,
  },
  {
    title: "Payment Platforms",
    description: "Navigate setup, documentation, and verification.",
    href: "/services/payment-platforms",
    icon: CreditCard,
  },
  {
    title: "Digital & Technology",
    description: "Build the systems around the business.",
    href: "/services/digital-technology",
    icon: Code2,
  },
] as const;

export const formationServices = [
  { title: "UK LTD Formation", icon: Building2 },
  { title: "US LLC Formation", icon: Globe2 },
  { title: "Company Registration", icon: FileCheck2 },
  { title: "Business Structure Guidance", icon: Layers3 },
  { title: "EIN / Tax ID Guidance", icon: BadgeDollarSign },
  { title: "Registered Address Guidance", icon: Landmark },
];

export const getService = (slug: string) => services.find((service) => service.slug === slug);
export const isPaymentPlatform = (slug: string): slug is PaymentPlatform =>
  paymentPlatforms.includes(slug as PaymentPlatform);
export { sharedDisclaimer };
