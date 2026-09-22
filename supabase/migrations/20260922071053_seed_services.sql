-- Seed service_categories
INSERT INTO service_categories (slug, name, description, display_order, status)
VALUES ('business-formation', 'Business Formation', 'Establish the company, structure, and documentation.', 1, 'published')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  status = EXCLUDED.status;

INSERT INTO service_categories (slug, name, description, display_order, status)
VALUES ('business-banking', 'Business Banking', 'Prepare the financial infrastructure for operations.', 2, 'published')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  status = EXCLUDED.status;

INSERT INTO service_categories (slug, name, description, display_order, status)
VALUES ('payment-platforms', 'Payment Platforms', 'Navigate setup, documentation, and verification.', 3, 'published')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  status = EXCLUDED.status;

INSERT INTO service_categories (slug, name, description, display_order, status)
VALUES ('digital-technology', 'Digital & Technology', 'Build the systems around the business.', 4, 'published')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  status = EXCLUDED.status;

INSERT INTO service_categories (slug, name, description, display_order, status)
VALUES ('consulting', 'Consulting', 'Strategic guidance for business growth and structure.', 5, 'draft')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  status = EXCLUDED.status;

-- Seed services (Standard)
INSERT INTO services (category_id, slug, title, short_description, description, features, requirements, process, faqs, related_services, seo_title, seo_description, status, display_order, icon)
VALUES (
  (SELECT id FROM service_categories WHERE slug = 'business-formation'),
  'uk-ltd-formation', 'UK LTD Company Formation', 'Structured guidance from registration through the next stages of business setup.', 'Set up a UK private limited company with a clear formation pathway, organized documentation, and practical guidance for what comes next.', '["Formation pathway","Company setup guidance","Documentation checklist","Registered address guidance","Post-formation roadmap"]'::jsonb, '["Proposed company details","Director and shareholder information","Identity and address documentation","Business activity description"]'::jsonb, '["Discuss your intended structure","Prepare the required information","Review formation details","Complete registration steps","Plan post-formation setup"]'::jsonb, '[{"question":"Can a non-UK resident form a UK LTD?","answer":"Formation may be possible for non-residents, but eligibility and practical requirements depend on individual circumstances and the services you plan to use."},{"question":"Does formation include a bank account?","answer":"No. Banking providers assess applications independently. Corevexal can provide separate preparation and application guidance."}]'::jsonb, '["business-banking","payment-platforms"]'::jsonb, 'UK LTD Company Formation Guidance | Corevexal', 'Structured UK LTD formation guidance, documentation support, and practical next-step planning from Corevexal.', 'published', 1, 'Building2'
)
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  requirements = EXCLUDED.requirements,
  process = EXCLUDED.process,
  faqs = EXCLUDED.faqs,
  related_services = EXCLUDED.related_services,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  status = EXCLUDED.status,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon;

INSERT INTO services (category_id, slug, title, short_description, description, features, requirements, process, faqs, related_services, seo_title, seo_description, status, display_order, icon)
VALUES (
  (SELECT id FROM service_categories WHERE slug = 'business-formation'),
  'us-llc-formation', 'US LLC Formation', 'Build a US business structure with organized formation and setup guidance.', 'Understand state selection considerations, prepare formation details, and establish an organized path toward an operational US LLC.', '["LLC formation guidance","State selection considerations","EIN guidance","Documentation planning","Ongoing responsibility overview"]'::jsonb, '["Member information","Business purpose","Preferred state","Identity and address documentation"]'::jsonb, '["Clarify business needs","Consider state options","Prepare formation information","Complete registration steps","Plan EIN and operational setup"]'::jsonb, '[{"question":"Which state should I choose?","answer":"The right state depends on where you operate, your business model, costs, and compliance needs. Corevexal provides general considerations, not legal or tax advice."},{"question":"Is an EIN guaranteed?","answer":"No. The relevant US authority determines issuance and processing. We can help you prepare the required information."}]'::jsonb, '["business-banking","payment-platforms"]'::jsonb, 'US LLC Formation Guidance | Corevexal', 'Plan a US LLC with state selection considerations, EIN guidance, documentation support, and clear setup steps.', 'published', 2, 'Landmark'
)
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  requirements = EXCLUDED.requirements,
  process = EXCLUDED.process,
  faqs = EXCLUDED.faqs,
  related_services = EXCLUDED.related_services,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  status = EXCLUDED.status,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon;

