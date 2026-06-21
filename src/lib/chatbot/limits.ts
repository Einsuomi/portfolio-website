// Abuse controls for the public chat endpoint — it spends a real API key, so these
// bound worst-case cost: per-IP rate limit, input/turn caps, and a global daily
// budget ceiling. Rate/budget state lives in Upstash/Vercel KV. If KV isn't
// configured (e.g. local dev), rate/budget checks are skipped (fail open) so dev
// still works; in production KV should always be set.

import { Redis } from '@upstash/redis';

// --- caps (tune as needed) ---
export const LIMITS = {
  MAX_MESSAGE_CHARS: 2000,    // per single user message
  MAX_HISTORY_CHARS: 14000,   // whole conversation sent in one request
  MAX_TURNS: 20,              // user turns per session
  MAX_TOKENS: 800,            // model reply cap
  RATE_PER_MIN: 15,           // requests per IP per 60s
  DAILY_BUDGET: 2000,         // global request ceiling per day (cost backstop)
};

let redis: Redis | null = null;
function kv(): Redis | null {
  if (redis) return redis;
  const url = import.meta.env.VERCEL_KV_REST_API_URL;
  const token = import.meta.env.VERCEL_KV_REST_API_TOKEN;
  if (!url || !token) return null; // not configured → checks skipped
  redis = new Redis({ url, token });
  return redis;
}

export type LimitVerdict =
  | { ok: true }
  | { ok: false; reason: 'rate' | 'budget' };

/** Per-IP rate limit (sliding-ish fixed window via INCR + EXPIRE). */
export async function checkRate(ipHash: string): Promise<LimitVerdict> {
  const r = kv();
  if (!r) return { ok: true };
  const key = `chat:rl:${ipHash}`;
  const n = await r.incr(key);
  if (n === 1) await r.expire(key, 60);
  if (n > LIMITS.RATE_PER_MIN) return { ok: false, reason: 'rate' };
  return { ok: true };
}

/** Global daily budget ceiling — degrades the chat to "unavailable" when exceeded. */
export async function checkBudget(): Promise<LimitVerdict> {
  const r = kv();
  if (!r) return { ok: true };
  const day = new Date().toISOString().slice(0, 10);
  const key = `chat:budget:${day}`;
  const n = await r.incr(key);
  if (n === 1) await r.expire(key, 60 * 60 * 26); // a bit over a day
  if (n > LIMITS.DAILY_BUDGET) return { ok: false, reason: 'budget' };
  return { ok: true };
}
