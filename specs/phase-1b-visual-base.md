# Phase 1b — Visual Base: Dark & Light Versions

**Status: DRAFT — awaiting Tong's approval.**

## Why

The homepage mechanics work (pinned cinematic stage, chapter crossfades, scroll-scrub
frame sequence) but the visual treatment is not yet decided. Tong supplied design
references on 2026-06-11 (catalogued locally in `reference/README.md` — gitignored,
third-party material). Decision: build **two complete visual treatments of the same
homepage** — one dark, one light — compare them side by side, then pick or combine.

## What

Two full homepage implementations sharing the same structure and copy (the approved
chapter flow: hero manifesto → Neste → PostNord → Basware → projects-as-posters →
essays → chatbot finale → footer):

1. **Dark version** — evolves the existing v3 pinned-stage homepage.
   Reference anchor: the cinematic chaptered portfolio in `reference/` (video frames).
   Grammar to adopt:
   - Hero copy enters **typed line-by-line** (typewriter), scene nearly still behind it.
   - Chapter transitions are **vertical word overlaps**: incoming giant display word
     slides up while the outgoing one fades — brief coexistence; numbers/year markers
     arrive offset, before the word.
   - Background scene **evolves continuously** (slow zoom/shift) — never a hard cut.
   - Chrome placement **alternates per chapter** (number/meta corners vary) so no two
     chapter layouts repeat.
   - Projects as **poster cards** (cover + title + one-liner), mouse parallax drift.
2. **Light version** — new page, designed from its own grammar (NOT an inverted dark
   theme). Reference anchor: antonskvor.webflow.io (palette verified: #fff/#fafafa/#f4f4f4
   surfaces, black type, occasional #000 contrast blocks).
   Grammar to adopt:
   - Near-white surfaces, oversized black display type, generous whitespace.
   - Numbered sections (001/002…) as quiet chrome.
   - Motion carried by **media/poster cards** (project visuals), not by a full-bleed
     background scene; occasional full-black contrast band is allowed.
   - Clarity is the selling point — Tong finds light "clearer"; the version must prove it.

### Routes during comparison

- Dark: `/` (iterate v3 in place on the feature branch).
- Light: `/light` (temporary comparison route; whichever direction wins — or the
  combination — becomes `/`, and the loser route is removed before merge to main).

### Effect vocabulary

Specific micro-interactions may borrow patterns from the react-bits catalog
(typewriter, split/blur text entrances, decrypted-text metadata, count-up) —
**re-implemented in the GSAP/split-type stack we already ship. No React, no new
runtime dependencies.**

### Key art

Current code-rendered frames in `public/seq/`–`public/seq2/` stay as placeholders.
Final cinematic art (Spline frame export or AI video) is a separate later workstream;
both versions must be designed so the frame folder is swappable without layout change.
The light version should not depend on the frame sequence at all.

## Hard constraints (CLAUDE.md design law applies in full)

- **LCP < 2.5s on mid-range mobile for BOTH versions.** Current homepage LCP is 4.38s —
  this phase must clear the debt, not add to it. First paint must not wait on the frame
  sequence (lazy-load after first paint; poster frame inline).
- Initial JS < ~300 KB gz. No new runtime dependencies without architect approval.
- `prefers-reduced-motion`: chapters render as static stacked sections, site fully usable.
- Mobile (portrait) works on a real phone for both versions, no horizontal overflow,
  text readable at every scroll position.
- Hero communicates name + role + value within ~5s, before any animation finishes.
- No `backdrop-filter` blur over a live-animating canvas on mobile.

## Acceptance criteria

- [ ] Both versions implement the full approved chapter structure with identical copy.
- [ ] Dark version: typed hero, word-overlap chapter transitions, continuous background,
      alternating chrome, poster project cards — all present and smooth on desktop + phone.
- [ ] Light version: distinct light grammar (not inverted dark), numbered sections,
      card-carried motion — reads clearly above template grade.
- [ ] Lighthouse mobile on both routes: LCP < 2.5s, initial JS < 300 KB gz (CI lighthouse
      job green, not just informational pass).
- [ ] Reduced-motion and JS-disabled fallbacks verified on both versions.
- [ ] `astro check`, `npm run build`, `npm run check-leaks` pass.
- [ ] Designer self-screenshots (desktop + mobile widths) attached to each report;
      reviewer clean APPROVE on the final commit before PR.

## Process notes

- `/impeccable init` runs before the first design dispatch (architect answers from
  `specs/project.md`).
- One designer dispatch per version (dark first — it's an iteration; light is greenfield),
  then a comparison review. Tong judges visuals and decides: pick one / combine.
- Reviewer dispatches stay blind per CLAUDE.md.

## Out of scope

- Final cinematic key art generation (Spline/AI video) — separate workstream.
- Chatbot functionality (Phase 4) — the finale chapter keeps the disabled shell.
- Work detail pages, /cv, /stats.
- Theme toggle on the live site — comparison happens on the branch; only the winning
  treatment ships (a future toggle is a possible "combine" outcome, decided then).
