-- Mereth seed: the fictional Alderford Music Festival 2027. All people fictional.
-- Runs after migrations via `supabase db reset` (as postgres, so it may write
-- auth.users and bypass RLS).

-- ---------- Auth users (passwordless; email pre-confirmed for local testing) ----------
insert into auth.users
  (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
   created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-4111-8111-111111111111',
   'authenticated', 'authenticated', 'rachel.howard@example.com', '', now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Rachel Howard"}'),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-4222-8222-222222222222',
   'authenticated', 'authenticated', 'sarah.bennett@example.com', '', now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Sarah Bennett"}'),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-4333-8333-333333333333',
   'authenticated', 'authenticated', 'helen.clarke@example.com', '', now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Helen Clarke"}');

-- The handle_new_user trigger (migration 20261104200000) auto-creates a profile
-- for each auth.users row above, so upsert here: the seed stays correct whether
-- or not that trigger is present.
insert into public.profiles (id, full_name, email) values
  ('11111111-1111-4111-8111-111111111111', 'Rachel Howard', 'rachel.howard@example.com'),
  ('22222222-2222-4222-8222-222222222222', 'Sarah Bennett', 'sarah.bennett@example.com'),
  ('33333333-3333-4333-8333-333333333333', 'Helen Clarke', 'helen.clarke@example.com')
on conflict (id) do update set
  full_name = excluded.full_name, email = excluded.email;

-- ---------- Disciplines (global reference) ----------
insert into public.disciplines (id, name, sort_order) values
  ('d0000000-0000-4000-8000-000000000001', 'Piano', 1),
  ('d0000000-0000-4000-8000-000000000002', 'Strings', 2),
  ('d0000000-0000-4000-8000-000000000003', 'Voice', 3),
  ('d0000000-0000-4000-8000-000000000004', 'Woodwind', 4),
  ('d0000000-0000-4000-8000-000000000005', 'Brass', 5),
  ('d0000000-0000-4000-8000-000000000006', 'Guitar', 6);

-- ---------- Festival + 2027 edition ----------
insert into public.festivals (id, name, slug, contact_email, theme) values
  ('a1de0000-0000-4000-8000-000000000001', 'Alderford Music Festival',
   'alderford', 'secretary@alderfordfestival.example', '{}'::jsonb);

insert into public.festival_integrations (festival_id) values
  ('a1de0000-0000-4000-8000-000000000001');

insert into public.festival_editions
  (id, festival_id, year, title, starts_on, ends_on, age_cutoff_date,
   entries_open_at, entries_close_at, status)
values
  ('a1de0000-0000-4000-8000-000000002027', 'a1de0000-0000-4000-8000-000000000001',
   2027, 'Alderford Music Festival 2027', '2027-03-19', '2027-03-21', '2026-09-01',
   '2026-11-01T09:00:00Z', '2027-02-12T23:59:00Z', 'entries_open');

-- Rachel runs the festival.
insert into public.festival_members (festival_id, profile_id, role) values
  ('a1de0000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'owner'),
  ('a1de0000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'secretary');

-- ---------- Venues & rooms ----------
insert into public.venues (id, festival_id, edition_id, name) values
  ('b0000000-0000-4000-8000-000000000001', 'a1de0000-0000-4000-8000-000000000001',
   'a1de0000-0000-4000-8000-000000002027', 'Town Hall'),
  ('b0000000-0000-4000-8000-000000000002', 'a1de0000-0000-4000-8000-000000000001',
   'a1de0000-0000-4000-8000-000000002027', 'Arts Studio');

insert into public.rooms (id, festival_id, venue_id, name) values
  ('c0000000-0000-4000-8000-000000000001', 'a1de0000-0000-4000-8000-000000000001',
   'b0000000-0000-4000-8000-000000000001', 'Main Hall'),
  ('c0000000-0000-4000-8000-000000000002', 'a1de0000-0000-4000-8000-000000000001',
   'b0000000-0000-4000-8000-000000000002', 'Room 1');

-- ---------- Classes ----------
insert into public.classes
  (id, festival_id, edition_id, discipline_id, code, title, description,
   age_min, age_max, set_piece_title, set_piece_composer, fee_pence,
   time_limit_seconds, accompanist, status)
values
  ('e0000000-0000-4000-8000-000000000012', 'a1de0000-0000-4000-8000-000000000001',
   'a1de0000-0000-4000-8000-000000002027', 'd0000000-0000-4000-8000-000000000001',
   'P12', 'Piano solo, 12 & under', 'A set piece for pianists aged 12 and under.',
   null, 12, 'Arabesque, Op. 100 No. 2', 'Burgmüller', 1200, 240, 'not_required', 'published'),
  ('e0000000-0000-4000-8000-000000000014', 'a1de0000-0000-4000-8000-000000000001',
   'a1de0000-0000-4000-8000-000000002027', 'd0000000-0000-4000-8000-000000000002',
   'V14', 'Violin solo, 14 & under', 'Own choice, up to five minutes.',
   null, 14, null, null, 1400, 300, 'required', 'published'),
  ('e0000000-0000-4000-8000-000000000016', 'a1de0000-0000-4000-8000-000000000001',
   'a1de0000-0000-4000-8000-000000002027', 'd0000000-0000-4000-8000-000000000001',
   'P16', 'Piano solo, 16 & under', 'Own choice, up to six minutes.',
   null, 16, null, null, 1600, 360, 'not_required', 'published');

-- ---------- Teacher + Sarah's competitors ----------
insert into public.teachers (id, profile_id, created_by, display_name, studio, email) values
  ('f0000000-0000-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333',
   '33333333-3333-4333-8333-333333333333', 'Helen Clarke', 'Clarke Piano Studio',
   'helen.clarke@example.com');

-- Maya is 11 on the cutoff (eligible P12 & P16); Leo is 15 (eligible P16 only).
insert into public.competitors
  (id, owner_profile_id, first_name, last_name, date_of_birth, teacher_id, results_name_consent)
values
  ('a0000000-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222',
   'Maya', 'Bennett', '2014-11-20', 'f0000000-0000-4000-8000-000000000001', true),
  ('a0000000-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222',
   'Leo', 'Bennett', '2011-03-05', 'f0000000-0000-4000-8000-000000000001', false);
