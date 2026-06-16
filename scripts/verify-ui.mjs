#!/usr/bin/env node
/**
 * verify-ui.mjs — Generic UI quality harness for the portfolio site.
 *
 * Checks each route × viewport × mode (reduced-motion + live) for:
 *   - Text element bounding-box collisions (ignoring intentional overlaps)
 *   - Horizontal overflow
 *   - Console errors and failed network requests
 *   - axe-core accessibility violations (serious/critical only to stdout)
 *   - Hero readability at t≈1s and t≈5s after navigation (live mode only)
 *
 * Usage:
 *   node scripts/verify-ui.mjs        # checks / (dark homepage)
 *   node scripts/verify-ui.mjs /foo   # custom routes
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
 *
 * Overlap exemption semantics (data-overlap-ok):
 *   A collision between element A and element B is exempt ONLY when both A
 *   and B share the SAME closest [data-overlap-ok] ancestor. An element
 *   inside a [data-overlap-ok] subtree that collides with content OUTSIDE
 *   that subtree is a real finding — the exemption is pair-scoped, not
 *   element-scoped. This is stricter than v1, which exempted any element
 *   that had any [data-overlap-ok] ancestor regardless of the other party.
 */

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
// pngjs: decode canvas screenshots pixel-by-pixel to find the WebGL figure footprint.
// devDependency only — not imported by any runtime/browser code.
import { PNG } from 'pngjs';

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

// Wait after page load in reduced-motion mode before starting scroll walk.
// Lets time-based intro animations (typed manifesto, intro fade-ins) finish
// so they don't produce spurious collision hits.
const POST_LOAD_WAIT_MS = 3000;

// Wait after page load in live mode — long enough for intro animations to
// run and begin settling before we start the collision walk.
const POST_LOAD_WAIT_LIVE_MS = 4000;

// Settle time after each scroll step (one rAF + buffer for GSAP ticks)
const SCROLL_SETTLE_MS = 120;

// Extra settle for GSAP scrub after each scroll step in live mode —
// scroll-triggered animations may still be tweening after the rAF pair.
const SCROLL_SETTLE_LIVE_MS = 300;

// Collision threshold: two text boxes must overlap by MORE than this in
// BOTH axes before it counts as a collision
const OVERLAP_THRESHOLD_PX = 8;

// axe impact levels reported as findings (still all written to JSON)
const AXE_CRITICAL_IMPACTS = new Set(['critical', 'serious']);

// Hero check: minimum font-size (px) for a "visible headline" at t=1s / t=5s
const HERO_MIN_FONT_SIZE_PX = 24;

// ── canvas/figure vs text overlap constants ──────────────────────────────
// How long to wait (ms) after scrolling a beat to its centre before sampling
// the canvas. The uMix morph tween runs ~1.7s; 2200ms gives it a comfortable
// margin to settle onto the target shape before we read pixels.
const BEAT_MORPH_SETTLE_MS = 2200;

// Pixel brightness threshold (0–255 per channel average) above which a pixel
// is counted as "bright" (possibly figure or ambient dot). Background (#060606)
// reads as ~6/255 ≈ 2%; isolated ambient dots land around 20–40; figure core 50+.
const FIGURE_BRIGHTNESS_THRESHOLD = 40;

// Figure-core isolation via a coarse density grid.
//
// Why a grid + baseline (not per-pixel local density): Round A added a wide,
// screen-filling AMBIENT field, so "locally dense" bright pixels now appear
// over the text on every beat — the old per-pixel measure flagged all 7 beats
// (including hero/neste where the figure is plainly on the opposite side).
// The fix: the ambient field is roughly UNIFORM across the canvas, while the
// figure is a concentrated high-density SPIKE. So we tile the canvas into
// coarse cells, take the median cell density as the ambient baseline, and call
// a cell "figure" only when its density is a strong outlier above that baseline.
// Ambient cells sit at the baseline and drop out; the figure cells are what
// remain. Then we ask: do those figure cells land inside the text rect?

