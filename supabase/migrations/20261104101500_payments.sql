-- Orders, items, parent payment links, and the Stripe idempotency ledger.

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid not null,
  edition_id uuid not null,
  profile_id uuid not null references public.profiles (id),
  total_pence int not null default 0 check (total_pence >= 0),
  status order_status not null default 'open',
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  reference text not null unique, -- human readable, e.g. MER-270184
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (edition_id, festival_id)
    references public.festival_editions (id, festival_id) on delete cascade
);
create index orders_profile_idx on public.orders (profile_id);
create index orders_festival_idx on public.orders (festival_id);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  entry_id uuid not null references public.entries (id) on delete restrict,
  amount_pence int not null check (amount_pence >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, entry_id)
);
create index order_items_entry_idx on public.order_items (entry_id);

-- For teacher-entered pupils whose parents pay. Token is random and stored only
-- as a hash; single-purpose and expiring; no personal data in the token itself.
create table public.payment_links (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid not null,
  edition_id uuid not null,
  created_by uuid not null references public.profiles (id),
  token_hash text not null unique,
  recipient_email citext not null,
  entry_ids uuid[] not null,
  status payment_link_status not null default 'active',
  expires_at timestamptz not null,
  order_id uuid references public.orders (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (edition_id, festival_id)
    references public.festival_editions (id, festival_id) on delete cascade
);
create index payment_links_festival_idx on public.payment_links (festival_id);

-- Processed Stripe events — the idempotency guard for the webhook. Server-only
-- (service role); RLS is enabled with no policies so no client can read it.
create table public.stripe_events (
  id text primary key, -- Stripe event id (evt_...)
  type text not null,
  received_at timestamptz not null default now()
);

create trigger set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.order_items
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.payment_links
  for each row execute function public.set_updated_at();
