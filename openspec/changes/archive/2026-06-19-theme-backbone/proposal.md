## Why

The hero is the only decided beat; everything below it is undefined. To hold a recruiter's
attention end to end we need the rest of the page — the backbone theme, the section system,
and the scroll mechanics that carry them — locked as one cohesive world that grows out of the
hero rather than a generic page stapled beneath it. The chatbot is the differentiator and must
be present throughout, not buried.

## What Changes

- Define the **backbone theme**: a calm near-black canvas echoing the hero palette (deep dark +
  the golden edge-rim as the single accent). The hero scene **dissolves into this canvas** on
  scroll-out instead of cutting to black; no video or literal still wallpapers the sections.
- Establish the **section order** below the hero: Experience → Projects → Writes → Chatbot
  climax → Contact.
- Add a **scroll + transition system**: Lenis smooth scroll + GSAP ScrollTrigger, with
  reveal-on-enter on every section and a **sticky-stack** "slide over" reserved for 1–2 signature
  beats (Experience is one).
- Add **Experience** as a sticky-stack, keyword-per-year timeline (5 beats: 2021 FOUNDATIONS →
  2023 LIFTOFF → 2024 0→1 → 2025 SCALE → 2026 GOVERNANCE AT SCALE), signal-only, not a CV replica.
- Add **Projects** as a horizontal-scroll gallery of 4 curated cards (Fingrid, AWS DLT, J&D
  CI/CD Power BI, Heureka BI).
- Add **Writes** as a vertical editorial list of 2 case-study pieces.
- Add a **chatbot entry**: a persistent floating launcher visible from the hero down, plus a
  dedicated climax section near the end. The conversational AI backend is **out of scope** here —
  this change defines placement, the launcher, and the section shell only.
- Add a **Contact** closing section.
- All sections honor the project rules: real HTML content, readable text over any background,
  no accidental horizontal overflow, and reduced-motion / WebGL-fail fallbacks.

## Capabilities

### New Capabilities
- `site-shell`: the backbone theme (palette + near-black canvas), section ordering, the
  Lenis + ScrollTrigger scroll/transition engine (reveal-on-enter + sticky-stack), the hero
  dissolve, and the global reduced-motion fallback that all sections inherit.
- `experience-timeline`: the sticky-stack keyword-per-year Experience section and its content.
- `projects-gallery`: the horizontal-scroll Projects gallery of 4 curated cards.
- `writes-list`: the vertical editorial Writes list of 2 case-study pieces.
- `chatbot-entry`: the persistent floating launcher and the dedicated climax section shell
  (placement and UI only; conversational backend deferred).
- `contact`: the closing Contact section.

### Modified Capabilities
<!-- None. The existing `hero` spec is unchanged; this change only adds the dissolve hand-off,
     which is owned by site-shell, not a change to hero's own requirements. -->

## Impact

- **New dependencies**: `lenis`, `gsap` (+ ScrollTrigger). Watched for JS weight per project rules.
- **Affected code**: new section components and a site-shell layout below the existing hero;
  content sourced from `reference/Tong Nie CV.pdf` and the synced wiki (projects, case studies).
- **Out of scope**: the chatbot conversational backend (future change); backbone applies only
  from the hero down.
- **Risks watched**: sticky-stack and smooth-scroll behavior on phones (must stay touch-friendly
  and overflow-free); LCP/JS weight reported, not gated.