// Cell edge length in screenshot px. 24px → a 1440-wide canvas tiles into 60
// columns: coarse enough to average out ambient sparsity, fine enough to
// localize the figure mass to a region of the screen.
const GRID_CELL_PX = 24;

// A cell counts as "figure" when its bright-pixel density exceeds the ambient
// baseline by this fraction of the (p90 − median) spread, AND clears an absolute
// floor (so a near-empty ambient frame still needs real mass to register).
const FIGURE_OUTLIER_K = 0.5;
const FIGURE_MIN_CELL_DENSITY = 0.15; // ≥15% of the cell's pixels must be bright

// Overlap fires when this fraction of the text rect's cells are figure cells.
// Ambient is excluded by the baseline step, so a clear beat → ~0; the figure
// landing on the words → well above this line.
//
// Calibrated 2026-06-16 against the clean canvas (DOM hidden). Measured band:
//   clear beats / minor edge-clips: 0–3.7% (e.g. postnord 2.7% = wordmark sits
//     just above the text and clips the top edge; mobile projects 3.7%)
//   true occlusion: bot 18.4% (centred figure on the centred chat input)
// 7% sits in the wide gap — passes minor clips (which A2 placement clears
// anyway) and fails dense, readability-harming occlusion. This is occlusion
// detection, not "any figure pixel touching the rect".
const FIGURE_OVERLAP_THRESHOLD = 0.07; // 7% of text-rect cells covered by figure

