-- Chat token-usage + cost/duration reporting.
-- Adds per-turn token counts to chat_messages (written on the assistant row), then a
-- read-time view that rolls each session up to turn_count, duration, total tokens, and
-- an estimated cost. Keeps the INSERT-only posture of 0002: nothing here needs UPDATE —
-- per-session totals are DERIVED, exactly like turn_count/duration already were.

alter table public.chat_messages
  add column if not exists input_tokens  int,   -- prompt tokens billed for this turn (assistant row)
  add column if not exists output_tokens int;   -- generated tokens for this turn (assistant row)

-- Per-session rollup: how long the recruiter talked and what it cost.
create or replace view public.chat_session_stats as
select
  s.session_id,
  s.started_at,
  s.country,
  s.device,
  s.opened_from,
  s.model,
  s.provider,
  count(*) filter (where m.role = 'user')                              as turn_count,
  max(m.created_at)                                                    as last_message_at,
  -- Duration = span from session start to the last message (timestamp-derived, no client timer).
  coalesce(extract(epoch from (max(m.created_at) - s.started_at))::int, 0) as duration_seconds,
  coalesce(sum(m.input_tokens),  0)                                    as input_tokens,
  coalesce(sum(m.output_tokens), 0)                                    as output_tokens,
  -- Upper-bound cost in USD using DeepSeek v4-pro list rates per 1M tokens:
  -- input cache-MISS $0.435, output $0.87. Real input cost is typically far lower because
  -- DeepSeek auto-caches the frozen corpus prefix (cache-hit $0.003625). Update if rates change.
  round(
    (coalesce(sum(m.input_tokens), 0) * 0.435 + coalesce(sum(m.output_tokens), 0) * 0.87)
    / 1000000.0, 6)                                                    as est_cost_usd
from public.chat_sessions s
left join public.chat_messages m on m.session_id = s.session_id
group by s.session_id;

-- Read over the admin/service connection (anon has no SELECT). No extra grants needed.
