-- RLS guarantees for Mereth. Run with: supabase test db (needs a local DB).
-- Relies on the Alderford seed (supabase/seed.sql) having run.
--
-- Users (from the seed):
--   Rachel  11111111-… (festival owner/secretary, NOT a parent)
--   Sarah   22222222-… (parent; owns Maya & Leo)
--   Helen   33333333-… (teacher; owns no competitors)

begin;
create extension if not exists pgtap;

select plan(11);

-- Helen is also made a steward at Alderford, assigned to P16, with Maya entered,
-- so we can test the steward name-only view. (Setup as the superuser.)
insert into public.festival_members (festival_id, profile_id, role)
values ('a1de0000-0000-4000-8000-000000000001',
        '33333333-3333-4333-8333-333333333333', 'steward');

insert into public.sessions (id, festival_id, edition_id, room_id, starts_at, ends_at)
values ('11110000-0000-4000-8000-000000000001',
        'a1de0000-0000-4000-8000-000000000001',
        'a1de0000-0000-4000-8000-000000002027',
        'c0000000-0000-4000-8000-000000000001',
        '2027-03-19T10:00:00Z', '2027-03-19T12:00:00Z');

insert into public.scheduled_classes
  (id, festival_id, class_id, session_id, starts_at, steward_profile_id)
values ('22220000-0000-4000-8000-000000000001',
        'a1de0000-0000-4000-8000-000000000001',
        'e0000000-0000-4000-8000-000000000016',
        '11110000-0000-4000-8000-000000000001',
        '2027-03-19T10:00:00Z', '33333333-3333-4333-8333-333333333333');

insert into public.entries
  (id, festival_id, class_id, competitor_id, created_by, status, running_order_position)
values ('33330000-0000-4000-8000-000000000001',
        'a1de0000-0000-4000-8000-000000000001',
        'e0000000-0000-4000-8000-000000000016',
        'a0000000-0000-4000-8000-000000000001', -- Maya
        '22222222-2222-4222-8222-222222222222', -- created by Sarah
        'confirmed', 1);

-- ---------- Entrant ownership ----------
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';
select is(
  (select count(*)::int from public.competitors),
  2, 'Sarah sees exactly her 2 competitors');
select is(
  (select count(*)::int from public.entries),
  1, 'Sarah sees the entry she created');

-- ---------- Owner cannot read competitor DOBs ----------
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';
select is(
  (select count(*)::int from public.competitors),
  0, 'Festival owner cannot read any competitor rows (no DOB access)');
select is(
  (select count(*)::int from public.entries
     where festival_id = 'a1de0000-0000-4000-8000-000000000001'),
  1, 'Festival staff can see entries in their festival');

-- ---------- A stranger (teacher who owns nobody here) is isolated ----------
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}';
select is(
  (select count(*)::int from public.competitors),
  0, 'A user who owns no competitors sees none');

-- ---------- Steward name-only view ----------
-- Helen (steward, assigned to P16) can see Maya's NAME via the view…
select is(
  (select count(*)::int from public.steward_competitors
     where competitor_id = 'a0000000-0000-4000-8000-000000000001'),
  1, 'Steward sees their assigned competitor via steward_competitors');
-- …but the view exposes no date_of_birth column at all.
select is(
  (select count(*)::int from information_schema.columns
     where table_schema = 'public'
       and table_name = 'steward_competitors'
       and column_name = 'date_of_birth'),
  0, 'steward_competitors has no date_of_birth column');

-- ---------- Public visibility of classes ----------
reset role;
set local role anon;
set local request.jwt.claims to '{"role":"anon"}';
select is(
  (select count(*)::int from public.classes
     where edition_id = 'a1de0000-0000-4000-8000-000000002027'),
  3, 'anon sees the 3 published classes');
select is(
  (select count(*)::int from public.competitors),
  0, 'anon sees no competitors');
select is(
  (select count(*)::int from public.orders),
  0, 'anon sees no orders');

-- A draft class is hidden from anon.
reset role;
update public.classes set status = 'draft'
  where id = 'e0000000-0000-4000-8000-000000000012';
set local role anon;
set local request.jwt.claims to '{"role":"anon"}';
select is(
  (select count(*)::int from public.classes
     where edition_id = 'a1de0000-0000-4000-8000-000000002027'),
  2, 'anon no longer sees a class once it is set back to draft');

select * from finish();
rollback;
