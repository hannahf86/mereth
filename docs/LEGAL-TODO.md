# Legal to-do (before the first real festival)

Not for building — a checklist of what Hannah needs in place before Mereth handles
real children's data and payments. Add to this as the build surfaces needs.

## Required before go-live

- **Privacy notice** — what data is collected (incl. children's DOBs), why, lawful
  basis, retention (the configurable purge after an edition), and data subject
  rights. Mereth is a data **processor**; each festival is the **controller**.
- **Data processing agreement (DPA) template** — between Mereth (processor) and each
  festival (controller): scope, security measures, sub-processors, breach handling,
  deletion on request.
- **Festival terms** (shown/accepted at entry), including:
  - **Photo/video consent** obligations — the festival is responsible for acting on
    consent (see brief update 02 §2).
  - **Document responsibilities** — festivals must download PDFs/the festival pack
    before the event (§4).
  - **Refunds are the festival's responsibility** — Mereth records, doesn't decide
    (§1, §3).
  - **Limitation of liability.**
- **Sub-processor list** — Supabase (DB/auth/storage, London), Vercel (hosting,
  London), Stripe (payments), Resend (email), plus any monitoring tool (e.g. Sentry).
- **Cookie notice** — minimal; essential cookies only (auth/session).
- **Insurance** — appropriate cover for handling the above.

## Noticed during the build

- Photo/video consent is collected per edition and shown to stewards; terms must set
  the festival's duty to act on it.
- Offline payments: Mereth records "paid" but the money moves outside Mereth — terms
  should make clear Mereth is not party to offline payments.
- Admin-created entries: festivals type in paper entries themselves; terms/DPA should
  cover the festival's responsibility for the accuracy and lawful basis of that data.
