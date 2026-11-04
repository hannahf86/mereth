-- People & entries. Teachers and competitors are USER-owned (not festival
-- scoped): a parent's competitor can enter several festivals.

-- A teacher record. profile_id null = a teacher who is only named by a parent.
create table public.teachers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  created_by uuid not null references public.profiles (id) on delete cascade,
  display_name text not null,
  studio text,
  email citext,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index teachers_profile_idx on public.teachers (profile_id);
create index teachers_created_by_idx on public.teachers (created_by);

-- A competitor (usually a child). Minimal data by design: DOB is required for
-- eligibility; no school/address/photos. results_name_consent defaults false.
create table public.competitors (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references public.profiles (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  date_of_birth date not null,
  teacher_id uuid references public.teachers (id) on delete set null,
  results_name_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index competitors_owner_idx on public.competitors (owner_profile_id);
create index competitors_teacher_idx on public.competitors (teacher_id);

-- An entry of a competitor into a class. festival_id denormalised for RLS; the
-- composite FK keeps it aligned with the class's festival. Eligibility and
-- capacity are enforced server-side (RPC / confirm transaction), not here —
-- capacity in particular is checked authoritatively in the Stripe webhook.
create table public.entries (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid not null,
  class_id uuid not null,
  competitor_id uuid not null references public.competitors (id) on delete restrict,
  created_by uuid not null references public.profiles (id),
  piece_title text,
  piece_composer text,
  accompanist_choice text,
  status entry_status not null default 'basket',
  running_order_position int,
  scheduled_time timestamptz,
  payer entry_payer not null default 'account_holder',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (class_id, festival_id)
    references public.classes (id, festival_id) on delete cascade
);
create index entries_festival_idx on public.entries (festival_id);
create index entries_class_idx on public.entries (class_id);
create index entries_competitor_idx on public.entries (competitor_id);
create index entries_created_by_idx on public.entries (created_by);

-- A competitor can be in a given class only once (ignoring withdrawn/refunded).
create unique index entries_unique_active
  on public.entries (class_id, competitor_id)
  where status not in ('withdrawn', 'refunded');

create trigger set_updated_at before update on public.teachers
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.competitors
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.entries
  for each row execute function public.set_updated_at();
