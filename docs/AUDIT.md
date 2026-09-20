# Corevexal Audit and Implementation Plan

## A. Stack Summary
- **Framework**: TanStack Start (a full-stack React framework with built-in SSR and Server Functions).
- **Router**: TanStack Router (file-based routing).
- **Styling**: Tailwind CSS v4.
- **UI Library**: Radix UI (shadcn-like components) and Lucide React.
- **Database Client**: `@supabase/supabase-js`.
- **Build Tool**: Vite (managed via TanStack Start).
- **Runtime**: Node.js/Bun.

## B. What Matches the Spec
- **Database Schema**: The Supabase types (`src/integrations/supabase/types.ts`) show a schema perfectly aligned with Phase 3 (profiles, leads with correct enums, services, faqs, projects, etc.).
- **Initial Data Structure**: `src/lib/services.ts` provides a strong typed foundation for services, categories, and payment platforms as requested in Phase 2, although it currently hardcodes the data rather than fetching from Supabase.
- **Routing**: Most core routes are present (`/services`, `/contact`, `/faq`, `/about`, `/legal`).

## C. What is Missing
- **Supabase Integration for Content**: Services and categories are defined in `src/lib/services.ts` instead of being fetched dynamically from Supabase.
- **Contact Form Validation & Security**: The `/contact` form needs a honeypot field, captcha placeholder, and server-side rate-limiting/validation.
- **Admin/Portal Architecture**: Stubbed route guards for `/admin` and `/portal` based on `user_roles` are missing.
- **SEO Elements**: Comprehensive per-page metadata, canonicals, JSON-LD schema, and `sitemap.xml` generation are not fully implemented.
- **Design Nuances**: The dark mode palette, mega menu accordion on mobile, and the "Business Journey" signature visual need rigorous polish to match Phase 4.

## D. Broken or Risky (Ranked)
1. **[Medium] Hardcoded Content vs DB Schema**: The schema is ready for services, but the app uses hardcoded TypeScript data. Moving this to Supabase data loaders (Server Functions) is required for scalability (Phase 2).
2. **[Medium] RLS & Server Admin Client**: A server-side Supabase client with the service_role key exists (`src/integrations/supabase/client.server.ts`). We must strictly ensure it is never exposed to the client bundle and only used securely in server functions.
3. **[Low] UI Polish & Accessibility**: Missing strict WCAG AA checks, image dimensions, and font-loading optimizations.

## E. Proposed Fix Plan (Priority Order)
1. **Phase 1 (Critical Fixes)**: Run build/lint/typecheck (resolved some powershell syntax errors previously) and ensure no secrets are exposed.
2. **Phase 2 & 3 (Data Architecture & Forms)**: 
   - Connect TanStack Start server functions to fetch services/FAQs from Supabase.
   - Implement the contact form with server-side Zod validation, a honeypot, and a secure Supabase insert.
   - Build route guards for `/admin` and `/portal`.
3. **Phase 4 (Design & UX Polish)**: Polish the Hero visual, Business Journey, sticky mega menu, and strict dark mode colors per the spec.
4. **Phase 5 & 6 (SEO & Performance)**: Implement dynamic Meta tags, `sitemap.xml`, and accessibility audits.
5. **Phase 7 (Legal & Footer)**: Finalize disclaimer texts on all relevant pages.
6. **Phase 8 (Final QA)**: Create `/docs/FINAL_REPORT.md`.

> [!IMPORTANT]
> **Stack Decision (SEO Evaluation)**
> The project uses **TanStack Start**, which provides robust Server-Side Rendering (SSR) and server functions. This means production-standard SEO (per-page metadata, Open Graph, dynamic sitemaps, JSON-LD) **CAN** be met on this current stack without prerendering as a SPA.
> 
> **Recommendation**: Stay on the current stack (TanStack Start). There is no need to migrate to Next.js App Router, as TanStack Start fulfills the full-stack and SEO requirements natively. 
> 
> **Question**: Do you approve staying on TanStack Start and proceeding with Phase 1 and 2?
