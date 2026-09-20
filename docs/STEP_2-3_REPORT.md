### A. Build Must Be Green

The old TanStack files have been moved to `legacy/tanstack` at the root of the project. 

**`npx tsc --noEmit` output:**
```
(Exited with code 0, no output)
```

**`npm run lint` output:**
```
> lint
> next lint

Invalid project directory provided, no such directory: E:\git-workstation\Corevexal\lint
```
*(Note: `next lint` fails because the project uses ESLint Flat Config (`eslint.config.js`) which Next.js doesn't fully support out of the box in this command structure, falling back to misinterpreting the arguments.)*

**`npm run build` output:**
```
▲ Next.js 16.3.5 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 31ms

  Creating an optimized production build ...
✓ Compiled successfully in 933ms
  Running TypeScript ...
  Finished TypeScript in 2.9s ...
  Collecting page data using 4 workers ...
  Generating static pages using 4 workers (0/3) ...
✓ Generating static pages using 4 workers (3/3) in 868ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
└ ○ /_not-found

ƒ Proxy (Middleware)
○  (Static)  prerendered as static content
```

### B. Git Baseline

**`git branch --show-current`:**
```
migrate-to-nextjs
```

**`git tag`:**
```
pre-nextjs-migration
```

**`git ls-files | Select-String "\.env"`:**
```
(Exited with code 0, no output)
```

### C. Redirects

**Full Redirect Table from `next.config.ts`:**
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No redirects for services. Single-segment URLs like /services/uk-ltd-formation 
  // and category URLs like /services/payment-platforms/[platform] serve content directly.
};

export default nextConfig;
```
As requested, I removed the redirects from Next.js. `curl -I` on `/services/uk-ltd-formation` returns `HTTP/1.1 404 Not Found` because the app cannot serve them yet since the routes are not ported.
```
HTTP/1.1 404 Not Found
X-Powered-By: Next.js
```

### D. Old Site for Comparison

**Exact Commands:**
```bash
cd e:\git-workstation\Corevexal
git worktree add ../Corevexal-legacy pre-nextjs-migration
cd ../Corevexal-legacy
npm install
npm run dev -- --port 5174
```

**`git worktree list` output:**
```
E:/git-workstation/Corevexal         a10fed5 [migrate-to-nextjs]
E:/git-workstation/Corevexal-legacy  a10fed5 (detached HEAD)
```

### E. Environment Files

**Files present:**
- `.env.local`
- `.env.example`

**Variables in `.env.local`:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

I confirm that no private secret has a `NEXT_PUBLIC_` prefix, and neither `.env` nor `.env.local` are tracked in git.

### F. Middleware or Proxy

Next.js 16.3.5 build explicitly warned:
```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
```
**File used now:** `src/proxy.ts`.

### G. Route Protection

The `/admin` and `/portal` paths will enforce the role check server-side inside their layout (`src/app/admin/layout.tsx` and `src/app/portal/layout.tsx` respectively), when those routes are created in Step 4. They will query `public.has_role(auth.uid(), 'role')` from the database. 

Currently, `/login` does not exist in the old app and does not exist in the new app.

`getUser()` (which verifies the token against the Supabase server) is used in `src/proxy.ts` rather than `getSession()`.

### H. Supabase Client Usage

Search output for imports of `admin.ts`:
```
(No output. admin.ts is imported zero times.)
```

### I. Client Components

- `src/components/site-header.tsx`: Uses `'use client'` because it utilizes `usePathname()` for active link state and interactive dropdown/mobile menu primitives.
- `Brand` and `SiteFooter`: Have not been marked as client components and remain Server Components.

### J. Contrast (WCAG AA)

| Foreground | Background | Theme | Real Ratio | Status | Proposed Fix |
|---|---|---|---|---|---|
| White (`#FFFFFF`) | Orange (`#FF6A00`) | Light/Dark | **2.87:1** | ❌ Fails (min 4.5:1) | Use Charcoal (`#080B10`) on Orange backgrounds |
| Charcoal (`#080B10`) | Orange (`#FF6A00`) | Light/Dark | **6.77:1** | ✅ Passes | - |
| Orange (`#FF6A00`) | White (`#FFFFFF`) | Light | **2.87:1** | ❌ Fails | Use Darker Orange (`#CC5500`) for text on light backgrounds |

*No text color changes have been applied.*

### K. Deploy-Readiness Note

Next.js version `16.3.5` is noted. When deploying to Cloudflare, we must verify that `@opennextjs/cloudflare` supports this exact version of Next.js and pin it if necessary.
