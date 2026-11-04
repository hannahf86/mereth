-- Row Level Security for every table.
--
-- Model:
--   * authenticated users see their OWN data (competitors, entries, orders);
--   * festival staff see their festival's rows (via SECURITY DEFINER helpers);
--   * stewards never get table access to competitors (DOBs) — a name-only view
--     (steward_competitors) is the only channel;
--   * anon may read non-PII branding/reference + PUBLISHED classes only;
--   * everything else public (timetable, consent-gated results, receipts) is
--     served server-side with the service role and explicit safe projections;
--   * the service role (server-only) bypasses RLS for webhooks/sync/audit.

-- ---------- Helper functions (SECURITY DEFINER → bypass RLS, no recursion) ----------
create or replace function public.is_festival_member(p_festival_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.festival_members m
    where m.festival_id = p_festival_id
      and m.profile_id = (select auth.uid())
  );
$$;

create or replace function public.has_festival_role(
  p_festival_id uuid,
  p_roles member_role[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.festival_members m
    where m.festival_id = p_festival_id
      and m.profile_id = (select auth.uid())
      and m.role = any (p_roles)
  );
$$;

-- ---------- Grants (RLS is still the row-level gate) ----------
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on
  public.festivals, public.festival_editions, public.disciplines, public.classes,
  public.results
  to anon;
grant execute on function
  public.is_festival_member(uuid),
  public.has_festival_role(uuid, member_role[]),
  public.age_on(date, date)
  to anon, authenticated;

-- ---------- Enable RLS everywhere ----------
alter table public.profiles enable row level security;
alter table public.festivals enable row level security;
alter table public.festival_integrations enable row level security;
alter table public.festival_editions enable row level security;
alter table public.festival_members enable row level security;
alter table public.disciplines enable row level security;
alter table public.venues enable row level security;
alter table public.rooms enable row level security;
alter table public.sessions enable row level security;
alter table public.classes enable row level security;
alter table public.scheduled_classes enable row level security;
alter table public.teachers enable row level security;
alter table public.competitors enable row level security;
alter table public.entries enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_links enable row level security;
alter table public.stripe_events enable row level security;
alter table public.attendance enable row level security;
alter table public.results enable row level security;
alter table public.documents enable row level security;
alter table public.webflow_sync enable row level security;
alter table public.audit_log enable row level security;

-- ---------- profiles ----------
create policy profiles_select_own on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy profiles_insert_own on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- ---------- festivals (public branding; owners edit) ----------
create policy festivals_select_public on public.festivals
  for select to anon, authenticated using (true);
create policy festivals_update_owner on public.festivals
  for update to authenticated
  using (public.has_festival_role(id, array['owner']::member_role[]))
  with check (public.has_festival_role(id, array['owner']::member_role[]));

-- ---------- festival_integrations (staff-only secrets) ----------
create policy fi_select_staff on public.festival_integrations
  for select to authenticated
  using (public.has_festival_role(festival_id, array['owner','secretary']::member_role[]));
create policy fi_write_staff on public.festival_integrations
  for all to authenticated
  using (public.has_festival_role(festival_id, array['owner','secretary']::member_role[]))
  with check (public.has_festival_role(festival_id, array['owner','secretary']::member_role[]));

-- ---------- festival_editions (public read; staff write) ----------
create policy editions_select_public on public.festival_editions
  for select to anon, authenticated using (true);
create policy editions_write_staff on public.festival_editions
  for all to authenticated
  using (public.has_festival_role(festival_id, array['owner','secretary']::member_role[]))
  with check (public.has_festival_role(festival_id, array['owner','secretary']::member_role[]));

-- ---------- festival_members (team visible to members; owner manages) ----------
create policy members_select on public.festival_members
  for select to authenticated using (public.is_festival_member(festival_id));
create policy members_write_owner on public.festival_members
  for all to authenticated
  using (public.has_festival_role(festival_id, array['owner']::member_role[]))
  with check (public.has_festival_role(festival_id, array['owner']::member_role[]));

-- ---------- disciplines (global reference, public read) ----------
create policy disciplines_select_public on public.disciplines
  for select to anon, authenticated using (true);

-- ---------- venues / rooms / sessions (staff only; public timetable via server) ----------
create policy venues_select_staff on public.venues
  for select to authenticated using (public.is_festival_member(festival_id));
create policy venues_write_staff on public.venues
  for all to authenticated
  using (public.has_festival_role(festival_id, array['owner','secretary']::member_role[]))
  with check (public.has_festival_role(festival_id, array['owner','secretary']::member_role[]));

create policy rooms_select_staff on public.rooms
  for select to authenticated using (public.is_festival_member(festival_id));
create policy rooms_write_staff on public.rooms
  for all to authenticated
  using (public.has_festival_role(festival_id, array['owner','secretary']::member_role[]))
  with check (public.has_festival_role(festival_id, array['owner','secretary']::member_role[]));

create policy sessions_select_staff on public.sessions
  for select to authenticated using (public.is_festival_member(festival_id));
create policy sessions_write_staff on public.sessions
  for all to authenticated
  using (public.has_festival_role(festival_id, array['owner','secretary']::member_role[]))
  with check (public.has_festival_role(festival_id, array['owner','secretary']::member_role[]));

-- ---------- classes (published are public; staff see all & write) ----------
create policy classes_select on public.classes
  for select to anon, authenticated
  using (status = 'published' or public.is_festival_member(festival_id));
create policy classes_write_staff on public.classes
  for all to authenticated
  using (public.has_festival_role(festival_id, array['owner','secretary']::member_role[]))
  with check (public.has_festival_role(festival_id, array['owner','secretary']::member_role[]));

-- ---------- scheduled_classes (staff only; public timetable via server) ----------
create policy sched_select_staff on public.scheduled_classes
  for select to authenticated using (public.is_festival_member(festival_id));
create policy sched_write_staff on public.scheduled_classes
  for all to authenticated
  using (public.has_festival_role(festival_id, array['owner','secretary']::member_role[]))
  with check (public.has_festival_role(festival_id, array['owner','secretary']::member_role[]));

-- ---------- teachers (owned by the creator / the teacher themselves) ----------
create policy teachers_select_own on public.teachers
  for select to authenticated
  using (created_by = (select auth.uid()) or profile_id = (select auth.uid()));
create policy teachers_insert_own on public.teachers
  for insert to authenticated with check (created_by = (select auth.uid()));
create policy teachers_update_own on public.teachers
  for update to authenticated
  using (created_by = (select auth.uid()) or profile_id = (select auth.uid()))
  with check (created_by = (select auth.uid()) or profile_id = (select auth.uid()));
create policy teachers_delete_own on public.teachers
  for delete to authenticated using (created_by = (select auth.uid()));

-- ---------- competitors (owner only — DOBs never reach staff tables) ----------
create policy competitors_select_own on public.competitors
  for select to authenticated using (owner_profile_id = (select auth.uid()));
create policy competitors_insert_own on public.competitors
  for insert to authenticated with check (owner_profile_id = (select auth.uid()));
create policy competitors_update_own on public.competitors
  for update to authenticated
  using (owner_profile_id = (select auth.uid()))
  with check (owner_profile_id = (select auth.uid()));
create policy competitors_delete_own on public.competitors
  for delete to authenticated using (owner_profile_id = (select auth.uid()));

-- ---------- entries (owner sees own; staff see their festival's) ----------
create policy entries_select on public.entries
  for select to authenticated using (
    created_by = (select auth.uid())
    or exists (
      select 1 from public.competitors c
      where c.id = competitor_id and c.owner_profile_id = (select auth.uid())
    )
    or public.is_festival_member(festival_id)
  );
create policy entries_insert_own on public.entries
  for insert to authenticated with check (
    created_by = (select auth.uid())
    and exists (
      select 1 from public.competitors c
      where c.id = competitor_id and c.owner_profile_id = (select auth.uid())
    )
  );
create policy entries_update on public.entries
  for update to authenticated
  using (
    (created_by = (select auth.uid()) and status = 'basket')
    or public.has_festival_role(festival_id, array['owner','secretary']::member_role[])
  )
  with check (
    (created_by = (select auth.uid()) and status in ('basket', 'withdrawn'))
    or public.has_festival_role(festival_id, array['owner','secretary']::member_role[])
  );
create policy entries_delete on public.entries
  for delete to authenticated using (
    (created_by = (select auth.uid()) and status = 'basket')
    or public.has_festival_role(festival_id, array['owner','secretary']::member_role[])
  );

-- ---------- orders (payer sees own; staff see festival; webhook via service role) ----------
create policy orders_select on public.orders
  for select to authenticated
  using (profile_id = (select auth.uid()) or public.is_festival_member(festival_id));
create policy orders_insert_own on public.orders
  for insert to authenticated with check (profile_id = (select auth.uid()));
create policy orders_update_staff on public.orders
  for update to authenticated
  using (public.has_festival_role(festival_id, array['owner','secretary']::member_role[]))
  with check (public.has_festival_role(festival_id, array['owner','secretary']::member_role[]));

-- ---------- order_items (follow the parent order) ----------
create policy order_items_select on public.order_items
  for select to authenticated using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.profile_id = (select auth.uid()) or public.is_festival_member(o.festival_id))
    )
  );
