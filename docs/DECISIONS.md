# Mereth — Decisions log

Running log of decisions and why. Newest at the top of each section.

## Design sources (source of truth)

- **UI / tokens:** Figma "Mereth – Design" — file key `i03fec41fkStLxjWvvTC8B`.
  Pages: Branding, Core Components, Theme Variations, HiFi Designs, Wireframes.
- **User flows:** FigJam "Mereth – User Flows" — file key `JSNRbjOABwfQTM7yVkj7II`.

## Product decisions (from the build brief, Nov 2026)

- **Pricing model: annual fee per festival.** No per-entry platform fee, so the
  entrant pays only class prices (cleanest UX vs the ~79p incumbent). Knock-on:
  the Stripe Connect integration needs **no `application_fee_amount`** — festivals
  receive the full entry payment; Mereth's annual fee is billed out-of-band.
- **Payments: Stripe Connect Standard**, destination charges, festival as
  merchant of record. Mereth never holds funds (fits data-processor role).
- **Group entries: out for March.** `classes.is_group` + a dormant
  `entry_members` join table are designed in so groups are additive later.
- **Refunds (March): secretary-initiated only.** Entrants self-serve withdrawal
  only before payment. Admin refund → status `refunded`, slot freed, audit-logged.
- **Auth:** passwordless — magic link **and** 6-digit email OTP (phones).

## Technical decisions

- **Styling: Tailwind v4 mapped to CSS variables.** Semantic tokens are declared
  in `@theme` (NOT `@theme inline`), so Tailwind emits `--color-*` custom
  properties on `:root` and every utility resolves to `var(--color-…)`. A festival
  theme overrides those variables on the `/f/[festivalSlug]` layout root, so the
  whole subtree re-themes at runtime with no component changes.
  - **Gotcha**: our spacing token names (`sm`/`md`/`lg`/`xl`/`2xl`, mandated by
    the brief) shadow Tailwind's same-named width sizes, so `max-w-2xl` resolves
    to `--spacing-2xl` (48px) and `max-w-md` to 16px. Padding/gap/margin are fine;
    for container widths use arbitrary values (`max-w-[42rem]`) or sizes we don't
    define as spacing (`max-w-3xl`+).
  - **Base element styles must live in `@layer base`** (globals.css), or they
    beat Tailwind utilities (e.g. a heading colour would override `text-*`).
- **Tokens from Figma.** Palette + the feedback hexes the brief omitted were read
  from Figma (success `#2E7D4F`, warning `#9A6512`, error `#B3261E`). The three
  `feedback-*-soft` tints are currently derived and should be confirmed against
  the Core Components alert styles when those are built.
- **Cache Components / Partial Prefetching: OFF for MVP.** create-next-app
  defaulted them on, but Mereth is almost entirely authenticated + per-tenant
  dynamic (festival slugs are runtime `params` with no buildable
  `generateStaticParams`), so the static-shell model would force Suspense /
  `"use cache"` discipline on every route for little gain. Simpler, predictable
  dynamic rendering for now; revisit for public-ish routes during hardening.
- **`middleware.ts` → `proxy.ts`.** Next 16 renamed the convention; Supabase
  session refresh now lives in `src/proxy.ts` (`export function proxy`).
- **`@types/node` bumped to v24** to match the Node 24 runtime and satisfy
  Vitest's peer requirement (scaffold had pinned v20).
- **PDFs:** `@react-pdf/renderer` (serverless-friendly), confirmed.

## Schema & RLS (step 2)

- **festival_id on every festival-owned row** (brief §4) for uniform, fast RLS,
  kept consistent with the parent edition via **composite foreign keys**
  `(edition_id, festival_id) → festival_editions(id, festival_id)`.
- **Integration secrets split out.** `festivals` holds only public-safe branding
  (name, slug, logo, theme) so it can be read publicly; Stripe/Webflow IDs live
  in a staff-only `festival_integrations` table.
- **Steward DOB protection is structural.** Stewards get no table access to
  `competitors`; a `steward_competitors` view (name-only, no DOB column, scoped
  to assigned classes) is their only channel.
- **Public reads via the server.** Anon RLS allows only non-PII branding/reference
  and PUBLISHED classes/results. Timetable and consent-gated results are rendered
  server-side with the service role and explicit safe projections — never anon RLS.
- **`age_on(dob, cutoff)`** is an IMMUTABLE SQL function mirrored in
  `src/lib/domain/eligibility` with tests that agree.
- **Capacity** is enforced in the Stripe webhook's confirm transaction (not a DB
  trigger); a **unique partial index** stops duplicate active entries per class.
- **`stripe_events`** table makes the webhook idempotent (RLS on, no policies →
  service role only).
- **Applied to the cloud** (project `gxvpfvejzacthxeroosz`, Nov 2026): schema +
  Alderford seed loaded via the dashboard SQL Editor (Docker isn't available
  locally and CLI login didn't persist to the sandboxed tool shell). Verified
  live: 1 festival, 1 edition, 3 classes, 2 competitors. Typed client generated
  into `src/lib/db/database.types.ts` and wired into the Supabase clients.
- **pgTAP RLS tests still need a DB with Docker** (`supabase test db`) or CI —
  authored and syntax-checked, not yet executed. Run them before go-live.
- **Gotchas**: `gen types --linked` → use `--remote`; PowerShell `>` writes
  UTF-16, so generate via bash redirect or convert to UTF-8.

## Auth & entrant flow (step 3)

- Entrant flow P.01–P.05 built against live data: syllabus + filters, class
  details + DOB eligibility check, passwordless sign-in (magic link + 6-digit
  OTP), who's-performing (competitor add + add-to-basket), basket (totals,
  remove, live header count). Add-to-basket re-checks eligibility and the entries
  window **server-side**; a unique partial index stops duplicate active entries.
