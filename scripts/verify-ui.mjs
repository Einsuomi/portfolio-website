#!/usr/bin/env node
/**
 * verify-ui.mjs — Generic UI quality harness for the portfolio site.
 *
 * Checks each route × viewport × scroll position for:
 *   - Text element bounding-box collisions (ignoring intentional overlaps)
 *   - Horizontal overflow
 *   - Console errors and failed network requests
 *   - axe-core accessibility violations (serious/critical only to stdout)
 *
 * Usage:
 *   node scripts/verify-ui.mjs              # checks /, /dark, /light
 *   node scripts/verify-ui.mjs /dark /light # custom routes
 *
 * Prerequisites (one-time setup):
 *   npx playwright install chromium
 *
 * Server strategy:
 *   `astro preview` is NOT supported by the @astrojs/vercel adapter
 *   (it throws at startup). This script therefore always uses `astro dev`,
 *   which serves the source files directly via Vite. The trade-off vs a
 *   preview of the built output: HMR websocket noise in the console and
 *   Vite's dev-mode bundling rather than the optimised production bundle.
 *   For the invariants we check (text collision, overflow, axe a11y,
 *   console errors) this is equivalent — the same DOM is produced either
 *   way. A build check is still required before opening a PR; this harness
 *   is complementary, not a substitute.
 */

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOGS_DIR = join(ROOT, 'logs');

// ── constants ────────────────────────────────────────────────────────────

// Viewports: desktop and typical iPhone Pro dimensions
const VIEWPORTS = [
  { width: 1440, height: 900,  label: 'desktop' },
  { width: 390,  height: 844,  label: 'mobile'  },
];

// Number of evenly-spaced scroll steps across the full page height
const SCROLL_STEPS = 12;

// Wait after page load before starting scroll walk — lets time-based
// intro animations (the typed manifesto, intro fade-ins) finish so they
// don't produce spurious collision hits
const POST_LOAD_WAIT_MS = 3000;

// Settle time after each scroll step (one rAF + buffer for GSAP ticks)
const SCROLL_SETTLE_MS = 120;

// Collision threshold: two text boxes must overlap by MORE than this in
// BOTH axes before it counts as a collision
const OVERLAP_THRESHOLD_PX = 8;

// axe impact levels reported as findings (still all written to JSON)
const AXE_CRITICAL_IMPACTS = new Set(['critical', 'serious']);

// ── helpers ──────────────────────────────────────────────────────────────

/** Find a free TCP port by briefly binding to port 0 */
function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.listen(0, '127.0.0.1', () => {
      const port = srv.address().port;
      srv.close(() => resolve(port));
    });
    srv.on('error', reject);
  });
}

/**
 * Poll via HTTP GET until the server responds (any status) or timeout.
 * HTTP polling is more reliable than TCP connect for astro preview, which
 * may bind the port before it's ready to serve requests.
 */
async function waitForHttp(url, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await fetch(url, { signal: AbortSignal.timeout(1000) });
      return; // any response = server is up
    } catch {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  throw new Error(`Server did not respond at ${url} within ${timeoutMs}ms`);
}

/** Read the axe-core bundle from node_modules for page injection */
function readAxeScript() {
  const axePath = join(ROOT, 'node_modules', 'axe-core', 'axe.min.js');
  if (!existsSync(axePath)) {
    throw new Error('axe-core not found in node_modules. Run: npm install');
  }
  return readFileSync(axePath, 'utf8');
}

/** Today's date as YYYY-MM-DD for the output filename */
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ── server startup ────────────────────────────────────────────────────────

/**
 * Start a local preview/dev server.
 * Returns { proc, port, mode }.
 */
