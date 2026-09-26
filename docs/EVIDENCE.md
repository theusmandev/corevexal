# EVIDENCE.md — Corevexal Build Completion Report

> Generated: 2026-09-25 | Framework: Next.js App Router (v15+) | Deployed target: Cloudflare Workers (OpenNext)

---

## 1. Compiled Route Inventory

### 1.1 Public Site Routes

| Route             | File                             | Rendering                  | revalidate |
| ----------------- | -------------------------------- | -------------------------- | ---------- |
| /                 | (site)/page.tsx                  | ISR                        | 60 s       |
| /about            | (site)/about/page.tsx            | ISR                        | -          |
| /contact          | (site)/contact/page.tsx          | Dynamic                    | -          |
| /faq              | (site)/faq/page.tsx              | ISR                        | -          |
| /solutions        | (site)/solutions/page.tsx        | ISR                        | -          |
| /resources        | (site)/resources/page.tsx        | ISR                        | -          |
| /services         | (site)/services/page.tsx         | ISR                        | 60 s       |
| /services/[slug]  | (site)/services/[slug]/page.tsx  | ISR + generateStaticParams | 60 s       |
| /legal/privacy    | (site)/legal/privacy/page.tsx    | Static                     | -          |
| /legal/terms      | (site)/legal/terms/page.tsx      | Static                     | -          |
| /legal/cookies    | (site)/legal/cookies/page.tsx    | Static                     | -          |
| /legal/disclaimer | (site)/legal/disclaimer/page.tsx | Static                     | -          |

### 1.2 Admin Routes (robots: noindex, nofollow)

| Route                  | Description                                          |
| ---------------------- | ---------------------------------------------------- |
| /admin                 | Dashboard — real-time lead counts + status breakdown |
| /admin/leads           | Paginated leads table with search + status filter    |
| /admin/leads/[id]      | Individual lead detail + status update               |
| /admin/categories      | Category list                                        |
| /admin/categories/new  | Create category                                      |
| /admin/categories/[id] | Edit category                                        |
| /admin/services        | Service list                                         |
| /admin/services/new    | Create service                                       |
| /admin/services/[id]   | Edit service                                         |
| /admin/preview/[slug]  | Live preview of draft service page                   |
| /admin/settings        | Contact info, social links, announcement banner      |

### 1.3 Auth & Portal Routes

| Route   | Description                          |
| ------- | ------------------------------------ |
| /login  | Supabase Auth email/password sign-in |
| /portal | Client portal (authenticated)        |

### 1.4 API Routes

| Route        | Method | Description                                      |
| ------------ | ------ | ------------------------------------------------ |
| /api/contact | POST   | Contact form handler — inserts to Supabase leads |

### 1.5 Special Files

| File                        | Purpose                                           |
| --------------------------- | ------------------------------------------------- |
| src/app/sitemap.ts          | Dynamic XML sitemap                               |
| public/robots.txt           | Search engine crawl directives                    |
| src/app/icon.svg            | Brand mark favicon (SVG w/ dark-mode media query) |
| src/app/apple-icon.tsx      | Apple Touch Icon — 180x180 PNG via ImageResponse  |
| src/app/opengraph-image.png | Static OG image                                   |
| src/app/twitter-image.png   | Static Twitter card image                         |

---

## 2. SEO Meta Tags Implementation

### 2.1 Root Layout (src/app/layout.tsx)

metadataBase: process.env.NEXT_PUBLIC_APP_URL || https://corevexal.com
title: "Corevexal | Business Formation & Financial Solutions"
description: "Corevexal helps entrepreneurs and businesses with company formation, business banking guidance, payment platform setup, and digital solutions."

JSON-LD Organisation schema is also injected:
@type: Organization
name: Corevexal
url: https://corevexal.com
logo: https://corevexal.com/brand/mark.svg

### 2.2 Per-Page Metadata