// Text-box selectors checked per beat, in priority order. The first one found
// in the section is used. Matches the actual HTML structure in index.astro.
const BEAT_TEXT_SELECTORS = ['.hero__inner', '.split__pad', '.bot__inner'];

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
async function waitForHttp(url, timeoutMs = 120_000) {
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
 *
 * Overlap exemption (pair-scoped): a collision between A and B is exempt
 * ONLY when both elements share the SAME [data-overlap-ok] ancestor — i.e.
 * their closest such ancestor is the exact same DOM node. An element inside
 * a [data-overlap-ok] subtree that collides with content outside that subtree
 * is a real finding. This is stricter than a subtree-wide exemption.
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

    // invisible (opacity:0) text is not a visible collision, consistent with
    // skipping display:none/visibility:hidden — walk ancestors to get effective opacity
    let effectiveOpacity = 1;
    let ancestor = el;
    while (ancestor && ancestor !== document.body) {
      effectiveOpacity *= parseFloat(getComputedStyle(ancestor).opacity);
      ancestor = ancestor.parentElement;
    }
    if (effectiveOpacity < 0.01) continue;

    // data-fixed-chrome marks intentional floating UI (fixed nav, HUD, rails)
    // that is exempt from content-overlap assertions. Designers can mark any
    // fixed chrome the same way — it will be skipped on both sides of the check.
    if (el.closest('[data-fixed-chrome]')) continue;

    els.push(el);
  }

  // Build rect cache once (getBoundingClientRect triggers layout, so batch it)
  const rects = els.map(el => el.getBoundingClientRect());

  // Returns true if a is an ancestor or descendant of b
  const related = (a, b) => a.contains(b) || b.contains(a);

  /**
   * Returns the closest [data-overlap-ok] ancestor of el (or null).
   * Used to check if two elements share the SAME exemption container.
   */
  const overlapContainer = (el) => {
    let cur = el;
    while (cur && cur !== document.body) {
      if (cur.hasAttribute && cur.hasAttribute('data-overlap-ok')) return cur;
      cur = cur.parentElement;
    }
    return null;
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

    const containerA = overlapContainer(els[i]);

    for (let j = i + 1; j < els.length; j++) {
      if (related(els[i], els[j])) continue;

      const b = rects[j];
      if (!b.width || !b.height) continue;
      if (b.bottom < 0 || b.top > vh || b.right < 0 || b.left > vw) continue;

      const ox = Math.min(a.right, b.right)   - Math.max(a.left, b.left);
      const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);

      if (ox > threshold && oy > threshold) {
        // Exempt only when both elements are inside the SAME data-overlap-ok
        // container. If either has no container, or they have different ones,
        // the collision is a real finding.
        const containerB = overlapContainer(els[j]);
        if (containerA && containerB && containerA === containerB) continue;

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

/**
 * Hero readability check — runs at scroll position 0 in live mode.
 * Returns an object describing what was found at this snapshot moment.
 * minFontSize: minimum px font-size to count as a "headline".
 */
const checkHeroReadability = ({ minFontSize }) => {
  const vh = window.innerHeight;
  const vw = window.innerWidth;

  // Collect all visible text elements in the first viewport
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const largeTextEls = [];
  const seen = new Set();
  let node;

  while ((node = walker.nextNode())) {
    if (!node.textContent.trim()) continue;
    const el = node.parentElement;
    if (!el || seen.has(el)) continue;
    if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue;
    seen.add(el);

    const st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden') continue;
    const opacity = parseFloat(st.opacity);
    if (opacity <= 0.15) continue;

    const rect = el.getBoundingClientRect();
    // Must be within the first viewport
    if (rect.bottom < 0 || rect.top > vh || rect.right < 0 || rect.left > vw) continue;
    if (!rect.width || !rect.height) continue;

    const fontSize = parseFloat(st.fontSize);
    if (fontSize >= minFontSize) {
      largeTextEls.push({
        selector: (() => {
          // Build a short selector for the element
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
        })(),
        text: el.textContent.trim().slice(0, 60),
        fontSize,
        opacity,
      });
    }
  }

  // Check data-hero-critical elements — must be visible and within viewport
  const criticalEls = Array.from(document.querySelectorAll('[data-hero-critical]'));
  const criticalResults = criticalEls.map(el => {
    const st = getComputedStyle(el);
    const opacity = parseFloat(st.opacity);
    const rect = el.getBoundingClientRect();
    const inViewport = rect.top < vh && rect.bottom > 0 && rect.left < vw && rect.right > 0;
    return {
      selector: el.id ? '#' + el.id : el.tagName.toLowerCase(),
      opacity,
      inViewport,
      visible: opacity > 0.5 && inViewport,
    };
  });

  return {
    hasLargeText: largeTextEls.length > 0,
    largeTextCount: largeTextEls.length,
    firstLargeText: largeTextEls[0] || null,
    criticalElements: criticalResults,
    allCriticalVisible: criticalResults.length === 0 || criticalResults.every(e => e.visible),
  };
};

// ── scroll walk (shared by both modes) ───────────────────────────────────

/**
 * Drive a scroll walk across the full page height, collecting collisions and
 * overflow findings. Returns { collisions, horizOverflow }.
 * settleLiveMs: extra settle time per step for GSAP scrub (0 in reduced mode).
 */
async function scrollWalk(page, vp, settleLiveMs) {
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

    // Base settle + optional extra time for GSAP scrub in live mode
    await page.waitForTimeout(SCROLL_SETTLE_MS + settleLiveMs);

    if (await page.evaluate(hasHorizOverflow)) horizOverflow = true;

    const cols = await page.evaluate(findCollisions, { threshold: OVERLAP_THRESHOLD_PX });
    for (const c of cols) rawCollisions.push({ scrollY: y, ...c });
  }

  // Deduplicate: same element pair at multiple scroll positions counts once
  const seenPairs = new Set();
  const collisions = rawCollisions.filter(c => {
    const key = `${c.a}|||${c.b}`;
    if (seenPairs.has(key)) return false;
    seenPairs.add(key);
    return true;
  });

  return { collisions, horizOverflow };
}

// ── canvas/figure vs text overlap check ──────────────────────────────────

/**
 * Decode a raw PNG buffer (from Playwright's canvas screenshot) and decide how
 * much of the concentrated FIGURE mass falls inside the given text rect.
 *
 * Why a density grid + ambient baseline (see constants block for the full why):
 * the ambient field is roughly uniform across the canvas, the figure is a
 * concentrated high-density spike. We tile the canvas into coarse cells, take
 * the median cell density as the ambient baseline, and mark a cell as "figure"
 * only when it is a strong outlier above that baseline. Ambient cells sit at the
 * baseline and drop out; figure cells remain. We then measure what fraction of
 * the text rect's cells are figure cells.
 *
 * Returns diagnostics so thresholds can be calibrated from real numbers:
 *   { overlapFrac, figCellsInRect, rectCells, figCellsTotal, median, p90, maxD, figThresh }
 * overlapFrac (fig cells inside rect / rect cells) is the primary metric.
 */
function measureFigureOverlap(pngBuffer, vpWidth, vpHeight, cssTextRect) {
  const img = PNG.sync.read(pngBuffer);
  const { width, height, data } = img;

  // Screenshot px per CSS px (Playwright headless defaults to DPR=1 → ~1).
  const scaleX = width  / vpWidth;
  const scaleY = height / vpHeight;

  const cell = GRID_CELL_PX;
  const cols = Math.ceil(width  / cell);
  const rows = Math.ceil(height / cell);
  const density = new Float32Array(cols * rows);

  // Per-cell bright-pixel density. avg of RGB > threshold = "bright".
  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      const x0 = cx * cell, x1 = Math.min(width,  x0 + cell);
      const y0 = cy * cell, y1 = Math.min(height, y0 + cell);
      let bright = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const idx = (y * width + x) * 4;
          if ((data[idx] + data[idx + 1] + data[idx + 2]) / 3 > FIGURE_BRIGHTNESS_THRESHOLD) bright++;
        }
      }
      const total = (x1 - x0) * (y1 - y0);
      density[cy * cols + cx] = total ? bright / total : 0;
    }
  }

  // Ambient baseline = median cell density; spread = p90 − median.
  const sorted = Array.from(density).sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length * 0.5)] || 0;
  const p90    = sorted[Math.floor(sorted.length * 0.9)] || 0;
  const maxD   = sorted[sorted.length - 1] || 0;

  // A cell is "figure" when it is a strong outlier above the ambient baseline
  // AND clears the absolute floor (guards a near-empty ambient frame).
  const figThresh = Math.max(
    median + FIGURE_OUTLIER_K * Math.max(0, p90 - median),
    FIGURE_MIN_CELL_DENSITY
  );

  // Text rect → cell coordinates.
  const tx0 = Math.max(0, Math.floor(cssTextRect.left   * scaleX / cell));
  const ty0 = Math.max(0, Math.floor(cssTextRect.top    * scaleY / cell));
  const tx1 = Math.min(cols - 1, Math.floor(cssTextRect.right  * scaleX / cell));
  const ty1 = Math.min(rows - 1, Math.floor(cssTextRect.bottom * scaleY / cell));

  let figCellsInRect = 0, rectCells = 0, figCellsTotal = 0;
  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      const isFig = density[cy * cols + cx] >= figThresh;
      if (isFig) figCellsTotal++;
      const inRect = cx >= tx0 && cx <= tx1 && cy >= ty0 && cy <= ty1;
      if (inRect) {
        rectCells++;
        if (isFig) figCellsInRect++;
      }
    }
  }

  const overlapFrac = rectCells ? figCellsInRect / rectCells : 0;
  return { overlapFrac, figCellsInRect, rectCells, figCellsTotal, median, p90, maxD, figThresh };
}

