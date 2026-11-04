-- Helpers: extensions, the updated_at trigger, and age_on().
-- age_on() is the single source of truth for age eligibility and is mirrored in
-- TypeScript (src/lib/domain/eligibility/age.ts) with tests that must agree.

create extension if not exists citext;

-- Touch updated_at on every row update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Whole years old on the cutoff date (NOT today). Deterministic + immutable so
-- it can be used in generated columns, constraints and indexes.
create or replace function public.age_on(dob date, cutoff date)
returns integer
language sql
immutable
as $$
  select (
    extract(year from cutoff)::int - extract(year from dob)::int
    - case
        when (extract(month from cutoff), extract(day from cutoff))
             < (extract(month from dob), extract(day from dob))
        then 1
        else 0
      end
  );
$$;
