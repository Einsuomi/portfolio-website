// POST /api/track — receives a page-view beacon, validates it, and inserts one row into Supabase.
// Runs as a Vercel serverless function (edge-safe: Web APIs only, no Node built-ins).
export const prerender = false;

import type { APIRoute } from 'astro';

// Max lengths match the Supabase column sizes defined in the migration.
const MAX_PATH_LEN = 512;
const MAX_REFERRER_LEN = 1024;

// Coarse device bucket: mobile if UA matches the pattern, otherwise desktop.
function getDevice(ua: string | null): 'mobile' | 'desktop' {
  if (ua && /Mobi|Android|iPhone|iPad/i.test(ua)) return 'mobile';
  return 'desktop';
}

// SHA-256 hash of ip + salt, returned as a hex string.
// Uses the Web Crypto API — available in all edge runtimes and modern browsers.
async function hashIp(ip: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(ip + salt);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const POST: APIRoute = async ({ request }) => {
  // Read raw text body: sendBeacon sends text/plain, so we can't rely on Content-Type: application/json.
  let body: { path?: unknown; referrer?: unknown };
  try {
    const text = await request.text();
    body = JSON.parse(text);
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }

  // JSON.parse can return null or a primitive — reject anything that isn't an object.
  if (typeof body !== 'object' || body === null) {
    return new Response('Invalid body', { status: 400 });
  }

  // Validate path: required, must start with '/', length within bounds.
  const path = body.path;
  if (
    typeof path !== 'string' ||
    !path.startsWith('/') ||
    path.length > MAX_PATH_LEN
  ) {
    return new Response('Invalid path', { status: 400 });
  }

  // Validate referrer: optional string within bounds, or null.
  const rawReferrer = body.referrer;
  let referrer: string | null = null;
  if (rawReferrer !== undefined && rawReferrer !== null) {
    if (typeof rawReferrer !== 'string' || rawReferrer.length > MAX_REFERRER_LEN) {
      return new Response('Invalid referrer', { status: 400 });
    }
    referrer = rawReferrer || null; // treat empty string as null
  }

  // Country code from Vercel's edge header — 2-letter ISO, or null.
  const country = request.headers.get('x-vercel-ip-country') || null;

  // Device bucket derived from UA header; raw UA is never stored.
  const device = getDevice(request.headers.get('user-agent'));

  // Privacy-safe IP hash: take the first entry of x-forwarded-for (the real client IP).
  // If no IP can be found, store null. The raw IP is never logged or returned.
  const salt = import.meta.env.IP_HASH_SALT as string;
  const xfwd = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const rawIp = xfwd ? xfwd.split(',')[0].trim() : (realIp || null);
  const ip_hash = rawIp && salt ? await hashIp(rawIp, salt) : null;

  // Build the row; event_type is always 'page_view' — never trusted from the client.
  const row = {
    event_type: 'page_view',
    path,
    referrer,
    country,
    ip_hash,
    device,
  };

  // Insert into Supabase via plain fetch. Prefer: return=minimal avoids a SELECT
  // which the anon INSERT-only RLS policy would reject.
  const supabaseUrl = import.meta.env.SUPABASE_URL as string;
  const supabaseKey = import.meta.env.SUPABASE_ANON_KEY as string;

  // Wrap fetch so a network-level failure (e.g. timeout, DNS error) returns 502
  // instead of throwing an unhandled exception and producing a 500.
  let res: Response;
  try {
    res = await fetch(`${supabaseUrl}/rest/v1/events`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
    });
  } catch {
    return new Response('Upstream error', { status: 502 });
  }

  if (!res.ok) {
    // Supabase returned an error — return 502 but don't expose the upstream body.
    return new Response('Upstream error', { status: 502 });
  }

  // 204 No Content — success, nothing to return.
  return new Response(null, { status: 204 });
};

// Explicitly reject all other HTTP methods.
export const ALL: APIRoute = () => new Response('Method not allowed', { status: 405 });
