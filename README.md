# Lower Mainland Indian Events

A production-minded MVP for discovering Indian and South Asian community events across Metro Vancouver and the Lower Mainland.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase database, auth, and storage
- PostgreSQL
- Vercel deployment target

## Features

- Public homepage with featured and upcoming event sections
- `/events` listing page with search plus city, category, date, and price filters
- `/events/[slug]` event detail pages with WhatsApp sharing, copy link, and add-to-calendar
- `/submit` event submission form with duplicate checking
- `/admin` dashboard with Supabase magic-link auth, moderation summary, and approval workflow
- `/admin/sources` source management for manual, RSS, and HTML/JSON-LD imports
- `/admin/imports` staged import review queue with approve, reject, and merge actions
- `/admin/reports` issue reports moderation
- Newsletter signup capture and ICS calendar downloads
- Duplicate detection utility in [src/lib/dedupe.ts](/Users/rajeevroy/Downloads/Property%20Performance/lower-mainland-events/src/lib/dedupe.ts)
- Seed script with sample approved events
- Supabase schema in [supabase/schema.sql](/Users/rajeevroy/Downloads/Property%20Performance/lower-mainland-events/supabase/schema.sql)

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy the example environment file and fill in your Supabase project values:

```bash
cp .env.example .env.local
```

3. Add these variables to `.env.local` and Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAILS=admin@example.com
```

4. In Supabase SQL Editor, run [supabase/schema.sql](/Users/rajeevroy/Downloads/Property%20Performance/lower-mainland-events/supabase/schema.sql).

5. Create a public storage bucket named `event-posters` if you want poster uploads.

6. Seed sample data:

```bash
npm run seed
```

7. Start the app:

```bash
npm run dev
```

## Phase 2 setup

1. Re-run the latest SQL in [supabase/schema.sql](/Users/rajeevroy/Downloads/Property%20Performance/lower-mainland-events/supabase/schema.sql) so these tables exist:

- `event_sources_config`
- `event_imports`
- `event_reports`
- `newsletter_signups`

2. Seed optional sample events if you want public listings immediately:

```bash
npm run seed
```

3. Add at least one source in `/admin/sources`.

4. Run `Run import` for that source.

5. Review staged rows in `/admin/imports`.

## Import support

- `rss`: parses feed items with `rss-parser`
- `html` / `manual` / `eventbrite` / `other`: fetches the page and parses `application/ld+json` Event objects
- Imported events always enter `event_imports` first and never auto-publish

## Dedupe and quality

- Duplicate scoring combines normalized URL matches, same-day timing, time proximity, title similarity, venue similarity, city, and organizer similarity.
- Quality scoring checks title, description, start date, venue, city, URLs, poster, and category.
- Imports below 60 quality are routed to `needs_review`.

## Admin protection

- Admin pages and mutation APIs require a signed-in Supabase user whose email appears in `ADMIN_EMAILS`.
- No admin mutation route is intended to work anonymously.

## Admin workflow

1. Visit `/admin`.
2. Enter an email that exists in `ADMIN_EMAILS`.
3. Use the Supabase magic link to sign in.
4. Review pending submissions in `/admin/submissions`.
5. Approve or reject submissions.

## Deployment on Vercel

1. Push the repo to GitHub.
2. Create a Vercel project from the repo.
3. Add the environment variables in Vercel Project Settings.
4. Redeploy after changing environment variables.
5. Verify the homepage, event listing, event detail, submission form, source import flow, admin moderation flow, and newsletter signup API.

## Notes

- When Supabase environment variables are missing, the app falls back to sample data so the UI remains explorable during development.
- Admin APIs use the Supabase secret key server-side for moderation actions.
- Import routes are on-demand admin-triggered APIs, so they remain compatible with Vercel’s request lifecycle and avoid background workers.
