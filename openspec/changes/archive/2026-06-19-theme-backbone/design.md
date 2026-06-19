## Context

The hero (a cinematic looping video) is the only decided beat; the rest of the page is undefined.
This change designs the backbone — the persistent theme, the section system, and the scroll mechanics
— that carries Experience, Projects, Writes, the Chatbot, and Contact as one cohesive world growing
out of the hero. Reference for the look-and-feel is Tres Mares Capital (a fixed subtle canvas behind
layered content sections, reveal-on-enter motion) and Anton Skvortsov (scroll-driven pull). Content is
sourced from `reference/Tong Nie CV.pdf` and the synced wiki (projects, case studies). Stack is Astro;
infra (Vercel + Supabase) survives from the clean start.

## Goals / Non-Goals

**Goals:**
- One backbone theme — a calm near-black canvas echoing the hero palette — that all sections inherit.
- A scroll/transition system (Lenis + GSAP ScrollTrigger): reveal-on-enter everywhere, sticky-stack on
  one or two signature beats (Experience is one).
- Five well-defined sections below the hero with deliberately differentiated treatments.
- A recruiter-safe, phone-usable page: real HTML content, readable text, no accidental horizontal
  overflow, reduced-motion / no-JS fallbacks.

**Non-Goals:**
- The chatbot conversational AI backend (future change) — only its launcher and section shell here.
- Re-deciding the hero — its spec is unchanged; this only adds the dissolve hand-off on the body side.
- Locking final copy or pixel-level visual design; this defines structure, behavior, and content slots.

## Decisions

**Backbone = near-black canvas, not hero still wallpaper.** A fixed subtle canvas (deep dark + golden
edge-rim accent, optional grain/gradient) sits behind layered sections, like Tres Mares' fixed canvas.
*Alternative considered:* using the hero still (darkened/blurred) as a persistent background — rejected
because a literal scene competes with text, hurts legibility, and turns monotonous. Cohesion comes from
the shared palette plus a dissolve, not from wallpapering the scene.

**Hero dissolves into the backbone on scroll-out.** As the hero leaves the viewport its visual fades
down into the same near-black canvas — "lights coming down on the same room" — so there is no hard cut
or color seam. The scene may resurface as a faint, heavily darkened echo behind at most one later beat.

**Scroll engine = Lenis + GSAP ScrollTrigger.** Lenis for smooth scroll (the "hold" easing), ScrollTrigger
for reveal-on-enter (slide-up + fade) and the sticky-stack pin. *Alternative considered:* CSS scroll-snap
or Locomotive — rejected; ScrollTrigger gives the precise pin/overlap control the sticky-stack needs and
pairs cleanly with Lenis. These add JS weight, watched and reported per project rules, not gated.

**Sticky-stack is rationed to 1–2 beats.** Overusing pinned "slide over" sections becomes a gimmick and
hurts phones. Experience is the primary sticky-stack beat; at most one other (candidate: the chatbot
climax). Everything else uses reveal-on-enter only.

**Experience = sticky-stack keyword-per-year timeline.** Five beats from the CV — 2021 FOUNDATIONS,
2023 LIFTOFF, 2024 "0 → 1", 2025 SCALE, 2026 GOVERNANCE AT SCALE — each a huge keyword with role/stack/one
outcome auto-revealed beside it; the next year slides over. *Alternatives considered:* expand-on-click
ladder (rejected: less cinematic) and flip cards (rejected: hidden affordance, weak on mobile). 2022
folds into the 2021 arc (mid-degree). Certs render as a small quiet strip, not a beat.

**Projects horizontal, Writes vertical — asymmetry by content nature.** Projects are visual showcases →
horizontal image-forward gallery of 4 curated cards. Writes are text → vertical editorial list of 2
pieces. Reusing one layout for both would read redundant; the asymmetry creates rhythm.

**Chatbot = persistent dock + late climax.** A conventional fixed-corner launcher present from the hero
down does the "never ignored" work, so the dedicated section can sit late as a payoff without being
buried. *Alternative considered:* a featured chatbot section mid-page — rejected as a non-standard,
disorienting placement. Backend deferred; launcher/section show a placeholder until then.

## Risks / Trade-offs

- **Sticky-stack / smooth-scroll on phones** → keep sticky-stack to Experience (+ at most one beat); test
  touch and momentum scrolling; provide the static reduced-motion path that disables Lenis and pins.
- **Horizontal Projects gallery causing page-level overflow** → gallery scrolls only within its own
  bounds; assert no body-level horizontal scroll at mobile widths.
- **JS weight from Lenis + GSAP** → report LCP/JS weight per project rules; lazy-init below-the-fold
  motion; ensure all content is real HTML so the page is usable before/without JS.
- **Placeholder chatbot reading as broken** → show an explicit placeholder/"coming soon" state, never a
  dead or erroring conversation UI.
- **Content drift from the CV** → year beats and project/write cards pull from a single content source so
  edits don't fork between sections.

## Open Questions

- Which second beat (if any) gets sticky-stack treatment — the chatbot climax is the candidate; decide
  during implementation once Experience feels right.
- Exact accent/grain treatment of the backbone canvas (final visual polish), to be tuned against the
  graded hero in-browser.
