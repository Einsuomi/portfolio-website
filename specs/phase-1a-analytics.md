# Phase 1a — Analytics Day 1

**Status: APPROVED 2026-06-10 — implemented on `feature/phase-1a-analytics`.**

## Why

Collection must ship with the very first deploy. Every week of delay is a week of
traffic history lost. The `/stats` page comes later (Phase 5); this phase is
collection only.

## What

Three pieces, smallest possible versions:

1. **Supabase `events` table** — stores page-view events.
2. **`POST /api/track`** — Astro API route running on Vercel Edge that validates the
   beacon payload, derives privacy-safe fields, and inserts one row.
3. **Page-view beacon** — tiny inline client script on every page, fires once per
   page view via `navigator.sendBeacon` on load.

## Schema (proposed)

```sql
create table events (
  id          bigint generated always as identity primary key,
  ts          timestamptz not null default now(),
  event_type  text not null default 'page_view',
  path        text not null,
  referrer    text,
  country     text,          -- 2-letter code from x-vercel-ip-country, nothing more
  ip_hash     text,          -- sha256(ip + IP_HASH_SALT), never the raw IP
  device      text           -- 'mobile' | 'desktop' coarse bucket from UA, no raw UA stored
);
```

## Hard constraints (GDPR / cost — reviewer enforces)

- Raw IP must NEVER be written to Supabase — only the salted SHA-256 hash.
- Only the country code is retained (`x-vercel-ip-country`), never the full IP or city.
- No raw user-agent string stored — coarse device bucket only.
- No cookies: no `Set-Cookie` header anywhere in the API response.
- Insert uses the Supabase anon key with an RLS policy allowing INSERT only
  (no SELECT/UPDATE/DELETE from the public key).
- Env vars only: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `IP_HASH_SALT` via
  `import.meta.env` — never hardcoded.
- Edge-safe code only: no Node-only APIs in the route.

## Acceptance criteria

- [ ] `events` table exists in Supabase with the schema above and the INSERT-only RLS policy.
- [ ] `curl -X POST /api/track` with a valid payload returns 2xx and a row appears in Supabase.
- [ ] Malformed payload returns 4xx and inserts nothing.
- [ ] Beacon fires exactly once per page view on every page; site works fully with JS disabled
      (beacon silently absent).
- [ ] No raw IP, raw UA, or cookie anywhere — verified by reading the inserted rows.
- [ ] `npm run build` and `astro check` pass.
- [ ] `npm run check-leaks` passes.

## Out of scope

- `/stats` page (Phase 5).
- Rate limiting beyond Supabase free-tier sanity (revisit if abuse appears).
- Custom events beyond `page_view` (the `event_type` column leaves the door open).
