## Why

The taste bar for this site is "attention is the mechanism" — every beat should earn
the next scroll. The body is currently static once revealed: the cards, the boundary
seam and the chat launcher don't respond to the cursor, so the page reads rather than
pulls. Adding restrained, pointer-driven life to the surfaces a recruiter is already
looking at (the cards, the seam, the launcher) is the cheapest way to make the page
feel alive without touching the cinematic backbone.

## What Changes

- **Card spotlight + hover micro-interaction.** Experience ladder rungs and Project
  gallery cards gain a pointer-tracked gold spotlight border that follows the cursor,
  plus a one-shot left-right wiggle and a small lift on hover-enter. Ported from the
  referenced React `GlowCard` to **vanilla Astro + CSS** (CSS custom properties driven
  by a single pointer listener) — no React/Tailwind/shadcn stack is added.
- **Boundary-bar gold flow.** The existing `HeroBar` seam marquee gains a slowly
  drifting gold gradient glow behind the cert names — the referenced `Banner` "flow"
  effect, recolored from rainbow to our warm gold theme. The cert-name marquee content
  is unchanged; nothing becomes dismissible.
- **Launcher → "Talk" + shimmer.** The persistent chat launcher's label changes from
  "Ask" to "Talk" and gains a subtle gold shimmer / attention pulse so it draws the eye.
- All three effects respect `prefers-reduced-motion`, work with no JS, and stay
  touch-friendly — the spotlight/wiggle simply don't engage where there's no hover.

## Capabilities

### New Capabilities
- `pointer-interactions`: The site's cursor-responsive behavior system — the
  pointer-tracked gold spotlight and hover wiggle+lift on Experience and Project cards,
  and the shared reduced-motion / no-JS / touch fallback contract that governs all
  cursor-driven motion added by this change.

### Modified Capabilities
- `site-shell`: The hero-to-body boundary marquee requirement gains a drifting gold
  gradient glow as an intentional seam treatment, while keeping its cert-name content,
  seamless loop, and reduced-motion stillness.
- `chatbot-entry`: The persistent launcher's affordance changes — label "Ask" → "Talk"
  with an added gold shimmer/pulse — while keeping its fixed placement, non-deceptive
  placeholder, and no-JS fallback.

## Impact

- **Components:** `src/components/Experience.astro`, `src/components/Projects.astro`,
  `src/components/HeroBar.astro`, `src/components/ChatLauncher.astro`.
- **Shared code:** a small pointer-tracking script + spotlight/wiggle CSS (likely a new
  `src/scripts/pointer.ts` and additions to `src/styles/backbone.css`).
- **Dependencies:** none added — no React, Tailwind, shadcn, lucide-react, radix, or
  class-variance-authority. Effects are pure CSS + a tiny vanilla listener.
- **Performance:** negligible JS weight; one shared `pointermove` listener, GPU-friendly
  transforms only. Honors the project's phone-first / no-JS / reduced-motion rules.
