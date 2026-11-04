# Mereth — Brief update 02

Updates `docs/BRIEF.md` and `docs/BRIEF-UPDATE-01.md`. Where they conflict, **this
document wins**. Decisions logged in `docs/DECISIONS.md`.

## 1. Responsibilities: what Mereth does and doesn't do

Design so festivals handle these themselves; write help text/empty states to make
the boundaries clear and friendly, never blunt.
- **Paper entries:** Mereth doesn't process paper forms — festivals type them in.
- **Offline payments:** cheques/cash/bank transfers are between entrant and
  festival; Mereth only records that they've been paid.
- **Refunds:** each festival sets and applies its own policy; Mereth records
  withdrawals/refunds but doesn't decide them.
- **Last-minute withdrawals:** handled on the day by stewards in attendance (E.02),
  not by changing running orders/PDFs after issue.
- **PDFs:** generated and available in admin; festivals must download before the
  festival.
- **Photography:** the festival acts on photo consent; Mereth collects it and makes
  it visible.

## 2. Photo and video consent

Per competitor, **per edition**, collected at entry time. Separate from
`results_name_consent`.
- Data: add `media_consent` — recommend a `competitor_edition_consents` table
  (competitor_id, edition_id, media_consent granted/refused, results_name_consent,
  given_by, given_at). Per edition (families may change yearly). Changing consent
  creates a new record; keep history.
- Entrant (P.04 + teacher): a **required** question (not pre-ticked): "Can the
  festival take photos or video of [first name] performing?" Yes/No + one line on
  use (festival-customisable). Parents can change from My entries until the festival
  begins. Teachers may record on the parent's behalf only if they confirm they have
  it; else "consent needed" and the parent is asked by email at payment-link time.
- Festival: a Consent column (filterable) in entries; event-day banners (E.01/E.02)
  "N competitors haven't given photo consent" with names to stewards; a clear "No
  photos" marker on steward sheets and running-order PDFs; a settings page for the
  festival's own photography policy text/link, shown at entry.
- Add an admin-checklist line ("Remind photographers and stewards about photo
  consent"); include consent obligations in festival terms; placeholder in
  `docs/LEGAL-TODO.md`.

## 3. Entries and payments added by the festival

**Add an entry on someone's behalf** (admin › Entries › Add entry): search existing
account holder/competitor or create new with minimal details; same eligibility,
capacity and clash rules; admin can override eligibility with a recorded reason
(audit log); optional email inviting them to claim the account; mark `source='admin'`
and who created it.

**Mark as paid offline:** on an order or entry, mark paid by cheque/cash/transfer
with optional reference + date (confirms the entry like a Stripe payment); undo with
a reason (audit log); bulk action; CSV/reports show the payment method so treasurers
reconcile Stripe vs offline separately.

**Withdrawals and refunds:** admin marks an entry withdrawn with a reason and an
optional refund record (amount, method, date). Stripe payments → a button to refund
via Stripe (summer); offline → just record. Withdrawn entries are removed from
unpublished running orders; after publish, withdrawing warns that printed docs won't
change and the competitor shows as "withdrawn" on the steward attendance screen.

## 4. Festival pack and pre-festival checklist

**Festival pack** (admin › Documents): a Download festival pack button building one
ZIP of every current PDF, in folders by day and venue (running orders, mark sheets,
steward sheets, certificates, full timetable). Show when each doc was last generated
and flag out-of-date ones. One email to owners/secretaries when the pack is first
ready after publish, and a reminder 7 days before if nobody downloaded it. Record
who downloaded and when.

**Pre-festival checklist** (dashboard, from 14 days before day one): timetable
published; all entries paid/marked paid; pack downloaded (again after changes);
stewards + adjudicators assigned to every class; photographers/stewards reminded
about consent; venues + rooms confirmed. Auto-tick where possible; calm and
encouraging; help text makes festival document-responsibility clear.

## 5. Data location, backups and exports

- **Hosting region:** Supabase project in **London (eu-west-2)**; Vercel functions
  in London (lhr1) where possible. Document in `docs/INFRASTRUCTURE.md`.
- **Backups:** confirm Supabase Pro daily backups; restore runbook in
  `docs/RUNBOOKS.md`; do a test restore into a separate project before the first
  real festival. Note GitHub holds code, not data.
- **Storage:** generated PDFs in Supabase Storage; note backup approach or confirm
  every PDF can be regenerated from data (preferred).
- **Data export:** festival owners export all their data any time as a ZIP of CSVs
  (classes, venues, competitors, entries, orders/payments, results, attendance,
  consent). Our answer to "what if Mereth stops?". Log every export in the audit log.
- **Monitoring:** basic uptime + error alerts (uptime checker + Sentry or similar)
  emailing me on outages or payment/webhook failures. Keep personal data out of
  error reports.

## 6. Phasing

**March MVP:** photo/video consent at entry + consent column + event-day banners;
add an entry on someone's behalf; mark as paid offline (incl. bulk); withdrawals with
refund records; festival pack download + out-of-date flags; UK hosting region, a
tested backup restore, and the data export.

**Summer 2027:** claim-your-account emails for admin-created contacts; Stripe refunds
from admin; the pre-festival checklist on the dashboard; pack-ready + reminder emails.

## 7. Legal to-do

See `docs/LEGAL-TODO.md` — privacy notice, DPA template, festival terms (photo
consent, document responsibilities, refunds being the festival's responsibility,
limitation of liability), sub-processor list, cookie notice, insurance.
