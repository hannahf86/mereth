-- Enumerated status/role types. New values can be added later with
-- `alter type ... add value`.

create type member_role as enum (
  'owner', 'secretary', 'steward', 'adjudicator', 'viewer'
);

create type edition_status as enum (
  'draft', 'entries_open', 'entries_closed', 'scheduling',
  'timetable_published', 'running', 'complete'
);

create type class_status as enum ('draft', 'published', 'closed', 'cancelled');

create type accompanist_requirement as enum ('not_required', 'optional', 'required');

create type entry_status as enum (
  'basket', 'pending_payment', 'confirmed', 'withdrawn', 'refunded'
);

create type entry_payer as enum ('account_holder', 'parent_link');

create type order_status as enum ('open', 'pending', 'paid', 'failed', 'refunded');

create type attendance_status as enum ('present', 'absent', 'withdrawn_on_day');

create type result_status as enum ('draft', 'approved', 'published');

create type document_type as enum (
  'running_order', 'mark_sheet', 'steward_sheet', 'certificate', 'timetable', 'receipt'
);

create type payment_link_status as enum ('active', 'used', 'expired', 'cancelled');