/**
 * Check that the WebGL particle figure does not visibly overlap the beat's
 * text element on every section of the homepage.
 *
 * Strategy:
 *   1. Find all <section data-shape="..."> elements.
 *   2. Per beat: scroll its centre into view, wait for the morph to settle,
 *      screenshot the #scene canvas, decode the PNG, then isolate the figure
 *      mass (density-grid cells that are outliers above the ambient baseline)
 *      and measure what fraction of the text rect's cells it covers.
 *   3. Flag the beat when that fraction exceeds FIGURE_OVERLAP_THRESHOLD — i.e.
 *      when the concentrated figure mass actually lands on the words.
 *
 * Why grid + baseline (not bbox, not per-pixel local density): the scatter +
 * ambient starfield inflate any bbox to near-full-viewport, and the wide ambient
 * field makes "locally dense" pixels appear over the text on every beat — both
 * flag hero/neste where the figure is plainly on the opposite side. The ambient
 * field is roughly UNIFORM (sits at the median cell density) while the figure is
 * a concentrated SPIKE; thresholding cells above the baseline keeps the figure
 * and drops the ambient. See the constants block for the full rationale.
 *
 * Runs in LIVE mode only (the scene doesn't animate in reduced-motion mode).
 * Returns an array of overlap findings (empty = all clear).
 */