| Page                  | Title Pattern   | Notes                                    |
| --------------------- | --------------- | ---------------------------------------- |
| Home /                | Corevexal       | Business Formation & Financial Solutions | Root default             |
| /services/[slug]      | {service.title} | Corevexal                                | meta_description from DB |
| About / Contact / FAQ | Page-specific   | -                                        |
| Legal pages           | {Page} Policy   | Corevexal                                | Static                   |
| Admin pages           | -               | robots: noindex, nofollow                |

### 2.3 Sitemap Coverage

- Static routes: /, /about, /services, /solutions, /resources, /faq, /contact
- Dynamic: all published service slugs + category slugs from Supabase
- priority: 1.0 (home), 0.8 (static pages), 0.6 (dynamic service pages)
- ISR revalidated every 60 seconds

---

## 3. Completed Feature Set

### 3.1 Brand & UI

- [x] Official brand mark paths (mark.svg) in favicon and HeroVisual
- [x] Horizontal logo (logo-horizontal.svg / logo-horizontal-reversed.svg) via Brand component
- [x] Logo size: h-10 w-auto md:h-12 — 40px mobile / 48px desktop, unoptimized SVG
- [x] Apple Touch Icon: 180x180 PNG via next/og ImageResponse
- [x] Dark mode: next-themes ThemeProvider + SVG icon media query
- [x] Flat design: all shadow-* classes removed codebase-wide
- [x] Typography: Manrope (body) + Sora (display) via next/font/google

### 3.2 Hero Animation (HeroVisual)

- [x] Exact brand mark SVG paths (viewBox 0 0 2048 1917) — no placeholder geometry
- [x] "C" body: stroke-dasharray/dashoffset draw-in 1.1s (ease-out cubic-bezier)
- [x] Orange chevron: scale+fade spring-in (cubic-bezier spring) at 0.9s delay, 400ms
- [x] Labels: 5 pillars stagger in at 1.2s + 80ms between each
- [x] IntersectionObserver — single-trigger, disconnects after first intersection
- [x] prefers-reduced-motion — instantly shows final state

### 3.3 Services & CMS

- [x] Services + categories via Supabase Admin CRUD
- [x] Draft/published workflow with admin preview
- [x] Dynamic generateStaticParams for published service slugs
- [x] Category icons via icon-registry utility

### 3.4 Contact / Lead Capture

- [x] ContactForm client component at /contact
- [x] Server Action validates + inserts into Supabase leads table
- [x] Honeypot field (bot protection)

### 3.5 Admin Dashboard

- [x] Real-time counts — independent count: exact queries per stat card
- [x] Fail Loudly — errors show role=alert destructive UI; nullish coalescing (?? 0) preserves genuine zeros
- [x] Breakdown panel — status-by-status counts with Other bucket
- [x] Last 7 days count — gte("created_at") filter

### 3.6 Search Sanitizer Security

- [x] Escape-based (not strip-based):
      Backslash escaped first (prevents double-escaping)
      LIKE wildcards: % -> \%, _ -> \_
      SQL delimiters: ' -> \', " -> \"
      PostgREST structural: * ( ) , all escaped
      Control characters stripped (U+0000-U+001F, U+007F)
      Hard cap: 100 characters
      User intent preserved (O'Brien -> O\'Brien, not OBrien)

### 3.7 Settings

- [x] Contact info (email, phone, address) — Supabase settings table
- [x] Social links (LinkedIn, Twitter, Instagram, Facebook)
- [x] Announcement banner (text, link, enabled toggle)
- [x] Propagated to footer and contact page at render time

### 3.8 Infrastructure

- [x] Cloudflare Workers deployment via OpenNext adapter
- [x] Supabase (Postgres) for all persistent data
- [x] robots.txt disallows /admin, /api, /portal, /login
- [x] Admin routes protected by Supabase Auth middleware

---

## 4. Known Pending / Out of Scope

| Item                             | Status                                |
| -------------------------------- | ------------------------------------- |
| Email notifications on new lead  | Not implemented (SMTP not configured) |
| Service ordering (drag-and-drop) | Not implemented                       |
| Blog / Resources content         | Static placeholder page only          |
| Multi-language (i18n)            | Not in scope                          |

---

Generated: 2026-09-25 | Build verified: tsc --noEmit exit code 0