create policy order_items_insert_own on public.order_items
  for insert to authenticated with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.profile_id = (select auth.uid())
    )
  );
create policy order_items_write_staff on public.order_items
  for update to authenticated using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and public.has_festival_role(o.festival_id, array['owner','secretary']::member_role[])
    )
  );

-- ---------- payment_links (teacher creator / staff; redemption via service role) ----------
create policy plinks_select on public.payment_links
  for select to authenticated
  using (created_by = (select auth.uid()) or public.is_festival_member(festival_id));
create policy plinks_insert_own on public.payment_links
  for insert to authenticated with check (created_by = (select auth.uid()));
create policy plinks_update on public.payment_links
  for update to authenticated
  using (
    created_by = (select auth.uid())
    or public.has_festival_role(festival_id, array['owner','secretary']::member_role[])
  )
  with check (
    created_by = (select auth.uid())
    or public.has_festival_role(festival_id, array['owner','secretary']::member_role[])
  );

-- ---------- stripe_events: RLS on, NO policies → service role only ----------

-- ---------- attendance (staff + stewards) ----------
create policy attendance_select_staff on public.attendance
  for select to authenticated using (public.is_festival_member(festival_id));
create policy attendance_write_steward on public.attendance
  for all to authenticated
  using (public.has_festival_role(festival_id, array['owner','secretary','steward']::member_role[]))
  with check (public.has_festival_role(festival_id, array['owner','secretary','steward']::member_role[]));

