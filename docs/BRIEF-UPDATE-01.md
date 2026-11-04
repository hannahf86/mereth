# Mereth — Brief update 01

This updates `docs/BRIEF.md`. Where they conflict, **this document wins**.

> Captured from Hannah's update. The original brief lives in the project history
> (chat); `docs/DECISIONS.md` records the resulting decisions.

---

## 1. Webflow is out. Mereth serves the public festival sites

Drop the Webflow integration completely: remove section 10 of the brief, the
`webflow_sync` table, Webflow ids on `festivals`, and any Webflow API code or
config. Delete already-built Webflow bits in a single clearly-labelled commit.

Each festival's public website is now served by the Mereth Next.js app, using
the same design system and theme tokens.

**Public pages per festival:** Home; Syllabus (P.01) and class pages (P.02);
Timetable (once published); Results (once published); Venues; News (list + posts);
FAQ; About; Contact.

**Requirements:**
- SSR or SSG with on-demand revalidation when content is published — fast + indexable.
- SEO: unique titles/meta per page, Open Graph images (festival logo or first
  slider image), canonical URLs, `sitemap.xml` + `robots.txt` per festival, and
  structured data (`Event` for the edition, `Organization` for the festival).
- Custom domains per festival via Vercel's domains API, with `/f/[festivalSlug]`
  as fallback. Resolve the festival from the host in middleware. Store domains in
  a `festival_domains` table with verification status. Super-admin screen to add a
  domain and show the DNS records needed.
- A small "Powered by Mereth" credit in every festival footer.
- Syllabus, class pages, timetable, results and venues are generated FROM DATA,
  not edited as pages. Publishing in admin updates the public site.
- Privacy rules still apply: no DOBs, no contact details, results show names only
  where consent was given.

## 2. Self-serve theme editor

Settings › Branding:
- Upload logo (SVG/PNG; auto-resize for header, favicon, OG).
- Pick primary + accent colours; DERIVE hover/soft/on tokens automatically.
- Live contrast check (white on primary/accent ≥ 4.5:1); block saving on fail,
  explain in plain English, suggest the nearest passing shade.
- Live preview of a sample page (header, buttons, class card, alert) before saving.
- Store as the festival's `theme` JSON (token overrides); keep section-9 token names.
- Mereth logo and the "Powered by Mereth" credit are never themed.

## 3. Yearly cycle: edition rollover and spreadsheet import

**Roll over last year** (admin action): new draft edition copying classes,
disciplines, venues, rooms, page content and settings; shift all dates by a chosen
offset (default one year), including age cut-off, with a review screen; bulk-adjust
fees (fixed or %, round to nearest 50p) with preview. Never copies entries,
competitors, orders, results or attendance.

**Spreadsheet import** (syllabus, venues): CSV/Excel upload; map columns (auto-match
"Class no.", "Age", "Fee", "Set piece"); validate every row with Zod (missing/zero
fees, impossible ages, duplicate codes, unknown disciplines, non-numeric time
limits); preview rows ready/warnings/errors with plain-English reasons; import on
confirmation in one transaction; keep the original file in Storage 90 days;
downloadable template.

## 4. Page content editor

Structured fields, NOT a page builder. Fixed sections per page.

**Content model:** `pages` (festival_id, page type home|about|contact|faq, status,
published_at, updated_by); `page_content` (JSON per page, Zod-validated per type,
keep last 10 published versions for rollback); `news_posts`; `faqs`; `sponsors`;
`media` (storage path, alt text REQUIRED, width, height, uploaded_by).

**Sections:** Home (slider ≤5 images w/ alt+caption, welcome text, optional notice
banner; key dates / Enter now / timetable link auto-filled from edition); About
(text + optional image); Contact (email, optional phone, text; contact form via
Resend with spam protection; never show email as plain text); News; FAQ
(reorderable); Sponsors (reorderable, footer/home).

**Editor:** rich text limited to paragraphs, bold, italic, links, lists (no
colours/fonts/headings); draft + publish with preview; images resized/optimised on
upload, alt text mandatory; autosave + warn on unsaved; owner/secretary only;
publishes logged to `audit_log`; accessible for non-technical volunteers.

## 5. Change requests ("Request a change")

Small portal inside Mereth admin (admin › Help › Request a change).

Festival side: form (page/area picker + "Other", type small tweak|structural|not
sure, description, attachments, needed-by); pre-submit note pointing to self-serve
editing; list with status/history; Approve/Decline a quote one-click; show
turnaround (3 working days small / 5 in peak Sep–Feb, both configurable).

Statuses: submitted, needs_info, quoted, approved, declined, in_progress, done,
cancelled.

Data: `change_requests` (festival_id, requested_by, page, type, description,
needed_by, status, included_in_allowance, quote_hours, quote_amount_pence,
approved_by, approved_at, completed_at); `change_request_events` (request_id,
from_status, to_status, message, actor, created_at). Attachments in Storage,
festival-scoped.

Super-admin: all requests filterable by status/festival, sorted by needed-by;
actions (ask info, mark included, send quote, start, complete, cancel) each with a
message; track a configurable included allowance per year per tier (default 0).

Emails via Resend: to `MERETH_SUPPORT_EMAIL` on submit/approve/decline; to
requester + owners on status changes / info requests / quotes; festival-branded for
festival-facing, Mereth-branded for mine; reply-to = support address.

Future hook: if `CHANGE_REQUEST_WEBHOOK_URL` set, POST signed JSON (HMAC with
`CHANGE_REQUEST_WEBHOOK_SECRET`) on every status change. Payment for quoted work is
handled outside Mereth (invoice).

## 6. Billing festivals

Annual subscription by the PREVIOUS year's confirmed entries. Every tier includes
every feature (no feature gating ever).

| Tier | Entries (prev year) | Price/yr |
|---|---|---|
| Bronze | up to 150 | £139 |
| Silver | 151–300 | £179 |
| Gold | 301–500 | £249 |
| Platinum | 501–1,500 | £299 |
| Diamond | 1,501+ | £399 |

Plus a one-off £100 setup fee for new festivals.

Build: tiers/prices in a config table (not code); `festival_subscriptions`
(festival_id, tier, price_pence, period_start, period_end, status
trial|active|past_due|cancelled, stripe_invoice_id, is_founding, notes); suggest
tier from previous edition's confirmed entries with manual override + reason;
founding-festival flag waives setup fee + discounted price; renewal invoices in May
via Stripe Invoicing from Mereth's own account with reminders; super-admin billing
screen; festival read-only Plan page.

The open question on how festivals receive ENTRY payments (Stripe Connect vs Mereth
collecting) still stands — ask before building entry payments if unsettled.

## 7. Phasing

**March MVP (added to build order):** public festival pages generated from data
(syllabus, class pages, timetable, results, venues); basic home (welcome text, one
image, key dates) + contact; self-serve theme editor; syllabus spreadsheet import;
custom domains for first festivals (super-admin set up); change requests with Resend.

**By summer 2027:** edition rollover; full page content editor (slider, news, FAQ,
sponsors, about, versioning/rollback); automated May renewal invoicing + billing
screens.

If any March item risks the core entrant flow, payments or scheduling, move it to
summer.

## 8. Unchanged

Everything else in `docs/BRIEF.md` still applies: children's data + privacy, RLS on
every table, design tokens, WCAG 2.2 AA, British English + warm plain language, and
the way of working (plan first, small reviewable steps, tests alongside domain
logic and RLS).
