create extension if not exists pgcrypto;

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  category text not null,
  community text default 'Indian / South Asian',
  city text not null,
  venue_name text,
  venue_address text,
  start_time timestamptz not null,
  end_time timestamptz,
  price_type text check (price_type in ('free', 'paid', 'unknown')) default 'unknown',
  price_display text,
  ticket_url text,
  source_url text,
  source_name text,
  organizer_name text,
  poster_url text,
  status text check (status in ('draft', 'pending', 'approved', 'rejected')) default 'pending',
  is_featured boolean default false,
  duplicate_group_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.event_submissions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null,
  city text not null,
  venue_name text,
  venue_address text,
  start_time timestamptz not null,
  end_time timestamptz,
  price_type text default 'unknown',
  price_display text,
  ticket_url text,
  source_url text,
  organizer_name text,
  submitter_name text,
  submitter_email text,
  poster_url text,
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  possible_duplicate_event_id uuid references public.events(id),
  created_at timestamptz default now()
);

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  city text not null,
  latitude numeric,
  longitude numeric,
  created_at timestamptz default now()
);

create table public.event_sources (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  source_name text not null,
  source_url text not null,
  discovered_at timestamptz default now()
);

create table public.event_sources_config (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_type text not null check (source_type in ('manual', 'rss', 'html', 'eventbrite', 'other')),
  base_url text not null,
  city text,
  category_hint text,
  community_hint text default 'Indian / South Asian',
  active boolean default true,
  last_checked_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.event_imports (
  id uuid primary key default gen_random_uuid(),
  source_config_id uuid references public.event_sources_config(id) on delete set null,
  raw_title text not null,
  raw_description text,
  raw_start_time text,
  raw_end_time text,
  raw_venue text,
  raw_city text,
  raw_url text,
  raw_image_url text,
  parsed_title text,
  parsed_description text,
  parsed_start_time timestamptz,
  parsed_end_time timestamptz,
  parsed_venue_name text,
  parsed_city text,
  parsed_category text,
  parsed_ticket_url text,
  parsed_poster_url text,
  parsed_organizer_name text,
  parsed_source_name text,
  import_status text check (import_status in ('new', 'possible_duplicate', 'approved', 'rejected', 'needs_review')) default 'new',
  duplicate_score integer default 0,
  quality_score integer default 0,
  possible_duplicate_event_id uuid references public.events(id),
  raw_payload jsonb,
  created_at timestamptz default now()
);

create table public.event_reports (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  reporter_email text,
  issue_type text check (issue_type in ('wrong_date', 'wrong_location', 'duplicate', 'cancelled', 'other')),
  message text,
  status text check (status in ('new', 'reviewed', 'resolved')) default 'new',
  created_at timestamptz default now()
);

create table public.newsletter_signups (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  city text,
  categories text[],
  created_at timestamptz default now()
);

create index events_status_start_time_idx on public.events(status, start_time);
create index events_city_idx on public.events(city);
create index events_category_idx on public.events(category);
create index event_imports_status_idx on public.event_imports(import_status, created_at desc);
create index event_reports_status_idx on public.event_reports(status, created_at desc);
create index events_search_idx on public.events using gin (
  to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(city,'') || ' ' || coalesce(venue_name,''))
);

alter table public.events enable row level security;
alter table public.event_submissions enable row level security;
alter table public.venues enable row level security;
alter table public.event_sources enable row level security;
alter table public.event_sources_config enable row level security;
alter table public.event_imports enable row level security;
alter table public.event_reports enable row level security;
alter table public.newsletter_signups enable row level security;

create policy "Public can read approved events"
on public.events
for select
using (status = 'approved');

create policy "Anyone can submit events"
on public.event_submissions
for insert
with check (true);

create policy "Anyone can report event issues"
on public.event_reports
for insert
with check (true);

create policy "Anyone can sign up for newsletter"
on public.newsletter_signups
for insert
with check (true);

create policy "Admins can manage events"
on public.events
for all
using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can manage submissions"
on public.event_submissions
for all
using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can manage source configs"
on public.event_sources_config
for all
using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can manage event imports"
on public.event_imports
for all
using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can manage reports"
on public.event_reports
for all
using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can manage newsletter signups"
on public.newsletter_signups
for all
using (auth.jwt() ->> 'role' = 'admin');