async function checkBeatCanvasOverlap(page, vp) {
  const findings = [];

  // Get all beat sections with their shape names and text-box selector.
  const beats = await page.evaluate((selectors) => {
    const sections = Array.from(document.querySelectorAll('[data-shape]'));
    return sections.map((sec) => {
      // Find the first text-box selector present in this section.
      let textSel = null;
      for (const sel of selectors) {
        if (sec.querySelector(sel)) { textSel = sel; break; }
      }
      const textEl = textSel ? sec.querySelector(textSel) : null;
      const textRect = textEl ? textEl.getBoundingClientRect() : null;
      const secRect  = sec.getBoundingClientRect();
      return {
        shape:   sec.dataset.shape,
        secTop:  secRect.top  + window.scrollY, // absolute doc-offset
        secMid:  secRect.top  + window.scrollY + secRect.height / 2,
        textRect: textRect ? {
          left:   Math.round(textRect.left),
          top:    Math.round(textRect.top),
          right:  Math.round(textRect.right),
          bottom: Math.round(textRect.bottom),
        } : null,
      };
    });
  }, BEAT_TEXT_SELECTORS);

  // CRITICAL: hide the overlay DOM before screenshotting the canvas.
  // #scene is a full-viewport canvas with the real-HTML content (#main), the
  // custom cursor and the grain layered ON TOP of it. Playwright's element
  // screenshot captures the page region at the element's box — i.e. it
  // composites those overlying DOM pixels in. Without hiding them, the bright
  // display headings ("TONG NIE", "POSTNORD"…) get measured as figure mass, so
  // every beat flags on its own text. visibility:hidden keeps layout intact, so
  // scroll height and getBoundingClientRect still work for the text-rect reads.
  const OVERLAY_HIDE_JS = (hide) => {
    const v = hide ? 'hidden' : '';
    const d = hide ? 'none' : '';
    const main = document.querySelector('#main');   if (main) main.style.visibility = v;
    const cur  = document.querySelector('.cursor'); if (cur)  cur.style.display = d;
    const grn  = document.querySelector('.grain');  if (grn)  grn.style.display = d;
    const ldr  = document.querySelector('#loader'); if (ldr)  ldr.style.display = d;
  };
  await page.evaluate(OVERLAY_HIDE_JS, true);

  for (const beat of beats) {
    if (!beat.textRect) {
      // No text box found for this beat — skip; can't assert without a reference.
      findings.push({
        shape: beat.shape,
        skip: true,
        reason: 'no text-box selector matched',
      });
      continue;
    }

    // Scroll the section centre to the middle of the viewport so the morph
    // that fires when the section is "in view" has a chance to complete.
    const targetScroll = Math.max(0, beat.secMid - vp.height / 2);
    await page.evaluate(async (scrollY) => {
      if (window.__lenis) {
        window.__lenis.scrollTo(scrollY, { immediate: true });
      } else {
        window.scrollTo(0, scrollY);
      }
      // Two rAF ticks for GSAP/ScrollTrigger to process the new position.
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    }, targetScroll);

    // Wait for the morph tween to settle onto the target figure.
    await page.waitForTimeout(BEAT_MORPH_SETTLE_MS);

    // Re-read the text rect at this scroll position (it's in CSS viewport px,
    // so it shifts with scroll — we need the value AFTER the scroll settle).
    // Wrapped in a single object because Playwright page.evaluate only accepts
    // one argument besides the function itself.
    const textRect = await page.evaluate(({ selectors, shape }) => {
      const sec = document.querySelector(`[data-shape="${shape}"]`);
      if (!sec) return null;
      for (const sel of selectors) {
        const el = sec.querySelector(sel);
        if (el) {
          const r = el.getBoundingClientRect();
          return { left: Math.round(r.left), top: Math.round(r.top), right: Math.round(r.right), bottom: Math.round(r.bottom) };
        }
      }
      return null;
    }, { selectors: BEAT_TEXT_SELECTORS, shape: beat.shape });

    if (!textRect) continue;

    // Screenshot the #scene canvas (compositor path — captures WebGL content
    // even without preserveDrawingBuffer, because the compositor reads the
    // rendered frame buffer, not the WebGL back buffer directly).
    const canvasEl = page.locator('#scene');
    let pngBuf;
    try {
      pngBuf = await canvasEl.screenshot({ type: 'png' });
    } catch {
      findings.push({ shape: beat.shape, skip: true, reason: '#scene screenshot failed' });
      continue;
    }

    // Isolate the figure mass (density-grid outliers above the ambient baseline)
    // and measure what fraction of the text rect's cells it covers. Ambient is
    // excluded by the baseline step → clear beat ≈ 0; figure on text → above.
    const m = measureFigureOverlap(pngBuf, vp.width, vp.height, textRect);

    // Log rich diagnostics so the pass/fail gap (and the baseline maths) is
    // visible in output for calibration.
    process.stdout.write(
      `    beat="${beat.shape}"  overlap=${(m.overlapFrac * 100).toFixed(2)}%  ` +
      `figInRect=${m.figCellsInRect}/${m.rectCells}  figTotal=${m.figCellsTotal}  ` +
      `median=${(m.median * 100).toFixed(1)}% p90=${(m.p90 * 100).toFixed(1)}% max=${(m.maxD * 100).toFixed(1)}% ` +
      `figThresh=${(m.figThresh * 100).toFixed(1)}%  ` +
      `gate=${(FIGURE_OVERLAP_THRESHOLD * 100).toFixed(1)}%\n`
    );

    if (m.overlapFrac > FIGURE_OVERLAP_THRESHOLD) {
      findings.push({
        shape:          beat.shape,
        overlap:        true,
        overlapFrac:    m.overlapFrac,
        figCellsInRect: m.figCellsInRect,
        rectCells:      m.rectCells,
        textRect,
      });
    }
  }

  // Restore the overlay DOM for any later checks on this page.
  await page.evaluate(OVERLAY_HIDE_JS, false);

  return findings;
}

