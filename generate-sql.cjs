const fs = require("fs");

const categories = [
  {
    slug: "business-formation",
    name: "Business Formation",
    description: "Establish the company, structure, and documentation.",
    display_order: 1,
    status: "published",
  },
  {
    slug: "business-banking",
    name: "Business Banking",
    description: "Prepare the financial infrastructure for operations.",
    display_order: 2,
    status: "published",
  },
  {
    slug: "payment-platforms",
    name: "Payment Platforms",
    description: "Navigate setup, documentation, and verification.",
    display_order: 3,
    status: "published",
  },
  {
    slug: "digital-technology",
    name: "Digital & Technology",
    description: "Build the systems around the business.",
    display_order: 4,
    status: "published",
  },
  {
    slug: "consulting",
    name: "Consulting",
    description: "Strategic guidance for business growth and structure.",
    display_order: 5,
    status: "draft",
  },
];

const services = [
  {
    slug: "uk-ltd-formation",
    category: "business-formation",
    title: "UK LTD Company Formation",
    short_description:
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
    related_services: ["business-banking", "payment-platforms"],
    seo_title: "UK LTD Company Formation Guidance | Corevexal",
    seo_description:
      "Structured UK LTD formation guidance, documentation support, and practical next-step planning from Corevexal.",
    status: "published",
    display_order: 1,
    icon: "Building2",
  },
  {
    slug: "us-llc-formation",
    category: "business-formation",
    title: "US LLC Formation",
    short_description: "Build a US business structure with organized formation and setup guidance.",
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
    related_services: ["business-banking", "payment-platforms"],
    seo_title: "US LLC Formation Guidance | Corevexal",
    seo_description:
      "Plan a US LLC with state selection considerations, EIN guidance, documentation support, and clear setup steps.",
    status: "published",
    display_order: 2,
    icon: "Landmark",
  },
  {
    slug: "business-banking",
    category: "business-banking",
    title: "Business Banking",
    short_description:
      "Plan banking and multi-currency account infrastructure around your company.",
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
    faqs: [
      {
        question: "Does Corevexal open the account?",
        answer:
          "Eligibility, verification, approval, and account availability are determined independently by the relevant institution or provider. Corevexal provides guidance and does not guarantee approval.",
      },
    ],
    related_services: ["uk-ltd-formation", "us-llc-formation", "payment-platforms"],
    seo_title: "Business Banking Setup Guidance | Corevexal",
    seo_description:
      "Business bank account, multi-currency account, documentation, and application guidance for international companies.",
    status: "published",
    display_order: 3,
    icon: "Banknote",
  },
  {
    slug: "digital-technology",
    category: "digital-technology",
    title: "Digital & Technology",
    short_description: "Build the digital systems that help your business operate and grow.",
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
    related_services: ["business-banking", "payment-platforms"],
    seo_title: "Digital & Technology Services | Corevexal",
    seo_description:
      "Web development, SaaS, e-commerce, automation, API integration, and digital consulting for growing businesses.",
    status: "published",
    display_order: 4,
    icon: "Code2",
  },
];

const paymentPlatforms = [
  {
    slug: "wise",
    title: "Wise Business",
    desc: "Businesses exploring multi-currency operations and international transfers.",
    req: [
      "Company jurisdiction",
      "Business activity",
      "Ownership details",
      "Expected payment flows",
    ],
  },
  {
    slug: "payoneer",
    title: "Payoneer Business",
    desc: "Businesses receiving marketplace or cross-border commercial payments.",
    req: [
      "Business registration",
      "Marketplace relationships",
      "Transaction profile",
      "Verification documents",
    ],
  },
  {
    slug: "paypal",
    title: "PayPal Business",
    desc: "Online businesses seeking a widely recognized payment account option.",
    req: [
      "Business identity",
      "Website readiness",
      "Product or service clarity",
      "Account verification",
    ],
  },
  {
    slug: "stripe",
    title: "Stripe Business",
    desc: "Digital businesses that need online checkout and programmable payment workflows.",
    req: [
      "Supported jurisdiction",
      "Website and policy readiness",
      "Fulfilment model",
      "Business verification",
    ],
  },
  {
    slug: "taptap",
    title: "TapTap Business",
    desc: "Businesses assessing an additional digital payment platform for their market.",
    req: ["Regional availability", "Business eligibility", "Use case", "Required verification"],
  },
];

