## Context

Clean-slate `src/` with the hero direction locked (doorway-monolith lake video, Pair B default).
The scaffold (`Base.astro`, `TrackBeacon`, `api/track.ts`, `lib/timeline.ts`) survives intact in
`backups/site-v1-dark-dot/` and is restored rather than rebuilt. Fonts already self-hosted via
`@fontsource`: Anton, Archivo, Inter, Space Grotesk (variable), JetBrains Mono. The backbone theme
for sections below the hero is deliberately NOT decided here — the hero is built as a self-contained,
themeable block whose rendered look becomes the anchor for that later decision.

## Goals / Non-Goals

**Goals:**
- A cinematic, premium hero that lands name + role + value in ~5s and holds attention.
- Real-HTML text, legible over any video frame, with a clean reduced-motion / autoplay-fail fallback.
- Pair B ⇄ Pair A swappable from one config value.
- A type + color treatment that feels intentional and surprising, not templated — grounded in the
  ui-ux-pro-max + frontend-design skills.

**Non-Goals:**
- The backbone theme and any section below the hero (about, projects, chatbot, contact).
- The dot/particle system (parked; a later signature beat).
- A custom video player or scroll-driven scene — this hero is a looping background video, nothing more.

## Decisions

### Copy — "by day / by night"

Built from Tong's real profile (orchestrates enterprise pipelines on Azure/AWS/Databricks by day;
builds in public by night). The hero lands as three layers — a quiet mono status eyebrow, the name,
then the day/night line. The eyebrow no longer states the role (the line carries it); it becomes a
contextual status tag instead, keeping the hero clean. **Locked (Tong, this change):**

```
  (eyebrow, mono)   BUILDING IN PUBLIC — WESTERN EUROPE   (eyebrow still open — see below)
  (name, display)   Tong Nie
  (line, 3 rows)    By day, I orchestrate data.
                    By night, I ship ideas.
                    Same machine, different rules.
```

The noun parallel ("a ___ by day, a ___ by night") is tighter and punchier than a verb sentence; the
closing "same craft — a different canvas" unifies the two halves rather than just listing them. The
eyebrow is true to his profile (building in public, Western Europe), confident, and recruiter-relevant
without reading as job-hunting.

Alternate eyebrow kept if Tong wants an explicit availability signal:
`AVAILABLE 2026 — WESTERN EUROPE`. Night-noun variants if "builder" feels plain: *a maker, a tinkerer*.

### Typography — editorial-cinematic, using only already-loaded fonts

| Layer | Font | Treatment | Why |
|---|---|---|---|
| Eyebrow / status | **JetBrains Mono** 500 | uppercase, ~0.8rem, letter-spacing ~0.18em, gold | The "engineer's signature" — mono is the surprise tie-in to his craft; ui-ux-pro-max "Developer Mono" pattern |
| Name | **Anton** | huge, condensed, `clamp(3.5rem, 14vw, 11rem)`, line-height ~0.9, warm off-white | Confident A24-poster scale that fills the frame and reads cinematic over dusk footage |
| Day/night line | **Instrument Serif** 400 | `clamp(1.35rem, 3vw, 2.1rem)`, line-height ~1.28, max-width ~30ch | Refined editorial serif — premium high-contrast counterpoint to the heavy Anton display (Tong's pick over Space Grotesk, which read "tech-startup"). Self-hosted via `@fontsource/instrument-serif`. |

**Name font is locked to Anton** (Tong: "try your best") — no new font dependencies; all three faces
are already self-hosted. (Playfair/Cormorant were the luxury-serif alternative; not chosen.)

### Color — premium near-black + warm off-white + a gold pulled from the doorway

Validated against ui-ux-pro-max's recurring "premium dark + gold accent" palettes (E-commerce Luxury,
Luxury/Premium Brand). The gold is sampled from the scene's own doorway sunset glow so the type feels
lit by the video, not pasted on top.

```
  --hero-ink     #F5EFE3   warm off-white  (NOT pure #FFF — pure white reads cheap over warm footage)
  --hero-gold    #E0A33E   accent: the mono eyebrow + a thin rule; sampled from the doorway glow
  --hero-scrim   #0C0A09   warm near-black, used only in the gradient scrim
```

- **Scrim for legibility:** a bottom-anchored gradient `linear-gradient(transparent 35%, rgba(12,10,9,.72) 100%)`
  plus a faint global wash, sized so text sits in the protected zone. This is what guarantees the 4.5:1
  spec requirement across all frames, including the bloom peak — verified, not assumed.
- Gold is used on exactly two things (eyebrow + a 1px rule). Restraint is the premium signal.

### Top-right menu affordance (no top bar)

Tong wants the hero clean — **no top navigation bar.** Just a single clickable **menu icon fixed in the
top-right** corner (mono/gold to match the eyebrow). In this change it is a placeholder affordance: it
is present, focusable, and clickable, but has nothing to open yet (sections don't exist). Open/close
animation and a real menu panel are deferred to a later change. Built as its own small component so the
later animation work drops in without touching the hero.

### Motion (light touch)

- On load: GSAP word/line stagger — mono eyebrow → name → line, ~0.6s total, ease-out. Respects
  `prefers-reduced-motion` (no stagger; text simply present).
- The video's own breathing doorway light is the ambient motion; the hero adds none of its own beyond
  the entrance. No scroll-jacking in this change.

### Structure & config

- `index.astro` uses restored `Base.astro` (`version="dark"`), renders a `<section class="hero">` with
  `<video poster=...>` + `<source>` and the text block over it.
- One module-level constant `const HERO_PAIR = 'B'` (or `'A'`) maps to `{ video, still }` — the single
  swap point named in the spec.
- Assets moved into `public/hero/` so they are served statically with correct caching.

## Risks / Trade-offs

- **Video weight (~8–9 MB each).** Accepted per CLAUDE.md (heavy hero welcomed, watched not gated).
  Mitigation: `preload="none"` is wrong for a hero (we want it fast) → use `preload="auto"` for the
  active pair only; ship the still as poster so first paint never waits on the video. Report LCP after build.
- **Autoplay variance across browsers/data-saver.** Mitigated by the muted+playsinline+poster pattern and
  the explicit autoplay-fail fallback to the still.
- **Anton at huge scale can crowd a 390px phone.** Mitigated by the `clamp()` floor and a max-width on the
  line; verified at 390px against the no-horizontal-overflow requirement.
- **Copy is subjective.** Three variants kept swappable so Tong judges against the rendered hero, not in
  the abstract — same principle that's deferring the backbone theme.
