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

create index events_status_start_time_idx on public.events(status, start_time);
create index events_city_idx on public.events(city);
create index events_category_idx on public.events(category);
create index events_search_idx on public.events using gin (
  to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(city,'') || ' ' || coalesce(venue_name,''))
);

alter table public.events enable row level security;
alter table public.event_submissions enable row level security;
alter table public.venues enable row level security;
alter table public.event_sources enable row level security;

create policy "Public can read approved events"
on public.events
for select
using (status = 'approved');

create policy "Anyone can submit events"
on public.event_submissions
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
