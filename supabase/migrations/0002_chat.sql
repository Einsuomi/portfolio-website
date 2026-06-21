-- Chatbot logging: sessions + messages.
-- Same security posture as 0001_events: app code only ever INSERTs through the anon
-- key, governed by INSERT-only RLS. The session row is inserted once (immutable
-- context); per-turn messages go in chat_messages. turn_count and duration are
-- DERIVED from chat_messages at read time, so no UPDATE privilege is ever needed.

create table if not exists public.chat_sessions (
  session_id   text primary key,         -- client-generated opaque id (uuid)
  started_at   timestamptz not null default now(),
  ip_hash      text,                     -- sha256(ip + IP_HASH_SALT), never the raw IP
  country      text,                     -- 2-letter code from x-vercel-ip-country
  device       text,                     -- 'mobile' | 'desktop' coarse bucket
  opened_from  text,                     -- page/section the chat was opened from
  model        text,                     -- model id used for the session
  provider     text                      -- 'deepseek' | 'anthropic'
);

create table if not exists public.chat_messages (
  id          bigint generated always as identity primary key,
  session_id  text not null references public.chat_sessions (session_id),
  role        text not null,             -- 'user' | 'assistant'
  content     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists chat_messages_session_idx
  on public.chat_messages (session_id, created_at);

-- RLS: anon may INSERT only — no read-back, no updates, no deletes — on both tables.
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "anon insert only" on public.chat_sessions;
create policy "anon insert only"
  on public.chat_sessions for insert to anon with check (true);

drop policy if exists "anon insert only" on public.chat_messages;
create policy "anon insert only"
  on public.chat_messages for insert to anon with check (true);

-- Belt and braces: strip every other privilege from the public roles.
revoke all on table public.chat_sessions from anon, authenticated;
revoke all on table public.chat_messages from anon, authenticated;
grant insert on table public.chat_sessions to anon;
grant insert on table public.chat_messages to anon;

-- Retention + deletion (run over the admin connection, not the anon key).
-- Purge chat data older than the retention window. Adjust the interval to taste.
create or replace function public.purge_old_chat(retention interval default interval '6 months')
returns void language sql as $$
  delete from public.chat_messages where created_at < now() - retention;
  delete from public.chat_sessions where started_at < now() - retention;
$$;

-- Schedule the purge daily if pg_cron is available (enable the extension first):
--   create extension if not exists pg_cron;
--   select cron.schedule('purge-old-chat', '0 3 * * *', $$select public.purge_old_chat()$$);

-- Single-session deletion on request (admin):
--   delete from public.chat_messages where session_id = '<id>';
--   delete from public.chat_sessions where session_id = '<id>';