- **Before real users can sign in / enter, two things remain:**
  1. Apply `supabase/migrations/20261104200000_profiles_autocreate.sql` (creates a
     profile row on sign-up) via the SQL Editor.
  2. Supabase Auth config (dashboard → Authentication): set Site URL + redirect
     allowlist to the app URL and `/auth/callback`, and configure SMTP (Resend)
     for reliable magic-link email — the built-in email is heavily rate-limited.
- The seeded `auth.users` rows were hand-inserted and are malformed for GoTrue
  ("Database error finding user"), so seeded people can't sign in (real sign-ups
  are fine). `GET /dev/login` (development only, 404s in prod) mints a proper
  test user + profile for local testing of auth-gated flows.

## Payments (step 4)

- **Stripe Checkout** (hosted), test mode. The webhook
  (`/api/stripe/webhook`, `checkout.session.completed`) is the ONLY thing that
  marks an order paid and entries confirmed — signature-verified and idempotent
  via the `stripe_events` table.
- Amounts are computed **server-side** from class fees. The order is created
  `pending` and its entries moved to `pending_payment` before redirect; the
  webhook flips them to `paid`/`confirmed` (or back to `basket` on expiry).
- **Connect**: when a festival has `stripe_connect_account_id`, the session uses
  destination charges (`on_behalf_of` + `transfer_data.destination`) so the full
  amount goes to the festival — no application fee (annual-fee pricing). Without
  a connected account it charges the platform test account (dev only).
- **To test payments locally**, add to `.env.local`:
  - `STRIPE_SECRET_KEY` = Stripe **test** secret key (`sk_test_…`).
  - `STRIPE_WEBHOOK_SECRET` = from the Stripe CLI — run
    `stripe listen --forward-to localhost:3115/api/stripe/webhook` and copy the
    printed `whsec_…`. Pay with test card `4242 4242 4242 4242`.
- Confirmation/receipt **emails are not wired yet** (Resend) — a follow-up.

## Admin (step 5, in progress)

- `/f/[slug]/admin/*` is gated by `requireFestivalStaff` (owner/secretary); the
  admin layout and every admin page/route call it.
- Admin data reads use the **service role** (`admin-queries.ts`) because
  competitors are owner-only under RLS, yet staff need names to run the festival.
  Queries are always festival-scoped and project **names only, never DOB** — the
  entries table, CSV export and all admin views honour this.
- Built & verified: overview (counts), entries list + CSV export, syllabus list
  + class create/edit (the syllabus builder; writes via the session client so
  RLS enforces staff-only), and festival setup + theme (owner-only; theme edited
  with colour pickers, validated for AA contrast server-side, and applied live to
  the public site via the festivals.theme JSONB), and entry-window control
  (edition status + open/close dates; closing it blocks new entries via the
  entrant flow's server-side checks). Admin basics (step 5) is complete.
- `/dev/login?festival=<slug>&role=<role>` grants a festival role for local
  testing of admin/steward flows (dev only).

## Brief update 01 (Nov 2026 — supersedes conflicting parts of the original brief)

Full text in `docs/BRIEF-UPDATE-01.md`. Decisions:
- **Webflow removed entirely** — drop `webflow_sync` and the Webflow ids; remove
  `WEBFLOW_TOKEN_ENCRYPTION_KEY`. Mereth serves the public festival sites itself.
- **Mereth-served public sites** — home, syllabus, class, timetable, results,
  venues, news, FAQ, about, contact; SSR/SSG + on-demand revalidation; full SEO
  (titles/meta/OG/canonical/sitemap/robots/structured data); custom domains via
  Vercel (`festival_domains` + host resolution in middleware); "Powered by Mereth".
- **Self-serve theme editor** — pick primary + accent, derive hover/soft/on tokens;
  logo upload (header/favicon/OG); live contrast check with nearest-passing-shade;
  live preview. (Supersedes the manual all-token editor just built.)
- **Yearly cycle** — edition rollover and spreadsheet import (syllabus/venues).
- **Page content editor** — structured fields: `pages`, versioned `page_content`,
  `news_posts`, `faqs`, `sponsors`, `media` (alt text required). Limited rich text.
- **Change-requests portal** — `change_requests` + `change_request_events`; Resend
  emails to `MERETH_SUPPORT_EMAIL` + requester; optional signed webhook.
- **Billing** — annual subscription tiers (Bronze–Diamond) from the previous
  year's confirmed entries + £100 setup; config table + `festival_subscriptions`;
  May Stripe Invoicing from Mereth's own account; never feature-gate by tier.
- **Entry payments (Stripe Connect vs Mereth-collect) still OPEN** — confirm before
  relying on the Connect entry-payment build drafted in step 4.
- **Phasing** — March vs summer 2027 per update §7.

## Stack

Next.js 16.4.5 (App Router, TS strict, Turbopack) · Tailwind v4 · Supabase
(`@supabase/ssr`, magic-link/OTP, RLS) · Stripe Connect (test mode) · Resend +
React Email · `@react-pdf/renderer` · Zod at every boundary · Vitest (domain) +
Playwright (E2E) + pgTAP (RLS).
