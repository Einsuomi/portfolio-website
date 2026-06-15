# Phase 1b — Visual Base: Dark & Light Versions (both ship)

**Status: SHIPPED, THEN PARTLY SUPERSEDED (2026-06-15).** Both versions were built and
merged (PR #6). Direction has since changed: the dark version is the keeper and ships;
the light camera-ride version was RETIRED (snapshot in
`backups/light-v1-camera-ride-pipeline/`), and light will be REBUILT as a colour theme of
the dark scene — not a separate page. This file is kept as the phase-1b record; for current
direction see `reference/v3-v4-demos.md`.

## Why

Tong built two complete demos that define the look and *interaction feel* he wants
(`~/Desktop/Projects/portfolio-website-test/v3` dark, `v4` light — read-only source of
truth; live anchors usta.agency and vectrfl.com; catalogued in `reference/v3-v4-demos.md`).

Decision (changed from the prior draft): **both versions ship and both are kept** — not
"pick the winner." Dark and light are two distinct experiences of the same portfolio,
and the visitor can switch between them. The demos define stack + style + feel; we
rebuild whatever is needed to land that feel inside our Astro site with real content
and real functionality.

## What

Two full homepages, one **shared 7-beat timeline**, identical content, different grammar:

**Hero (about me) → Neste → PostNord → Basware → Projects → Writes → Talk to me (bot).**

(No team/agency section, no education chapter. The bot beat is a disabled shell — Phase 4.)

### Dark version — v3 feel (usta.agency)
- Fixed full-screen **particle cloud** behind HTML; cursor repels particles; word-by-word
  reveals; custom cursor (swelling ring); grain; loader count-up. Anton/Archivo/Inter,
  near-black `#060606`, cream `#ECE8DE`, blue `#3B6CF6` / amber `#E8762B` accents,
  outline+fill display words. Tokens in `reference/v3-v4-demos.md`.
- **Particle morphs MUST be meaningful** (Tong: "not just random dots"). Per beat:
  Hero = rotating **globe with Luxembourg / W. Europe lit**; Neste/PostNord/Basware =
  particles resolving into the **NESTE / POSTNORD / BASWARE** wordmarks (particle-text:
  sample the word on a canvas, use pixels as particle targets); Projects / Writes /
  Talk-to-me = designer's invention (brief: a built-artifact constellation, forming text
  lines, a conversational/neural form). The morph is an argument, not decoration.

### Light version — v4 feel (vectrfl.com)
- Camera rides a glowing **pipeline curve** through landmarks (the original `project.md`
  architecture: "fixed 3D canvas + clean HTML scrolling over it"); instanced ground,
  procedural glow + fog, telemetry HUD, stage rail, glass panels. Space Grotesk / Inter /
  JetBrains Mono, fog `#eaf0f7`, ink `#0b1220`, cyan `#1ea7ff` + per-stage accents.
- The demo's generic tool-stages (AWS/Snowflake/…) **remap to the 7 beats**; each landmark
  becomes a structure representing its beat (mapping in `reference/v3-v4-demos.md`).
- **Content is authored as real HTML, 3D layered behind it** — NOT JS-injected (the demo
  injects from `config.js`; that breaks no-JS/SEO and must change).

### Routing & "use both"
- One Astro app, shared shell (self-hosted fonts, SEO meta, analytics, contact).
- Two routes carry the two experiences; a **persistent dark/light switch** flips between
  them, choice saved (localStorage). **Default = dark** (flip-able). Each route loads
  ONLY its own scene's JS — never both.
- The old comparison routes (`/light`, `/dark`, `/hero-light`, `/v2`, `/scroll-demo`) and
  the old `index.astro` are replaced; stale routes removed before PR.

### Stack
- **Astro 6 retained** as the shell (gives real-HTML SSR fallback, `/api/track`, CI,
  `check-leaks`, content collections; bundles three/gsap/lenis via its own Vite).
- Net-new dependency: **`three`** only (gsap + lenis already in `package.json`). No React,
  no other runtime deps without architect approval. v3's CDN import map → bundled local.

## Functionality to (re)attach during the port
- Analytics: `TrackBeacon` / `POST /api/track` fires on load + key interactions
  (CTA clicks, version switch, beat reached). Keep the endpoint's existing contract.
- Real links/contact: email, GitHub, LinkedIn, project + essay destinations — no dead
  anchors. Content pulled from `src/content/wiki` + `specs/project.md`; flag any gaps
  (employer deep-dives may be thin — see project.md §5 Content TODO).
- Disabled chatbot shell on the final beat (Phase 4 wires the brain).
- `check-leaks` clean; self-hosted fonts (no gstatic at runtime — GDPR).

## Hard constraints (CLAUDE.md design law applies — amended this phase)
- Name + role + value legible within ~5s, before any animation finishes, on both versions.
- **Real HTML content** present without JS (SEO/ATS/no-JS); reduced-motion → static,
  fully-usable stacked sections; WebGL-fail → static poster, site usable.
- Lazy-load the 3D/WebGL after first paint (LCP must be text, not canvas). Pixel ratio
  capped at `min(devicePixelRatio, 2)`. No `backdrop-filter` blur over the live canvas on
  mobile (cheap glass instead).
- Mobile portrait works on a real phone for both, no horizontal overflow, text readable at
  every scroll position.
- **Perf is a target, not a gate (see CLAUDE.md):** aim for fast first paint (text LCP)
  and lean per-route JS; three (~150 KB gz) lazy-loaded after first paint; only the active
  route's scene loads. CI reports LCP/JS weight as informational — never block on a number.

## Acceptance criteria
- [ ] Both versions implement the full 7-beat timeline with identical real content.
- [ ] Dark: meaningful per-beat particle morphs (globe+Luxembourg, NESTE/POSTNORD/BASWARE
      wordmarks, designed projects/writes/bot), custom cursor, smooth on desktop + phone.
- [ ] Light: pipeline camera ride, real-HTML panels + 3D behind, HUD/rail, smooth on both.
- [ ] Dark/light switch works and is remembered; default dark; only active scene loads.
- [ ] Real-HTML/no-JS, reduced-motion, and WebGL-fail fallbacks verified on both.
- [ ] Analytics fires; links real; chatbot shell disabled.
- [ ] CI green: `astro check`, `npm run build`, `check-leaks`, `verify-ui` (incl. no-JS /
      reduced-motion fallback) on BOTH routes. Lighthouse perf runs as **informational**.
- [ ] Designer self-screenshots (desktop + mobile) per version; reviewer clean APPROVE on
      the final commit before PR.

## Process
- Architect captures references (done: `reference/v3-v4-demos.md`), amends CLAUDE.md +
  this spec, gets Tong's approval, then dispatches.
- Build order: shared shell + switch + `three` dep → dark port (it's the default) →
  light port → verification harness extensions → blind review loop.
- Reviewer dispatches stay blind (spec + diff scope only).

## Out of scope
- Final cinematic key art / bespoke 3D models / licensed fonts (use the demos' procedural
  shapes + free fonts; swappable later).
- Chatbot brain (Phase 4) — disabled shell only.
- Work detail pages, `/cv`, `/stats`.
- Real-event wiring of the pipeline visual (Phase 2).

## Open decision (content mapping, raised at build time)
- Default route confirmed **dark** unless Tong flips it.
- Projects / Writes / Talk-to-me particle + landmark forms are the designer's invention
  ("surprise me") — Tong judges at the taste gate.