let sql = "";
const escape = (str) => "'" + str.replace(/'/g, "''") + "'";
const jsonb = (obj) => escape(JSON.stringify(obj)) + "::jsonb";

sql += "-- Seed service_categories\n";
for (const cat of categories) {
  sql += `INSERT INTO service_categories (slug, name, description, display_order, status)\n`;
  sql += `VALUES (${escape(cat.slug)}, ${escape(cat.name)}, ${escape(cat.description)}, ${cat.display_order}, ${escape(cat.status)})\n`;
  sql += `ON CONFLICT (slug) DO UPDATE SET\n`;
  sql += `  name = EXCLUDED.name,\n`;
  sql += `  description = EXCLUDED.description,\n`;
  sql += `  display_order = EXCLUDED.display_order,\n`;
  sql += `  status = EXCLUDED.status;\n\n`;
}

sql += "-- Seed services (Standard)\n";
for (const s of services) {
  sql += `INSERT INTO services (category_id, slug, title, short_description, description, features, requirements, process, faqs, related_services, seo_title, seo_description, status, display_order, icon)\n`;
  sql += `VALUES (\n  (SELECT id FROM service_categories WHERE slug = ${escape(s.category)}),\n`;
  sql += `  ${escape(s.slug)}, ${escape(s.title)}, ${escape(s.short_description)}, ${escape(s.description)}, ${jsonb(s.features)}, ${jsonb(s.requirements)}, ${jsonb(s.process)}, ${jsonb(s.faqs)}, ${jsonb(s.related_services)}, ${escape(s.seo_title)}, ${escape(s.seo_description)}, ${escape(s.status)}, ${s.display_order}, ${escape(s.icon)}\n`;
  sql += `)\nON CONFLICT (slug) DO UPDATE SET\n`;
  sql += `  category_id = EXCLUDED.category_id,\n`;
  sql += `  title = EXCLUDED.title,\n`;
  sql += `  short_description = EXCLUDED.short_description,\n`;
  sql += `  description = EXCLUDED.description,\n`;
  sql += `  features = EXCLUDED.features,\n`;
  sql += `  requirements = EXCLUDED.requirements,\n`;
  sql += `  process = EXCLUDED.process,\n`;
  sql += `  faqs = EXCLUDED.faqs,\n`;
  sql += `  related_services = EXCLUDED.related_services,\n`;
  sql += `  seo_title = EXCLUDED.seo_title,\n`;
  sql += `  seo_description = EXCLUDED.seo_description,\n`;
  sql += `  status = EXCLUDED.status,\n`;
  sql += `  display_order = EXCLUDED.display_order,\n`;
  sql += `  icon = EXCLUDED.icon;\n\n`;
}

sql += "-- Seed services (Payment Platforms)\n";
let platOrder = 5;
for (const p of paymentPlatforms) {
  const seoTitle = p.title + " Setup Guidance | Corevexal";
  sql += `INSERT INTO services (category_id, slug, title, short_description, description, features, requirements, process, faqs, related_services, seo_title, seo_description, status, display_order, icon)\n`;
  sql += `VALUES (\n  (SELECT id FROM service_categories WHERE slug = 'payment-platforms'),\n`;
  sql += `  ${escape(p.slug)}, ${escape(p.title)}, ${escape(p.desc)}, ${escape(p.desc)}, ${jsonb([])}, ${jsonb(p.req)}, ${jsonb([])}, ${jsonb([])}, ${jsonb([])}, ${escape(seoTitle)}, ${escape(seoTitle)}, 'published', ${platOrder++}, 'CreditCard'\n`;
  sql += `)\nON CONFLICT (slug) DO UPDATE SET\n`;
  sql += `  category_id = EXCLUDED.category_id,\n`;
  sql += `  title = EXCLUDED.title,\n`;
  sql += `  short_description = EXCLUDED.short_description,\n`;
  sql += `  description = EXCLUDED.description,\n`;
  sql += `  features = EXCLUDED.features,\n`;
  sql += `  requirements = EXCLUDED.requirements,\n`;
  sql += `  process = EXCLUDED.process,\n`;
  sql += `  faqs = EXCLUDED.faqs,\n`;
  sql += `  related_services = EXCLUDED.related_services,\n`;
  sql += `  seo_title = EXCLUDED.seo_title,\n`;
  sql += `  seo_description = EXCLUDED.seo_description,\n`;
  sql += `  status = EXCLUDED.status,\n`;
  sql += `  display_order = EXCLUDED.display_order,\n`;
  sql += `  icon = EXCLUDED.icon;\n\n`;
}

fs.writeFileSync("supabase/migrations/20260922071053_seed_services.sql", sql);
