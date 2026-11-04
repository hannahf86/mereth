-- Tenancy core: profiles, festivals, editions, members, and the global
-- disciplines reference. Money is integer pence; durations are seconds.

-- One row per auth user.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email citext not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The organisation (recurs annually via editions). Only public-safe branding
-- lives here, so the row can be read publicly; secrets go in festival_integrations.
create table public.festivals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug citext not null unique,
  contact_email citext,
  logo_path text,
  theme jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Per-festival integration config/secrets — staff-only (strict RLS). Webflow
-- API tokens (encrypted) are added here in step 9.
create table public.festival_integrations (
  festival_id uuid primary key references public.festivals (id) on delete cascade,
  stripe_connect_account_id text,
  webflow_site_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A single year of a festival. Syllabus/entries/timetable hang off the edition.
create table public.festival_editions (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid not null references public.festivals (id) on delete cascade,
  year int not null,
  title text not null,
  starts_on date,
  ends_on date,
  age_cutoff_date date not null,
  entries_open_at timestamptz,
  entries_close_at timestamptz,
  timezone text not null default 'Europe/London',
  status edition_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (festival_id, year),
  -- Composite key: lets child tables enforce (edition_id, festival_id) agree,
  -- so a row's festival_id can never drift from its edition's festival.
  unique (id, festival_id)
);

-- Festival team. Teachers are NOT members (see teachers). A person may hold
-- several roles (one row each) and roles in different festivals.
create table public.festival_members (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid not null references public.festivals (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role member_role not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (festival_id, profile_id, role)
);
create index festival_members_profile_idx on public.festival_members (profile_id);
create index festival_members_festival_idx on public.festival_members (festival_id);

-- Global reference (Piano, Strings, Voice, …). Shared across festivals.
create table public.disciplines (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at triggers
create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.festivals
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.festival_integrations
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.festival_editions
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.festival_members
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.disciplines
  for each row execute function public.set_updated_at();
