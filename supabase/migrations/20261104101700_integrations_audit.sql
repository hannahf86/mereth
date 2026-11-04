-- Webflow sync state and the admin audit log.

create table public.webflow_sync (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid not null references public.festivals (id) on delete cascade,
  entity_type text not null, -- 'class' | 'venue' | 'timetable_slot' | 'result'
  entity_id uuid not null,
  webflow_item_id text,
  last_synced_hash text,
  last_synced_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (festival_id, entity_type, entity_id)
);
create index webflow_sync_festival_idx on public.webflow_sync (festival_id);

-- Append-only log of admin actions (entry edits, refunds, result changes,
-- exports). metadata holds ids only — never personal data.
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid references public.festivals (id) on delete set null,
  actor_profile_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_log_festival_idx on public.audit_log (festival_id);
create index audit_log_actor_idx on public.audit_log (actor_profile_id);

create trigger set_updated_at before update on public.webflow_sync
  for each row execute function public.set_updated_at();
