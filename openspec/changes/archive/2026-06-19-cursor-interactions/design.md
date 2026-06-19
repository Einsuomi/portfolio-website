## Context

The site is a **pure Astro static build** — `.astro` components + vanilla CSS
(`src/styles/backbone.css`) + GSAP/Lenis for scroll, Three.js available for the hero.
There is **no React, Tailwind, or shadcn** anywhere. The reference snippets the user
provided (`GlowCard`, `Banner`) are React/Next/Tailwind/shadcn components, but their
actual *behavior* is CSS-driven: a radial-gradient border positioned by pointer-fed CSS
custom properties, and a keyframed drifting gradient. The interesting part ports cleanly
to this stack with zero new dependencies.

Hard project constraints this design must satisfy (`CLAUDE.md`): content in real HTML,
readable with no JS, phone-first, low JS weight, and graceful `prefers-reduced-motion`
and no-hover/touch fallbacks. Surfaces affected already exist: `Experience.astro`
(`.rung`), `Projects.astro` (`.card`), `HeroBar.astro` (`.bar`), `ChatLauncher.astro`
(`.launcher`).

## Goals / Non-Goals

**Goals:**
- Pointer-tracked gold spotlight border on Experience + Project cards.
- One-shot wiggle + lift on card hover-enter; settle while hovered; return on leave.
- Drifting gold gradient glow behind the existing boundary-bar cert names.
- Launcher relabeled "Talk" with a subtle gold shimmer / pulse.
- All of the above degrade under reduced motion, no JS, and touch.

**Non-Goals:**
- No React/Tailwind/shadcn/lucide-react/radix/cva — no new runtime dependencies.
- No change to the cinematic scroll backbone, section order, or scene grading.
- No dismissible announcement banner (the boundary stays a presentational seam).
- No chatbot backend work — launcher stays a non-deceptive anchor.

## Decisions

**1. Vanilla port over installing the React stack.** Standing up React islands +
Tailwind + shadcn to host two CSS-driven effects would add a framework, a build-time
CSS pipeline, and hydration JS — directly against the low-JS, real-HTML, phone-first
rules — for effects that are ~40 lines of CSS plus one listener. *Alternative considered:*
`@astrojs/react` islands for the literal `GlowCard`/`Banner` — rejected as disproportionate
and off-pattern.

**2. One shared pointer listener, CSS-variable driven.** A single `pointermove` handler
(new `src/scripts/pointer.ts`, imported once like `scroll.ts`) writes `--x`/`--y` (and a
normalized `--xp`) onto the hovered card via `closest('[data-spotlight]')`, rather than
the reference component's per-instance `document` listener on every card. The spotlight
border itself is a `radial-gradient` masked to the border box (the `::before` mask-compose
trick from the reference), recolored to gold via the backbone `--gold` token. *Alternative:*
per-card listeners (reference approach) — rejected for needless duplication.

**3. Coalesce the spotlight CSS into `backbone.css`, scoped by `[data-spotlight]`.** The
shared card treatment lives next to the existing `.rung` / `.card` rules so the tokens
(`--gold`, `--line`, `--bg-raise`) and the reduced-motion blocks already in that file
govern it. `Experience.astro` and `Projects.astro` only add a `data-spotlight` attribute
(and reuse their existing scoped `<style>` for any card-specific tweak). *Alternative:*
a standalone CSS file — rejected; backbone already owns card + reduced-motion rules.

**4. Wiggle + lift as a CSS hover animation, not JS.** Hover-enter triggers a short
keyframed `rotate` wiggle plus a `translateY` lift via `:hover` + `animation`, gated
behind `@media (hover: hover) and (prefers-reduced-motion: no-preference)`. This keeps it
off touch devices and reduced-motion users automatically, with no JS branching. The card
keeps `transform`-only motion so it stays GPU-cheap and never reflows the sticky-stack.

**5. Boundary glow reuses the reference `flow` idea as a CSS layer.** A `::before` (or an
absolutely-positioned child) on `.bar` paints a `repeating-linear-gradient` of gold tints,
masked top-to-center, animated by a `background-position` keyframe — recolored from the
reference rainbow to gold/transparent stops. It sits *behind* `.bar__track` (z-index) so
cert names stay crisp. The existing reduced-motion block that stops `.bar__track` also
stops the glow.

**6. Launcher shimmer via a moving gradient sweep + optional pulse.** The `.launcher` pill
gets a gold gradient sheen that sweeps on a slow loop (masked highlight translating across)
plus a very soft scale/opacity pulse, both behind the same `prefers-reduced-motion` guard.
Label text `Ask` → `Talk`; `aria-label` updated to match.

## Risks / Trade-offs

- **`background-attachment: fixed` interplay** → the reference spotlight uses
  `background-attachment: fixed`; the cards live in a sticky-stack over a fixed scene.
  *Mitigation:* drive the spotlight in element-local coordinates (pointer position minus
  the card's `getBoundingClientRect`), not fixed viewport coordinates, so it tracks
  correctly inside transformed/sticky parents.
- **Pointer writes causing layout thrash** → reading `getBoundingClientRect` per move can
  be costly. *Mitigation:* cache rects on `pointerenter`, update only CSS vars on move
  (compositor-only), and skip work when no `[data-spotlight]` is under the pointer.
- **Touch double-tap / drag interference on Projects** → hover effects must not hijack the
  horizontal drag. *Mitigation:* hover-gated `@media (hover: hover)`; spotlight purely
  visual with `pointer-events: none` on the gradient layer.
- **Over-animation cheapening the cinematic tone** → too much wiggle reads as toy-like.
  *Mitigation:* one-shot, low-amplitude (~1.5°) wiggle and a few-pixel lift only; verify
  against the taste bar before merge.

## Migration Plan

Additive and reversible. Ship behind the existing reduced-motion/no-JS guards; no data or
API changes. Rollback = revert the four component edits, the `pointer.ts` import, and the
`backbone.css` additions. Verify with `npm run dev` (desktop hover, touch emulation,
reduced-motion) and `astro check` before the PR.

## Open Questions

None blocking — the three design forks (boundary = enhance HeroBar, hover = spotlight +
wiggle + lift, launcher = "Talk" + shimmer) were resolved with the user before drafting.
