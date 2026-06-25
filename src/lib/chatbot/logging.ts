// Server-side chat logging to Supabase, reusing the /api/track posture: INSERT-only
// via the anon key, written from the function (never the browser). Session row is
// inserted once (first turn); messages are inserted per turn. Best-effort — a logging
// failure must never break the chat, so callers fire-and-forget and we swallow errors.

// SHA-256 of ip + salt (hex). Web Crypto — edge-safe. Same as /api/track.
export async function hashIp(ip: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(ip + salt);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function supa() {
  return {
    url: import.meta.env.SUPABASE_URL as string,
    key: import.meta.env.SUPABASE_ANON_KEY as string,
  };
}

async function insert(table: string, row: unknown): Promise<void> {
  const { url, key } = supa();
  if (!url || !key) return; // not configured → skip silently
  try {
    await fetch(`${url}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal', // anon has no SELECT; don't ask for the row back
      },
      body: JSON.stringify(row),
    });
  } catch {
    // best-effort: never let logging break the chat
  }
}

export interface SessionMeta {
  session_id: string;
  ip_hash: string | null;
  country: string | null;
  device: string | null;
  opened_from: string | null;
  model: string;
  provider: string;
}

/** Insert the immutable session row (first turn only). */
export function logSession(meta: SessionMeta): Promise<void> {
  return insert('chat_sessions', meta);
}

/** Insert one turn's two messages (user + assistant). Token usage from the model
 *  response is stored on the assistant row so per-session cost is derivable at read
 *  time (SUM over messages), consistent with how duration/turn_count are derived. */
export function logMessages(
  sessionId: string,
  userText: string,
  assistantText: string,
  usage: { input_tokens: number; output_tokens: number } | null = null,
): Promise<void> {
  // Both rows must carry the SAME keys: PostgREST bulk insert rejects a heterogeneous
  // array ("All object keys must match"). Token counts only apply to the assistant turn,
  // so the user row gets explicit nulls rather than omitting the columns.
  return insert('chat_messages', [
    {
      session_id: sessionId,
      role: 'user',
      content: userText,
      input_tokens: null,
      output_tokens: null,
    },
    {
      session_id: sessionId,
      role: 'assistant',
      content: assistantText,
      input_tokens: usage?.input_tokens ?? null,
      output_tokens: usage?.output_tokens ?? null,
    },
  ]);
}