INSERT INTO services (category_id, slug, title, short_description, description, features, requirements, process, faqs, related_services, seo_title, seo_description, status, display_order, icon)
VALUES (
  (SELECT id FROM service_categories WHERE slug = 'business-banking'),
  'business-banking', 'Business Banking', 'Plan banking and multi-currency account infrastructure around your company.', 'Compare account types, prepare business documentation, and approach applications with a structure suited to your operations.', '["Business bank account guidance","Multi-currency account guidance","Documentation preparation","Application guidance","Account infrastructure planning"]'::jsonb, '["Company documents","Ownership information","Business activity details","Expected transaction profile","Identity and address evidence"]'::jsonb, '["Assess operational needs","Map suitable account types","Prepare documentation","Support the application process","Plan account workflows"]'::jsonb, '[{"question":"Does Corevexal open the account?","answer":"Eligibility, verification, approval, and account availability are determined independently by the relevant institution or provider. Corevexal provides guidance and does not guarantee approval."}]'::jsonb, '["uk-ltd-formation","us-llc-formation","payment-platforms"]'::jsonb, 'Business Banking Setup Guidance | Corevexal', 'Business bank account, multi-currency account, documentation, and application guidance for international companies.', 'published', 3, 'Banknote'
)
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  requirements = EXCLUDED.requirements,
  process = EXCLUDED.process,
  faqs = EXCLUDED.faqs,
  related_services = EXCLUDED.related_services,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  status = EXCLUDED.status,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon;

INSERT INTO services (category_id, slug, title, short_description, description, features, requirements, process, faqs, related_services, seo_title, seo_description, status, display_order, icon)
VALUES (
  (SELECT id FROM service_categories WHERE slug = 'digital-technology'),
  'digital-technology', 'Digital & Technology', 'Build the digital systems that help your business operate and grow.', 'Connect your business foundation to a practical digital layer, from web presence and commerce to automation and software.', '["Website development","Next.js development","SaaS products","UI/UX design","E-commerce","Automation","API integration","Software engineering"]'::jsonb, '["Business goals","Audience and workflow","Existing systems","Scope and timeline"]'::jsonb, '["Discover the business need","Define the digital scope","Design the experience","Build and validate","Launch and improve"]'::jsonb, '[{"question":"Can digital work be added after formation?","answer":"Yes. Digital services are modular and can be planned once your company and operational foundations are ready."}]'::jsonb, '["business-banking","payment-platforms"]'::jsonb, 'Digital & Technology Services | Corevexal', 'Web development, SaaS, e-commerce, automation, API integration, and digital consulting for growing businesses.', 'published', 4, 'Code2'
)
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  requirements = EXCLUDED.requirements,
  process = EXCLUDED.process,
  faqs = EXCLUDED.faqs,
  related_services = EXCLUDED.related_services,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  status = EXCLUDED.status,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon;

-- Seed services (Payment Platforms)
INSERT INTO services (category_id, slug, title, short_description, description, features, requirements, process, faqs, related_services, seo_title, seo_description, status, display_order, icon)
VALUES (
  (SELECT id FROM service_categories WHERE slug = 'payment-platforms'),
  'wise', 'Wise Business', 'Businesses exploring multi-currency operations and international transfers.', 'Businesses exploring multi-currency operations and international transfers.', '[]'::jsonb, '["Company jurisdiction","Business activity","Ownership details","Expected payment flows"]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'Wise Business Setup Guidance | Corevexal', 'Wise Business Setup Guidance | Corevexal', 'published', 5, 'CreditCard'
)
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  requirements = EXCLUDED.requirements,
  process = EXCLUDED.process,
  faqs = EXCLUDED.faqs,
  related_services = EXCLUDED.related_services,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  status = EXCLUDED.status,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon;

