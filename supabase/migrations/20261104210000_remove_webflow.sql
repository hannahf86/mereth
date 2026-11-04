-- Brief update 01: Webflow is out — Mereth serves the public festival sites.
-- Drop the Webflow sync table and the Webflow id on festival_integrations.
drop table if exists public.webflow_sync;
alter table public.festival_integrations
  drop column if exists webflow_site_id;
