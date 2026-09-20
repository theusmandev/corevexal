# Migration Map: TanStack Start to Next.js

## 1. Route Mapping
| TanStack Route | Next.js App Router |
|----------------|--------------------|
| `src/routes/__root.tsx` | `src/app/layout.tsx`, `error.tsx`, `not-found.tsx` |
| `src/routes/index.tsx` | `src/app/page.tsx` |
| `src/routes/services.index.tsx` | `src/app/services/page.tsx` |
| `src/routes/services.$slug.tsx` | `src/app/services/[category]/[service]/page.tsx` |
| `src/routes/services.payment-platforms.tsx` | `src/app/services/payment-platforms/page.tsx` |
| `src/routes/services.payment-platforms.$platform.tsx` | `src/app/services/payment-platforms/[platform]/page.tsx` |
| `src/routes/about.tsx` | `src/app/about/page.tsx` |
| `src/routes/contact.tsx` | `src/app/contact/page.tsx` |
| `src/routes/faq.tsx` | `src/app/faq/page.tsx` |
| `src/routes/solutions.tsx` | `src/app/solutions/page.tsx` |
| `src/routes/resources.tsx` | `src/app/resources/page.tsx` |
| `src/routes/legal.*.tsx` | `src/app/legal/[policy]/page.tsx` |

**URL Parity & Canonical Strategy**:
- Single-segment URLs currently existing (e.g., `/services/uk-ltd-formation`) will **redirect** (via `next.config.ts` redirects) to their canonical two-segment paths: `/services/formation/uk-ltd-formation`. 
- The canonical URL for a service is strictly `/services/[category]/[slug]`.
- Payment platforms have a dedicated category route: `/services/payment-platforms/[platform]`. 
- This strategy avoids duplicate content and perfectly resolves any conflicts with the payment-platform paths.

### Parity Checklist (Old vs New)
| Old URL (TanStack) | New URL (Next.js Canonical) | Status | Notes |
|--------------------|-----------------------------|--------|-------|
| `/` | `/` | Pending | |
| `/services` | `/services` | Pending | |
| `/services/uk-ltd-formation` | `/services/formation/uk-ltd-formation` | Pending | Add redirect |
| `/services/us-llc-formation` | `/services/formation/us-llc-formation` | Pending | Add redirect |
| `/services/business-banking` | `/services/banking/business-banking` | Pending | Add redirect |
| `/services/digital-technology`| `/services/digital/digital-technology` | Pending | Add redirect |
| `/services/payment-platforms` | `/services/payment-platforms` | Pending | |
| `/services/payment-platforms/wise`| `/services/payment-platforms/wise` | Pending | |
| `/about` | `/about` | Pending | |
| `/contact` | `/contact` | Pending | |
| `/faq` | `/faq` | Pending | |
| `/solutions` | `/solutions` | Pending | |
| `/resources` | `/resources` | Pending | |
| `/legal/privacy` | `/legal/privacy` | Pending | |


## 2. API and Feature Mapping
| TanStack Feature | Next.js Equivalent |
|------------------|--------------------|
| `loader` / `beforeLoad` | Server Components (`await`) / Middleware (`middleware.ts`) |
| `createServerFn` | Server Actions (`"use server"`) / Route Handlers (`app/api/...`) |
| `head()` | `generateMetadata()` / `metadata` exports |
| `Link` | `next/link` |
| `useNavigate` | `useRouter` from `next/navigation` |
| `useParams`, `useSearch` | `useParams`, `useSearchParams` from `next/navigation` |
| Vite Envs (`import.meta.env`) | `process.env` / `NEXT_PUBLIC_*` |

## 3. Supabase Clients
| TanStack Client | Next.js Client (`@supabase/ssr`) |
|-----------------|----------------------------------|
| `src/integrations/supabase/client.ts` | Browser Client (`createBrowserClient`) |
| Auth Middleware | Middleware Client (`createServerClient` in `middleware.ts`) |
| `src/integrations/supabase/client.server.ts` | Server Client (`createClient` restricted by `import "server-only"`) |

## 4. Dependencies & Config
**To Remove**:
- `@tanstack/react-start`, `@tanstack/react-router`, `@tanstack/router-plugin`
- `@tanstack/react-query`: Usage in the codebase is limited purely to initializing `QueryClientProvider` in `__root.tsx` and `router.tsx` to support TanStack Router defaults. There are zero instances of `useQuery` or `useMutation`. It is replaced natively by Next.js App Router's data fetching and server actions.
- `vite`, `@vitejs/plugin-react`, `@lovable.dev/vite-tanstack-config`, `nitro`
- `vite-tsconfig-paths`, `@tailwindcss/vite`
- `vite.config.ts`, `src/routeTree.gen.ts`, `src/router.tsx`, `src/start.ts`, `src/server.ts`

*(Note: We will not remove Wrangler/Cloudflare config files unless they break the Next.js build. They will be retained for future local deployment tests.)*

**To Add**:
- `next`, `@supabase/ssr`, `server-only`
- `next-themes` (Prevents dark mode flash on load efficiently)
- `@tailwindcss/postcss`, `postcss` (For Tailwind v4 with Next.js)

## 5. Deployment Target
The old config mentioned `nitro (build-only using cloudflare as a default target)`. 
**Target**: Cloudflare Pages / Workers. This will be a local-only migration preserving Cloudflare compatibility (no Node-only APIs, no FS reading at runtime).