// ── one route × viewport × mode pass ─────────────────────────────────────

/**
 * Run checks for a single combination of route, viewport, and animation mode.
 * mode: 'reduced' | 'live'
 * Returns a findings entry object.
 */
async function runPass({ browser, baseUrl, axeJs, route, vp, mode }) {
  const isLive = mode === 'live';

  // Each pass gets a fresh browser context (clean state)
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    // reduced: force prefers-reduced-motion to suppress time-based animations
    // live:    no emulation — let animations run as a real user would see them
    reducedMotion: isLive ? 'no-preference' : 'reduce',
  });
  const page = await ctx.newPage();

  // Stub out the analytics endpoint so a missing/broken Supabase connection
  // in dev doesn't cascade into console errors, failed-request findings, or
  // Vite's error overlay poisoning the axe run. /api/track has its own
  // contract tests in scripts/verify-track-api.mjs — not our job here.
  await page.route('**/api/track', route =>
    route.fulfill({ status: 204, body: '' })
  );

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

  const consoleErrors  = [];
  const failedRequests = [];
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

  await page.goto(baseUrl + route, { waitUntil: 'networkidle' });

  // ── hero check (live mode only, at t≈1s and t≈5s, scroll = 0) ──────────
  // We check before the long post-load wait so we catch both "loading" states.
  let heroCheck = null;
  if (isLive) {
    // t≈1s snapshot — hero should have started rendering
    await page.waitForTimeout(1000);
    const snap1 = await page.evaluate(checkHeroReadability, { minFontSize: HERO_MIN_FONT_SIZE_PX });

    // t≈5s snapshot — hero should be fully readable per the design law
    await page.waitForTimeout(4000); // total ~5s from navigation
    const snap5 = await page.evaluate(checkHeroReadability, { minFontSize: HERO_MIN_FONT_SIZE_PX });

    heroCheck = {
      t1s:  { ...snap1,  pass: snap1.hasLargeText  && snap1.allCriticalVisible  },
      t5s:  { ...snap5,  pass: snap5.hasLargeText  && snap5.allCriticalVisible  },
    };

    // After the t=5s snapshot we've already waited ~5s; wait remaining time
    // to reach the full post-load settle (4s live wait was already consumed
    // by the 1s + 4s above — nothing extra needed)
  } else {
    // Reduced-motion mode: wait the full post-load period before walking
    await page.waitForTimeout(POST_LOAD_WAIT_MS);
  }

  // If live and we already waited 5s for hero check, the 4s post-load is
  // covered; if reduced, we waited POST_LOAD_WAIT_MS above. Either way
  // we proceed to axe + scroll walk here.

  // ── axe-core run at top-of-page (consistent, pre-scroll state) ──────────
  await page.addScriptTag({ content: axeJs });
  const axeRaw = await page.evaluate(() =>
    window.axe.run(document, { resultTypes: ['violations'] })
  );
  const axeAll      = axeRaw.violations || [];
  const axeCritical = axeAll.filter(v =>
    v.impact === 'critical' || v.impact === 'serious'
  );

  // ── scroll walk ──────────────────────────────────────────────────────────
  // Extra settle per step for GSAP scrub: needed in live mode because
  // scroll-triggered tweens may still be running after the two rAFs.
  const extraSettle = isLive ? SCROLL_SETTLE_LIVE_MS : 0;
  const { collisions, horizOverflow } = await scrollWalk(page, vp, extraSettle);

  // ── canvas / figure vs text overlap check (live mode only) ───────────────
  // The scroll walk only catches DOM-vs-DOM text collisions; the WebGL figure
  // is invisible to it. This check reads the actual canvas pixels after each
  // beat's morph has settled and asserts the figure footprint clears the text.
  // Skipped in reduced-motion mode because the scene doesn't run there.
  let canvasOverlaps = [];
  if (isLive) {
    canvasOverlaps = await checkBeatCanvasOverlap(page, vp);
  }

  await ctx.close();

  return {
    route,
    viewport: vp.label,
    mode,
    collisions,
    horizOverflow,
    consoleErrors,
    failedRequests,
    heroCheck,
    canvasOverlaps,
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
}