INSERT INTO services (category_id, slug, title, short_description, description, features, requirements, process, faqs, related_services, seo_title, seo_description, status, display_order, icon)
VALUES (
  (SELECT id FROM service_categories WHERE slug = 'payment-platforms'),
  'payoneer', 'Payoneer Business', 'Businesses receiving marketplace or cross-border commercial payments.', 'Businesses receiving marketplace or cross-border commercial payments.', '[]'::jsonb, '["Business registration","Marketplace relationships","Transaction profile","Verification documents"]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'Payoneer Business Setup Guidance | Corevexal', 'Payoneer Business Setup Guidance | Corevexal', 'published', 6, 'CreditCard'
)
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  requirements = EXCLUDED.requirements,
  process = EXCLUDED.process,
  faqs = EXCLUDED.faqs,
  related_services = EXCLUDED.related_services,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  status = EXCLUDED.status,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon;

INSERT INTO services (category_id, slug, title, short_description, description, features, requirements, process, faqs, related_services, seo_title, seo_description, status, display_order, icon)
VALUES (
  (SELECT id FROM service_categories WHERE slug = 'payment-platforms'),
  'paypal', 'PayPal Business', 'Online businesses seeking a widely recognized payment account option.', 'Online businesses seeking a widely recognized payment account option.', '[]'::jsonb, '["Business identity","Website readiness","Product or service clarity","Account verification"]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'PayPal Business Setup Guidance | Corevexal', 'PayPal Business Setup Guidance | Corevexal', 'published', 7, 'CreditCard'
)
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  requirements = EXCLUDED.requirements,
  process = EXCLUDED.process,
  faqs = EXCLUDED.faqs,
  related_services = EXCLUDED.related_services,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  status = EXCLUDED.status,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon;

INSERT INTO services (category_id, slug, title, short_description, description, features, requirements, process, faqs, related_services, seo_title, seo_description, status, display_order, icon)
VALUES (
  (SELECT id FROM service_categories WHERE slug = 'payment-platforms'),
  'stripe', 'Stripe Business', 'Digital businesses that need online checkout and programmable payment workflows.', 'Digital businesses that need online checkout and programmable payment workflows.', '[]'::jsonb, '["Supported jurisdiction","Website and policy readiness","Fulfilment model","Business verification"]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'Stripe Business Setup Guidance | Corevexal', 'Stripe Business Setup Guidance | Corevexal', 'published', 8, 'CreditCard'
)
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  requirements = EXCLUDED.requirements,
  process = EXCLUDED.process,
  faqs = EXCLUDED.faqs,
  related_services = EXCLUDED.related_services,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  status = EXCLUDED.status,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon;

INSERT INTO services (category_id, slug, title, short_description, description, features, requirements, process, faqs, related_services, seo_title, seo_description, status, display_order, icon)
VALUES (
  (SELECT id FROM service_categories WHERE slug = 'payment-platforms'),
  'taptap', 'TapTap Business', 'Businesses assessing an additional digital payment platform for their market.', 'Businesses assessing an additional digital payment platform for their market.', '[]'::jsonb, '["Regional availability","Business eligibility","Use case","Required verification"]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'TapTap Business Setup Guidance | Corevexal', 'TapTap Business Setup Guidance | Corevexal', 'published', 9, 'CreditCard'
)
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  requirements = EXCLUDED.requirements,
  process = EXCLUDED.process,
  faqs = EXCLUDED.faqs,
  related_services = EXCLUDED.related_services,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  status = EXCLUDED.status,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon;

