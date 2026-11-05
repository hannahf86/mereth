-- Brief update 02 §2: photo/video + results-name consent, per competitor, per
-- edition, with history (a new row on each change; latest by given_at is current).
create table public.competitor_edition_consents (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid not null,
  edition_id uuid not null,
  competitor_id uuid not null references public.competitors (id) on delete cascade,
  media_consent text not null check (media_consent in ('granted', 'refused')),
  results_name_consent boolean not null default false,
  given_by uuid references public.profiles (id) on delete set null,
  given_at timestamptz not null default now(),
  foreign key (edition_id, festival_id)
    references public.festival_editions (id, festival_id) on delete cascade
);
create index cec_competitor_edition_idx
  on public.competitor_edition_consents (competitor_id, edition_id, given_at desc);
create index cec_festival_idx
  on public.competitor_edition_consents (festival_id);

-- Festival-customisable photography policy line, shown at entry.
alter table public.festivals add column photo_policy text;

-- RLS: the competitor's owner, or festival staff, may read; owner/staff may write.
alter table public.competitor_edition_consents enable row level security;

create policy cec_select on public.competitor_edition_consents
  for select to authenticated
  using (
    exists (
      select 1 from public.competitors c
      where c.id = competitor_id and c.owner_profile_id = (select auth.uid())
    )
    or public.is_festival_member(festival_id)
  );

create policy cec_write on public.competitor_edition_consents
  for all to authenticated
  using (
    exists (
      select 1 from public.competitors c
      where c.id = competitor_id and c.owner_profile_id = (select auth.uid())
    )
    or public.has_festival_role(festival_id, array['owner','secretary']::member_role[])
  )
  with check (
    exists (
      select 1 from public.competitors c
      where c.id = competitor_id and c.owner_profile_id = (select auth.uid())
    )
    or public.has_festival_role(festival_id, array['owner','secretary']::member_role[])
  );

grant select, insert, update, delete
  on public.competitor_edition_consents to authenticated;
