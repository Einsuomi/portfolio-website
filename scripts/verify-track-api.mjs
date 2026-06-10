#!/usr/bin/env node
// CI/local check for POST /api/track: starts the dev server, probes the
// endpoint's rejection paths, and (only when Supabase env vars are present)
// the happy path. Exits non-zero on any unexpected status.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

// nothing to verify on branches that don't carry the route yet
if (!existsSync('src/pages/api/track.ts')) {
  console.log('SKIP  src/pages/api/track.ts not present on this branch');
  process.exit(0);
}

const BASE = 'http://localhost:4321';
// dev-server CSRF guard rejects POSTs without a matching Origin header
const ORIGIN = { Origin: BASE };

const dev = spawn('npx', ['astro', 'dev'], { stdio: ['ignore', 'pipe', 'pipe'] });
dev.stdout.on('data', () => {});
dev.stderr.on('data', () => {});

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      await fetch(BASE + '/');
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error('dev server did not start within 60s');
}

async function expect(name, expected, init) {
  const res = await fetch(BASE + '/api/track', init);
  const ok = res.status === expected;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: got ${res.status}, want ${expected}`);
  // a Set-Cookie header anywhere is a GDPR violation per the phase 1a spec
  if (res.headers.get('set-cookie')) {
    console.log(`FAIL  ${name}: response carries Set-Cookie`);
    return false;
  }
  return ok;
}

let failed = false;
try {
  await waitForServer();

  const post = (body) => ({ method: 'POST', headers: ORIGIN, body });
  const cases = [
    ['bad JSON', 400, post('not json')],
    ['null payload', 400, post('null')],
    ['primitive payload', 400, post('42')],
    ['path without leading slash', 400, post('{"path":"no-slash"}')],
    ['oversize path', 400, post(JSON.stringify({ path: '/' + 'a'.repeat(600) }))],
    ['GET method', 405, { method: 'GET', headers: ORIGIN }],
  ];

  // happy path inserts a real row, so only run it where Supabase creds exist
  // (locally via .env.local; skipped in CI which has no secrets)
  if (process.env.SUPABASE_URL || process.env.CI !== 'true') {
    cases.push(['valid payload', 204, post('{"path":"/ci-verify"}')]);
  } else {
    console.log('SKIP  valid payload (no Supabase env in CI)');
  }

  for (const [name, expected, init] of cases) {
    if (!(await expect(name, expected, init))) failed = true;
  }
} catch (e) {
  console.error('ERROR:', e.message);
  failed = true;
} finally {
  dev.kill('SIGTERM');
}

process.exit(failed ? 1 : 0);