-- ---------- results (published public; stewards enter; publish enforced in app) ----------
create policy results_select on public.results
  for select to anon, authenticated
  using (status = 'published' or public.is_festival_member(festival_id));
create policy results_write_staff on public.results
  for all to authenticated
  using (public.has_festival_role(festival_id, array['owner','secretary','steward']::member_role[]))
  with check (public.has_festival_role(festival_id, array['owner','secretary','steward']::member_role[]));

-- ---------- documents (staff; entrant receipts via server signed URLs) ----------
create policy documents_select_staff on public.documents
  for select to authenticated using (public.is_festival_member(festival_id));
create policy documents_write_staff on public.documents
  for all to authenticated
  using (public.has_festival_role(festival_id, array['owner','secretary']::member_role[]))
  with check (public.has_festival_role(festival_id, array['owner','secretary']::member_role[]));

-- ---------- webflow_sync (admin visibility; writes via service role) ----------
create policy webflow_sync_select_staff on public.webflow_sync
  for select to authenticated
  using (public.has_festival_role(festival_id, array['owner','secretary']::member_role[]));

-- ---------- audit_log (staff read; writes via service role; append-only) ----------
create policy audit_select_staff on public.audit_log
  for select to authenticated
  using (public.has_festival_role(festival_id, array['owner','secretary']::member_role[]));

-- ---------- Steward view: names only, no DOB, scoped to assigned classes ----------
-- SECURITY DEFINER semantics (not security_invoker) so it can expose a NAME-ONLY
-- projection of competitors the steward would otherwise never read. The WHERE
-- clause is the row gate. DOB is deliberately absent.
create view public.steward_competitors
with (security_invoker = false) as
select
  e.festival_id,
  e.id as entry_id,
  e.class_id,
  e.running_order_position,
  c.id as competitor_id,
  c.first_name,
  c.last_name
from public.entries e
join public.competitors c on c.id = e.competitor_id
join public.scheduled_classes sc on sc.class_id = e.class_id
where e.status = 'confirmed'
  and (
    sc.steward_profile_id = (select auth.uid())
    or public.has_festival_role(e.festival_id, array['owner','secretary']::member_role[])
  );

grant select on public.steward_competitors to authenticated;
