# Phase 1c — Dark Scene: Motion, Scatter & Cursor Polish

**Status: DRAFT (2026-06-15), awaiting Tong's approval.** Refinement iteration on the
shipped dark homepage (`src/scripts/dark-scene.ts`, `src/pages/index.astro`). Pushes the
particle scene closer to the usta.agency feel Tong is targeting. No content/routing
changes; this is motion + figure + cursor work only.

Reference stills (cursor + transition arc) live in
`reference/screenshots-2026-06-15/` (gitignored). Live anchor: usta.agency.

## Why

The dark scene works but reads as "dots that snap between forms." Tong wants the
usta.agency behaviour: the figure lives **opposite the text**, the cloud **scatters
across the whole screen between sections and reconverges** as the next section arrives
(scroll-tracked, reversible), the dots **breathe** rather than sit static, and a faint
field of ambient particles fills the screen. Two defects also surfaced: the company
**wordmarks are illegible** (long words mush out), and the cursor renders **three stacked
circles** that read as too big.

## What — six changes, two rounds

Build order is two designer dispatches so review stays tractable. Round A is the coupled
shader/scroll rewrite; Round B is the smaller cursor + figure work and depends partly on
Round A landing first.

### Round A — particle system (`dark-scene.ts`)

These four are physically coupled (same vertex shader + scroll orchestration) and ship
together.

1. **Figure offset, opposite the text.** The cloud currently sits centred (x=0). Give each
   beat an `xOffset` so the figure sits on the side **opposite** its text column, and tween
   `points.position.x` on morph. Current text layout → figure goes **right, left, right,
   left, right, left, centre**:
   **SUPERSEDED by Round A2 below.** The crude left/right `xOffset` map shipped in Round A
   produced text/figure overlaps (PostNord, Basware, Projects, Writes) and a centred-on-
   centred collision on bot, because it controlled only X with hand-picked magnitudes.
   Replaced by text-rect-derived 2D placement — see Round A2 item 7.

