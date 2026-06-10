-- Phase 1a analytics: page-view events table.
-- Applied by the architect over the admin connection; app code only ever INSERTs
-- through the anon key, governed by the RLS policy below.

create table if not exists public.events (
  id          bigint generated always as identity primary key,
  ts          timestamptz not null default now(),
  event_type  text not null default 'page_view',
  path        text not null,
  referrer    text,
  country     text,          -- 2-letter code from x-vercel-ip-country, nothing more
  ip_hash     text,          -- sha256(ip + IP_HASH_SALT), never the raw IP
  device      text           -- 'mobile' | 'desktop' coarse bucket, no raw UA stored
);

-- RLS: public (anon) key may INSERT only — no read-back, no updates, no deletes.
alter table public.events enable row level security;

drop policy if exists "anon insert only" on public.events;
create policy "anon insert only"
  on public.events
  for insert
  to anon
  with check (true);

-- Belt and braces: strip every other table privilege from the public roles so a
-- SELECT/UPDATE/DELETE errors outright instead of returning RLS-empty results.
revoke all on table public.events from anon, authenticated;
grant insert on table public.events to anon;