async function startServer() {
  const port = await getFreePort();

  // The @astrojs/vercel adapter does not support `astro preview` — it
  // throws an error at startup. Always use `astro dev` instead.
  // astro dev serves source files directly via Vite; it does not require
  // a prior build. See comment at the top of this file for the trade-off.
  const mode = 'dev';
  const args = ['astro', 'dev', '--port', String(port), '--host', '127.0.0.1'];

  const proc = spawn('npx', args, {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  // Suppress output but keep the pipes open (otherwise the child may block)
  proc.stdout.on('data', () => {});
  proc.stderr.on('data', () => {});

  await waitForHttp(`http://127.0.0.1:${port}/`);
  return { proc, port, mode };
}

// ── browser-side collision check (runs in page context via page.evaluate) ──

/**
 * Walk all visible text-bearing elements and return pairs whose bounding
 * boxes intersect by more than the threshold in both axes.
 * Elements inside a [data-overlap-ok] ancestor are exempt — use that
 * attribute to mark intentional design overlaps (e.g. the dark route's
 * word-transition coexistence).
 */
const findCollisions = ({ threshold }) => {
  // Gather all leaf-ish elements that carry visible text
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  const els = [];
  let node;
  while ((node = walker.nextNode())) {
    if (!node.textContent.trim()) continue;
    const el = node.parentElement;
    if (!el || seen.has(el)) continue;
    if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue;
    seen.add(el);

    const st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden') continue;
    if (parseFloat(st.opacity) <= 0.15) continue;

    els.push(el);
  }

  // Build rect cache once (getBoundingClientRect triggers layout, so batch it)
  const rects = els.map(el => el.getBoundingClientRect());

  // Returns true if a is an ancestor or descendant of b
  const related = (a, b) => a.contains(b) || b.contains(a);

  // Returns true if el or any ancestor carries data-overlap-ok
  const overlapOk = (el) => {
    let cur = el;
    while (cur && cur !== document.body) {
      if (cur.hasAttribute && cur.hasAttribute('data-overlap-ok')) return true;
      cur = cur.parentElement;
    }
    return false;
  };

  // Short selector for readable reporting
  const shortSel = (el) => {
    const parts = [];
    let cur = el;
    while (cur && cur !== document.body) {
      if (cur.id) { parts.unshift('#' + cur.id); break; }
      let s = cur.tagName.toLowerCase();
      if (cur.className) {
        const cls = String(cur.className).trim().split(/\s+/).slice(0, 2).join('.');
        if (cls) s += '.' + cls;
      }
      parts.unshift(s);
      cur = cur.parentElement;
    }
    return parts.join(' > ');
  };

  const vw = window.innerWidth, vh = window.innerHeight;
  const results = [];

  for (let i = 0; i < els.length; i++) {
    const a = rects[i];
    // Skip zero-size or fully off-screen elements
    if (!a.width || !a.height) continue;
    if (a.bottom < 0 || a.top > vh || a.right < 0 || a.left > vw) continue;
    if (overlapOk(els[i])) continue;

    for (let j = i + 1; j < els.length; j++) {
      if (related(els[i], els[j])) continue;
      if (overlapOk(els[j])) continue;

      const b = rects[j];
      if (!b.width || !b.height) continue;
      if (b.bottom < 0 || b.top > vh || b.right < 0 || b.left > vw) continue;

      const ox = Math.min(a.right, b.right)   - Math.max(a.left, b.left);
      const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);

      if (ox > threshold && oy > threshold) {
        results.push({
          a: shortSel(els[i]),
          b: shortSel(els[j]),
          aText: els[i].textContent.trim().slice(0, 50),
          bText: els[j].textContent.trim().slice(0, 50),
          overlapX: Math.round(ox),
          overlapY: Math.round(oy),
        });
      }
    }
  }
  return results;
};

/** Returns true when the page scrollWidth exceeds the viewport width by >1px */
const hasHorizOverflow = () =>
  document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;

// ── main ──────────────────────────────────────────────────────────────────

async function main() {
  // Routes from CLI args (must start with /) or the defaults
  const cliRoutes = process.argv.slice(2).filter(a => a.startsWith('/'));
  const ROUTES = cliRoutes.length ? cliRoutes : ['/', '/dark', '/light'];

  console.log(`\nUI Verification Harness`);
  console.log(`Routes:    ${ROUTES.join(', ')}`);
  console.log(`Viewports: desktop 1440×900, mobile 390×844`);
  console.log(`─────────────────────────────────────────────────────`);

  let serverInfo;
  try {
    serverInfo = await startServer();
    console.log(`Server:    astro ${serverInfo.mode} → http://127.0.0.1:${serverInfo.port}\n`);
  } catch (err) {
    console.error(`FATAL: ${err.message}`);
    process.exit(1);
  }

  const BASE_URL = `http://127.0.0.1:${serverInfo.port}`;
  const AXE_JS = readAxeScript();

  const browser = await chromium.launch();
  const allFindings = [];
  let anyFail = false;

  try {
    for (const route of ROUTES) {
      for (const vp of VIEWPORTS) {
        // Each route×viewport gets a fresh browser context (clean state)
        const ctx = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          // Force reduced-motion: prevents time-based GSAP animations from
          // running during the scroll walk, making scroll-position checks
          // deterministic (scroll-scrubbed animations ARE still exercised
          // because we drive them by scrolling)
          reducedMotion: 'reduce',
        });
        const page = await ctx.newPage();

        // Capture console errors and failed/non-2xx requests for this visit.
        // Filter out Vite dev-server internal URLs — these only exist in dev
        // mode and will not appear in production builds.
        const isViteInternal = (url) =>
          url.includes('/@vite/') ||
          url.includes('/@id/') ||
          url.includes('/@fs/') ||
          url.includes('/.vite/') ||
          url.includes('/node_modules/.vite/') ||
          url.includes('__vite') ||
          url.includes('dev-toolbar');

        // Filter "Outdated Optimize Dep" console messages — Vite dev-only noise
        const isViteConsoleNoise = (text) =>
          text.includes('Outdated Optimize Dep') ||
          text.includes('504') ||
          text.includes('hmr') ||
          text.includes('[vite]');

        const consoleErrors   = [];
        const failedRequests  = [];
        page.on('console', msg => {
          if (msg.type() === 'error' && !isViteConsoleNoise(msg.text())) {
            consoleErrors.push(msg.text());
          }
        });
        page.on('requestfailed', req => {
          if (!isViteInternal(req.url())) {
            failedRequests.push(`FAILED  ${req.failure()?.errorText}  ${req.url()}`);
          }
        });
        page.on('response', resp => {
          if (resp.status() >= 400 && !isViteInternal(resp.url())) {
            failedRequests.push(`HTTP ${resp.status()}  ${resp.url()}`);
          }
        });

        await page.goto(BASE_URL + route, { waitUntil: 'networkidle' });

        // Let time-based intro animations finish before walking
        await page.waitForTimeout(POST_LOAD_WAIT_MS);

        // ── axe-core run at top-of-page (consistent, pre-scroll state) ──
        await page.addScriptTag({ content: AXE_JS });
        const axeRaw = await page.evaluate(() =>
          window.axe.run(document, { resultTypes: ['violations'] })
        );
        const axeAll      = axeRaw.violations || [];
        const axeCritical = axeAll.filter(v => {
          // AXE_CRITICAL_IMPACTS is not accessible inside page.evaluate, so
          // we filter in Node after receiving the result
          return v.impact === 'critical' || v.impact === 'serious';
        });

        // ── scroll walk ──────────────────────────────────────────────────
        const scrollHeight = await page.evaluate(
          () => document.documentElement.scrollHeight
        );
        const maxScroll = Math.max(0, scrollHeight - vp.height);

        let horizOverflow = false;
        const rawCollisions = [];

        for (let step = 0; step <= SCROLL_STEPS; step++) {
          const y = step === 0 ? 0 : Math.round((step / SCROLL_STEPS) * maxScroll);

          // Drive Lenis virtual scroll when available (dark.astro exposes
          // window.__lenis), else use native window.scrollTo
          await page.evaluate(async (scrollY) => {
            if (window.__lenis) {
              window.__lenis.scrollTo(scrollY, { immediate: true });
            } else {
              window.scrollTo(0, scrollY);
            }
            // Wait two rAF ticks so GSAP/ScrollTrigger can process the update
            await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
          }, y);

          await page.waitForTimeout(SCROLL_SETTLE_MS);

          if (await page.evaluate(hasHorizOverflow)) horizOverflow = true;

          const cols = await page.evaluate(findCollisions, { threshold: OVERLAP_THRESHOLD_PX });
          for (const c of cols) rawCollisions.push({ scrollY: y, ...c });
        }

        // Deduplicate collisions: same element pair at multiple scroll Ys counts once
        const seenPairs = new Set();
        const collisions = rawCollisions.filter(c => {
          const key = `${c.a}|||${c.b}`;
          if (seenPairs.has(key)) return false;
          seenPairs.add(key);
          return true;
        });

        // ── record findings ──────────────────────────────────────────────
        const entry = {
          route,
          viewport: vp.label,
          collisions,
          horizOverflow,
          consoleErrors,
          failedRequests,
          axe: {
            critical: axeCritical.map(v => ({
              id:          v.id,
              impact:      v.impact,
              description: v.description,
              nodes:       v.nodes.slice(0, 3).map(n => n.target.join(', ')),
            })),
            allViolations: axeAll.map(v => ({ id: v.id, impact: v.impact })),
          },
        };
        allFindings.push(entry);

        const failCount =
          collisions.length +
          (horizOverflow ? 1 : 0) +
          consoleErrors.length +
          failedRequests.length +
          axeCritical.length;

        if (failCount > 0) anyFail = true;

        // ── stdout summary ───────────────────────────────────────────────
        const badge = failCount === 0 ? 'PASS' : 'FAIL';
        console.log(`${badge}  ${route}  [${vp.label}]`);

        if (collisions.length) {
          console.log(`  text collisions: ${collisions.length}`);
          collisions.slice(0, 3).forEach(c =>
            console.log(`    scrollY=${c.scrollY}  "${c.aText}" ↔ "${c.bText}"  (ox=${c.overlapX} oy=${c.overlapY})`)
          );
          if (collisions.length > 3) console.log(`    … and ${collisions.length - 3} more`);
        }
        if (horizOverflow) console.log(`  horizontal overflow: YES`);
        if (consoleErrors.length) {
          console.log(`  console errors: ${consoleErrors.length}`);
          consoleErrors.slice(0, 3).forEach(e => console.log(`    ${e.slice(0, 120)}`));
        }
        if (failedRequests.length) {
          console.log(`  failed requests: ${failedRequests.length}`);
          failedRequests.slice(0, 3).forEach(r => console.log(`    ${r.slice(0, 120)}`));
        }
        if (axeCritical.length) {
          console.log(`  axe critical/serious: ${axeCritical.length}`);
          axeCritical.slice(0, 3).forEach(v =>
            console.log(`    [${v.impact}] ${v.id}: ${v.description.slice(0, 90)}`)
          );
        }
        if (failCount === 0) console.log(`  (no findings)`);

        await ctx.close();
      }
    }
  } finally {
    await browser.close();
    serverInfo.proc.kill('SIGTERM');
  }

  // Write full JSON report to logs/ (gitignored)
  mkdirSync(LOGS_DIR, { recursive: true });
  const outFile = join(LOGS_DIR, `verify-ui-${todayStr()}.json`);
  writeFileSync(outFile, JSON.stringify(
    { generatedAt: new Date().toISOString(), routes: ROUTES, findings: allFindings },
    null, 2
  ));

  console.log(`\n─────────────────────────────────────────────────────`);
  console.log(`Full JSON report: ${outFile}`);
  console.log(`Overall result:   ${anyFail ? 'FAIL' : 'PASS'}`);

  process.exit(anyFail ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
