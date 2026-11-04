-- Event day: attendance, results, and generated documents.

-- Enable composite FKs from attendance/results so their festival_id stays
-- aligned with the entry's festival.
alter table public.entries
  add constraint entries_id_festival_key unique (id, festival_id);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid not null,
  entry_id uuid not null unique,
  status attendance_status not null,
  marked_by uuid references public.profiles (id),
  marked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (entry_id, festival_id)
    references public.entries (id, festival_id) on delete cascade
);

create table public.results (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid not null,
  entry_id uuid not null unique,
  mark int,
  place int check (place is null or place > 0),
  award text,
  status result_status not null default 'draft',
  approved_by uuid references public.profiles (id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (entry_id, festival_id)
    references public.entries (id, festival_id) on delete cascade
);

-- Generated PDFs etc., stored in Supabase Storage. class_id null = whole-edition
-- document (e.g. full timetable). Never contains DOBs.
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid not null,
  edition_id uuid not null,
  class_id uuid,
  type document_type not null,
  storage_path text not null,
  generated_at timestamptz not null default now(),
  generated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (edition_id, festival_id)
    references public.festival_editions (id, festival_id) on delete cascade,
  foreign key (class_id, festival_id)
    references public.classes (id, festival_id) on delete cascade
);
create index documents_edition_idx on public.documents (edition_id);

create trigger set_updated_at before update on public.attendance
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.results
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.documents
  for each row execute function public.set_updated_at();