// ── main ──────────────────────────────────────────────────────────────────

async function main() {
  // Routes from CLI args (must start with /) or the defaults
  const cliRoutes = process.argv.slice(2).filter(a => a.startsWith('/'));
  const ROUTES = cliRoutes.length ? cliRoutes : ['/'];

  // Run both animation modes for every route × viewport
  const MODES = ['reduced', 'live'];

  console.log(`\nUI Verification Harness`);
  console.log(`Routes:    ${ROUTES.join(', ')}`);
  console.log(`Viewports: desktop 1440×900, mobile 390×844`);
  console.log(`Modes:     reduced-motion, live (animations enabled)`);
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
        for (const mode of MODES) {
          const entry = await runPass({
            browser,
            baseUrl: BASE_URL,
            axeJs: AXE_JS,
            route,
            vp,
            mode,
          });
          allFindings.push(entry);

          // Hero check failure only applies to live mode (it's null in reduced)
          const heroFail = entry.heroCheck
            ? (!entry.heroCheck.t1s.pass ? 1 : 0) + (!entry.heroCheck.t5s.pass ? 1 : 0)
            : 0;

          // Canvas overlaps: only count entries where overlap:true (not skip entries)
          const canvasOverlapFails = (entry.canvasOverlaps || []).filter(f => f.overlap).length;

          const failCount =
            entry.collisions.length +
            (entry.horizOverflow ? 1 : 0) +
            entry.consoleErrors.length +
            entry.failedRequests.length +
            entry.axe.critical.length +
            heroFail +
            canvasOverlapFails;

          if (failCount > 0) anyFail = true;

          // ── stdout summary ─────────────────────────────────────────────
          const badge = failCount === 0 ? 'PASS' : 'FAIL';
          console.log(`${badge}  ${route}  [${vp.label}]  [${mode}]`);

          if (entry.collisions.length) {
            console.log(`  text collisions: ${entry.collisions.length}`);
            entry.collisions.slice(0, 3).forEach(c =>
              console.log(`    scrollY=${c.scrollY}  "${c.aText}" ↔ "${c.bText}"  (ox=${c.overlapX} oy=${c.overlapY})`)
            );
            if (entry.collisions.length > 3) console.log(`    … and ${entry.collisions.length - 3} more`);
          }
          if (entry.horizOverflow) console.log(`  horizontal overflow: YES`);
          if (canvasOverlapFails > 0) {
            console.log(`  canvas figure/text overlaps: ${canvasOverlapFails}`);
            entry.canvasOverlaps.filter(f => f.overlap).forEach(f =>
              console.log(`    beat="${f.shape}"  overlap=${(f.overlapFrac * 100).toFixed(2)}%  figInRect=${f.figCellsInRect}/${f.rectCells}  text(l=${f.textRect.left} t=${f.textRect.top} r=${f.textRect.right} b=${f.textRect.bottom})`)
            );
          }
          // Informational: beats where the canvas check was skipped (scene not ready, etc.)
          const canvasSkipped = (entry.canvasOverlaps || []).filter(f => f.skip);
          if (canvasSkipped.length) {
            console.log(`  canvas check skipped for ${canvasSkipped.length} beat(s): ${canvasSkipped.map(f => `${f.shape}(${f.reason})`).join(', ')}`);
          }
          if (entry.consoleErrors.length) {
            console.log(`  console errors: ${entry.consoleErrors.length}`);
            entry.consoleErrors.slice(0, 3).forEach(e => console.log(`    ${e.slice(0, 120)}`));
          }
          if (entry.failedRequests.length) {
            console.log(`  failed requests: ${entry.failedRequests.length}`);
            entry.failedRequests.slice(0, 3).forEach(r => console.log(`    ${r.slice(0, 120)}`));
          }
          if (entry.axe.critical.length) {
            console.log(`  axe critical/serious: ${entry.axe.critical.length}`);
            entry.axe.critical.slice(0, 3).forEach(v =>
              console.log(`    [${v.impact}] ${v.id}: ${v.description.slice(0, 90)}`)
            );
          }
          if (entry.heroCheck) {
            const hc = entry.heroCheck;
            const t1Badge = hc.t1s.pass ? 'ok' : 'FAIL';
            const t5Badge = hc.t5s.pass ? 'ok' : 'FAIL';
            console.log(`  hero t=1s: ${t1Badge}  (largeText=${hc.t1s.hasLargeText}, criticalOk=${hc.t1s.allCriticalVisible})`);
            console.log(`  hero t=5s: ${t5Badge}  (largeText=${hc.t5s.hasLargeText}, criticalOk=${hc.t5s.allCriticalVisible})`);
            if (!hc.t5s.hasLargeText) {
              console.log(`    no visible text ≥${HERO_MIN_FONT_SIZE_PX}px in viewport at t=5s`);
            }
            if (!hc.t5s.allCriticalVisible && hc.t5s.criticalElements.length) {
              hc.t5s.criticalElements.filter(e => !e.visible).forEach(e =>
                console.log(`    [data-hero-critical] ${e.selector} not visible (opacity=${e.opacity}, inViewport=${e.inViewport})`)
              );
            }
          }
          if (failCount === 0) console.log(`  (no findings)`);
        }
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
    { generatedAt: new Date().toISOString(), routes: ROUTES, modes: MODES, findings: allFindings },
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