2. **Scrub-driven scatter between sections (the core change).** Replace the discrete
   `onEnter → morphTo()` tween with a scroll-progress-driven scatter. New uniform
   `uScatterMix` (0→1→0 across the gap between two section centres):
   - At a section's centre `uScatterMix = 0` → particles sit on the figure.
   - Approaching the boundary it ramps toward `1` → particles fly out to a wide,
     full-viewport scatter field (computed in-shader from `aRand`, no new buffer).
   - Crossing into the next section it ramps back `1→0`; the B morph target is swapped to
     the next figure while scattered, so the reconverge lands on the new shape.
   - **Must be scrub-tied and reversible** — scrolling back up reverses the scatter exactly
     (matches usta). Shader composition:
     `pos = mix( mix(aPosA, aPosB, uMix), scatterPos, uScatterMix )`.
   - Scatter field spans ~full viewport (≈8–10 world units wide) so mid-gap reads as a
     screen-filling starfield, per the transition stills (19.41→19.47 sequence).
   - **Scroll→uniform map is LINEAR, not eased** (decided 2026-06-16 after researching
     scroll-particle transitions — see refs below). Drive `uScatterMix` straight off scroll
     progress with `ScrollTrigger { scrub: true, ease: 'none' }` so the scatter is
     scroll-truthful and exactly reversible. The *silky* feel must come from **Lenis
     smooth-scroll + a small scrub-smoothing value** (`scrub: 0.5–1`) — inertia, not an
     easing curve baked into the uniform. (This supersedes the earlier "ramp curve is a
     by-eye taste call": don't bake a curve; keep it linear and let Lenis + scrub carry it.)
   - **Scatter is cohesive, not rippling.** The whole cloud flies out as one body (usta
     behaviour) — **no per-particle delay/offset on the scatter geometry.** Per-particle
     `aRand` phase stays reserved for breathing/twinkle (item 4) only. Explicitly *not*
     adopting the Bruno-Simon delayed-smoothstep morph here (great for shape→shape reveals,
     wrong for a body-moving scatter).
   - *Optional in-shader dial only:* a gentle `smoothstep` on `uScatterMix` may shape the
     scatter **radius response** (leave the figure crisply, bloom wide mid-gap) — but the
     scroll→uniform map itself stays linear. Off by default; a taste dial, not the mechanism.
   - **Expect a tuning pass** after first scroll — scatter radius and the hand-off point are
     still taste calls best judged in motion (the ramp curve is now settled: linear).
   - Refs: Loopspeed "Advanced scroll-based particle transitions"
     (blog.loopspeed.co.uk/fbo-particles-simulation); Three.js Journey "Particles Morphing
     Shader" (the delayed-morph approach we deliberately skip for scatter).

3. **Ambient particles across the whole screen.** Reserve ~12–15% of the budget as
   permanent wide-field dots that never join the figure (they keep a faint scattered target
   in every shape). Also widen the wordmark/shape backing field so dots reach the screen
   edges even at rest, not just a tight halo. Goal: the screen is never empty of dots, even
   on the hero.

4. **Breathing — drift/size coupling, not a standalone pulse.** The "alive" feel comes
   from how motion, route and size couple; a lone size-sine reads as flicker, not breath.
   Priorities, in order:
   - **Size follows depth.** Lean on the existing `gl_PointSize ∝ 1.0 / -mv.z` perspective:
     a particle drifting toward the camera in z grows, drifting away shrinks — that *is*
     breathing. So **widen the z component of the ambient drift** and let perspective carry
     most of the size variation. Keep any explicit size-sine tiny (≤0.1 amplitude) or drop
     it; do not make a standalone size pulse the primary effect.
   - **Route is a loop, not a line.** Keep the per-axis frequency spread already in the drift
     (`x` at `t`, `y` at `1.3t`, `z` at `0.7t`) so particles trace ellipses/Lissajous loops
     (floating), not straight-line vibration. Widening the spread slightly is welcome.
   - **Speed slow + desynced.** Keep the ~0.3 Hz timescale (`uTime * 0.4` zone) and the
     **per-particle phase offset** (`aRand * TAU`) — the desync is what stops the cloud
     pulsing in unison (robotic). Preserve both.
   - **Amplitude scales with scatter (couples to item 2).** Tie drift amplitude to
     `uScatterMix`: small when the figure is tight (keeps it crisp/legible), large when
     scattered (weightless starfield). One extra term, big payoff.
   - **Two timescales (couples to item 3).** Ambient/background dots *twinkle* — faster,
     smaller, slight opacity flicker, like distant stars — while the main figure mass
     *breathes* slowly. The different feel between the two layers reads as depth.
   All of this is tuning-by-eye: set sensible defaults, adjust live. Gated off entirely
   under `prefers-reduced-motion`.

### Harness first — canvas-figure vs text overlap assertion (`scripts/verify-ui.mjs`)

**Lands BEFORE the figure/placement re-work, so that work is gated by it.** Raised by
Tong's live review (2026-06-15): Round A shipped with the figure overlapping text on
several beats, and neither the harness nor the blind reviewer caught it — because the
figure is **WebGL canvas pixels**, invisible to DOM-vs-DOM overlap checks and to static
screenshots of an animating scene. This is a new defect class; per CLAUDE.md it becomes a
new harness assertion, not a thing we watch by eye.

- After each beat's morph settles (scene live, animations on), **read the WebGL canvas
  pixels**, threshold the bright figure pixels, and compute their on-screen bounding box —
  the figure's true footprint (ground truth: what is actually drawn).
- Get each in-beat text element's `getBoundingClientRect()`.
- **Assert the figure footprint does not overlap the text rect** beyond a small margin, at
  every beat, **desktop + mobile**. Fail the run (non-zero exit) on overlap, with the beat
  name + both rects in the message.
- Same two-box primitive the placement method (item 7) uses — placement *derives* position
  from the text rect; this *asserts* the footprint clears it. Belt and suspenders.

### Round A2 — dot sizing & text-derived placement (`dark-scene.ts`)

Post-live-feedback rework. Gated by the new overlap assertion above.

7. **Figure placement auto-derived from the text rect (replaces item 1's xOffset map).**
   Confirmed with Tong. No hand-picked magic numbers. Per beat, at runtime:
   - Read the beat's text box screen rect (`.split__pad` / `.hero__inner` / `.bot__inner`).
   - Compute the largest empty viewport region beside it — the screen point farthest from
     the text box, clamped on-screen with a margin.
   - Convert that screen point to world space via the **same z=0 raycast the cursor uses**,
     and tween `points.position` there.
   - Controls **both axes** (X and Y), so e.g. PostNord text upper-left → figure lower-
     right; Basware text right → figure left-and-up; bot centred text → figure forced to a
     side. Self-corrects across desktop/mobile/resize. Recompute on resize + on morph.

8. **Dot sizing — bigger, wider variance, bolder figure (per usta live capture).** usta's
   dots are clearly varied (a few big bright ones among many small) and the figure is dense,
   not faint. Today `size * (0.6 + aRand*0.8)` is too narrow and `uSize` too small, and the
   ambient field added in Round A diluted the figure. Fix:
   - Raise base `uSize`; widen per-particle size variance (power-curve so a minority of dots
     are markedly larger) for both figure and ambient dots — no uniform-size layer.
   - Increase figure density/brightness relative to ambient so the figure reads bold again
     (Tong: figure currently too diluted vs. the original bright cluster).
   - Reference: `reference/screenshots-2026-06-15/usta-live-hero.png`,`usta-live-s2.png`.

### Round B — cursor + figures

5. **Cursor — kill the third circle, shrink the rest (test first).** Confirmed with Tong:
   the three stacked circles are (1) the cursor **dot**, (2) the cursor **ring**, both CSS
   (`index.astro` `.cursor` / `.cursor__dot`), and (3) the **particle repulsion void** the
   shader carves around the cursor (`radius = 1.4` in `dark-scene.ts`). Plan:
   - Reduce the shader repulsion `radius` (1.4 → ~0.7) so the void is small, or remove the
     visible clearing entirely if it still competes with the cursor.
   - Tame the CSS cursor: drop the hover swell (64px → ~40–44px) so the ring isn't oversized.
   - **Test the cursor dot + ring first** (Tong's call) before deciding whether the
     repulsion void stays at all — usta uses one restrained cursor effect, not two.

6. **Company figures → abstract forms (drop the wordmarks).** Confirmed: replace
   `makeWordmark('NESTE'/'POSTNORD'/'BASWARE')` with three distinct abstract generators in
   the style of the existing `makeConstellation` / `makeNeural`. The company name carries
   entirely in the real HTML copy (`<h2>` + body already present), so the figure is mood,
   not label. Proposed forms (designer may refine; Tong judges at the taste gate):
   - **Neste** (renewable energy) — a flowing **torus / circulating ring** of particles.
   - **PostNord** (Nordic logistics) — a **route-mesh**: cluster nodes joined by directional
     particle streams.
   - **Basware** (fintech / invoicing SaaS) — a **structured lattice / grid** (ledger feel).
   Each keeps a themed accent colour (Neste green, PostNord blue, Basware amber — already
   defined). Remove the now-unused `makeWordmark` text path if nothing else uses it.

## Hard constraints (CLAUDE.md design law still binding)

- Name + role + value legible within ~5s; text always readable over any scene state,
  including mid-scatter (scatter must not wash out text contrast).
- Real-HTML content unchanged; **reduced-motion → static** (no scatter, no breathing, no
  morph) and **WebGL-fail → static** fallbacks still fully usable. `uDrift`/scatter/breath
  all gated off under `prefers-reduced-motion`.
- Mobile portrait: figure offset must not cause horizontal overflow or push the figure
  off-screen; scatter field bounded to viewport; particle budget stays at the mobile cap.
- Pixel ratio capped at `min(devicePixelRatio, 2)`; no `backdrop-filter` over the live
  canvas on mobile. Perf is a target, not a gate.

## Acceptance criteria

- [ ] Figure placement is auto-derived from each beat's text rect (both axes), sits in the
      empty region opposite the text on every beat including bot, no overlap, no mobile
      overflow; recomputes on resize.
- [ ] `verify-ui` canvas-figure-vs-text overlap assertion exists and passes on every beat,
      desktop + mobile (fails loudly on overlap).
- [ ] Dots are varied in size (a minority markedly larger), bigger than Round A, and the
      figure reads bold/dense — not diluted by the ambient field.
- [ ] Between every section the cloud scatters to a screen-filling field and reconverges on
      the next figure, **scrub-tied and reversible** on scroll up.
- [ ] A faint ambient field of dots is present across the screen at every scroll position,
      including the hero at rest.
- [ ] Cloud breathes: drift traces loops (not line vibration), size varies mainly via
      z-depth/perspective, motion is slow + per-particle desynced, drift amplitude grows
      when scattered, ambient dots twinkle on a faster timescale. Subtle; off under
      reduced-motion.
- [ ] Cursor renders at most the intended elements at a restrained size; the oversized
      third circle (repulsion void) is gone or small. Tested first, before figure work.
- [ ] Neste/PostNord/Basware render as distinct abstract figures (no particle text);
      company names still present in HTML copy; themed accents intact.
- [ ] CI green: `astro check`, `npm run build`, `check-leaks`, `verify-ui` (incl. no-JS /
      reduced-motion fallback). Lighthouse informational only.
- [ ] Designer self-screenshots (desktop + mobile, at rest + mid-scatter); reviewer clean
      blind APPROVE on the final commit before PR.

## Process

- Dispatch order: **Round A** (items 1–4, SHIPPED + approved 2026-06-15) → **Harness**
  (canvas/text overlap assertion) → **Round A2** (sizing + text-derived placement, gated by
  the harness) → **Round B** (cursor + abstract figures, also gated). Each round: architect
  verify → blind review (spec + diff only) → fixes → clean APPROVE.
- Why the harness lands before Round A2/B: Round A's overlaps slipped past both the harness
  (DOM-only) and the blind reviewer (can't see canvas pixels in a static shot). The fix is
  mechanical detection, not sharper eyes — new defect class → new `verify-ui` assertion.
- Item 2 (scatter), item 6 (abstract figures), and dot sizing are the most likely to need a
  visual tuning pass after first look — budget one combined tuning pass at the end.
- Every dispatch prompt opens with `TASK: <kebab-slug>`; hook logs to `logs/`.

## Out of scope

- Content, copy, routing, analytics, the bot brain — unchanged from 1b.
- Light theme (separate future work per 1b record).
- New dependencies — `three`/`gsap`/`lenis` only.
