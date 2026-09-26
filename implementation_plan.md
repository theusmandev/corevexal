# Implement Settings Admin Phase

## User Review Required

No major breaking changes. The `site_settings` table will be used strictly as a typed key-value store for three specific rows.

## Open Questions

None. The data model and architecture follow the established patterns in this project exactly as requested.

## Proposed Changes

### Database Migration

#### [NEW] `supabase/migrations/20260923000000_seed_site_settings.sql`

- Create a migration to seed the three required rows (`contact_info`, `social_links`, `announcement_banner`) with `is_public = true` and sensible defaults using `INSERT ... ON CONFLICT (key) DO NOTHING;`.
- (I will only write this file; you will run it manually).

### Data Layer

#### [NEW] `src/lib/schemas/settings.ts`

- Zod schemas for the 3 JSON structures to ensure type safety for both reads and writes.

#### [NEW] `src/lib/data/settings.ts`

- `getPublicSettings()`: Fetches the 3 rows via the `anon` client, cached for 60s (using `next/cache` `unstable_cache` or standard Next.js fetch caching) and returns a strongly-typed `{ contactInfo, socialLinks, announcementBanner }` object with safe fallbacks on error.

### Public Site Integration

#### [MODIFY] `src/components/site-footer.tsx`

- Add props to receive the `contactInfo` and `socialLinks` settings.
- Render email (mailto), phone (tel), address, and the Lucide social icons gracefully. Hide sections if empty.

#### [MODIFY] `src/app/(site)/layout.tsx` & `src/app/not-found.tsx` & `src/app/error.tsx`

- Fetch `getPublicSettings()` in the server layout/pages and pass the props to `SiteFooter`.

#### [NEW] `src/components/announcement-banner.tsx`

- Client component rendered above the header. Reads `announcementBanner` prop, renders text/link, and handles per-session dismiss state via `sessionStorage`.

#### [MODIFY] `src/app/(site)/contact/page.tsx`

- Read settings and render the `contactInfo` details alongside the form.

### Admin UI

#### [NEW] `src/app/admin/settings/actions.ts`

- Server actions (`updateContactInfo`, `updateSocialLinks`, `updateAnnouncementBanner`) that validate using Zod, enforce `requireAdmin()`, write to `site_settings` via the admin client, and call `revalidateTag('site_settings')`.

#### [NEW] `src/app/admin/settings/page.tsx`

- A dynamic page rendering three distinct sections/cards for editing the 3 settings.

#### [MODIFY] `src/app/admin/layout.tsx`

- Add "Settings" to the admin navigation menu.

## Verification Plan

### Automated Tests

- Run `npm run build` to ensure type safety and dynamic rendering (`ƒ`) for `/admin/settings`.
- Confirm linter passes cleanly.

### Manual Verification

- You will apply the migration.
- You will verify the admin form writes correctly, and that settings update on the public site and contact page within 60s.
- You will test the banner dismissal.
