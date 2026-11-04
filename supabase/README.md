# Supabase (database, auth, storage)

Versioned migrations in `migrations/`, the Alderford seed in `seed.sql`, and
pgTAP RLS tests in `tests/`. SQL is syntax-checked, but applying it and running
the RLS tests needs a Postgres database — either **local (Docker)** or a **cloud
project**.

## Local (recommended for development) — needs Docker Desktop

```bash
supabase start          # boots Postgres, Auth, Storage locally (Docker)
supabase db reset       # applies all migrations, then runs seed.sql
supabase test db        # runs the pgTAP RLS tests in tests/
supabase gen types typescript --local > src/lib/db/database.types.ts
```

Put the printed local API URL + anon/service keys into `.env.local`.

## Cloud project (for deploys, or if Docker isn't available)

```bash
supabase link --project-ref <your-project-ref>
supabase db push        # applies migrations to the cloud project
supabase gen types typescript --linked > src/lib/db/database.types.ts
```

`supabase test db` still needs Docker (it uses a local shadow database), so RLS
tests run locally or in CI, not against the cloud project directly.

## Notes

- The service role key bypasses RLS and is used only in server code (webhooks,
  Webflow sync, audit writes, and safe server-side reads for public pages).
- `seed.sql` writes `auth.users` directly (it runs as the superuser during
  `db reset`). All seeded people are fictional.
