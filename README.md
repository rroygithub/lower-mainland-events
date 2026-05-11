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
5. Verify the homepage, event listing, event detail, submission form, and admin moderation flow.

## Notes

- When Supabase environment variables are missing, the app falls back to sample data so the UI remains explorable during development.
- Admin APIs use the Supabase secret key server-side for moderation actions.
