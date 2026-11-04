-- Syllabus & venues. Every festival-owned row carries festival_id (uniform RLS),
-- and composite FKs (…, festival_id) guarantee it matches the parent's festival.

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid not null,
  edition_id uuid not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (edition_id, festival_id)
    references public.festival_editions (id, festival_id) on delete cascade,
  unique (id, festival_id)
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid not null,
  venue_id uuid not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (venue_id, festival_id)
    references public.venues (id, festival_id) on delete cascade,
  unique (id, festival_id)
);

-- A block of time in a room.
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid not null,
  edition_id uuid not null,
  room_id uuid not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (edition_id, festival_id)
    references public.festival_editions (id, festival_id) on delete cascade,
  foreign key (room_id, festival_id)
    references public.rooms (id, festival_id) on delete cascade,
  unique (id, festival_id),
  check (ends_at > starts_at)
);

-- A syllabus class, e.g. P12 · Piano solo, 12 & under.
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid not null,
  edition_id uuid not null,
  discipline_id uuid not null references public.disciplines (id),
  code text not null,
  title text not null,
  description text,
  age_min int,
  age_max int,
  set_piece_title text,
  set_piece_composer text, -- null = own choice
  fee_pence int not null check (fee_pence >= 0),
  time_limit_seconds int check (time_limit_seconds > 0),
  accompanist accompanist_requirement not null default 'not_required',
  max_entries int check (max_entries > 0),
  is_group boolean not null default false,
  status class_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (edition_id, festival_id)
    references public.festival_editions (id, festival_id) on delete cascade,
  unique (id, festival_id),
  unique (edition_id, code),
  check (age_min is null or age_min >= 0),
  check (age_max is null or age_min is null or age_max >= age_min)
);
create index classes_edition_idx on public.classes (edition_id);
create index classes_discipline_idx on public.classes (discipline_id);

-- A class placed into a session with a start time (draft until the timetable is
-- published). A class is scheduled at most once.
create table public.scheduled_classes (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid not null,
  class_id uuid not null unique,
  session_id uuid not null,
  starts_at timestamptz not null,
  adjudicator text,
  steward_profile_id uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (class_id, festival_id)
    references public.classes (id, festival_id) on delete cascade,
  foreign key (session_id, festival_id)
    references public.sessions (id, festival_id) on delete cascade
);
create index scheduled_classes_session_idx on public.scheduled_classes (session_id);
create index scheduled_classes_steward_idx on public.scheduled_classes (steward_profile_id);

create trigger set_updated_at before update on public.venues
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.rooms
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.sessions
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.classes
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.scheduled_classes
  for each row execute function public.set_updated_at();
