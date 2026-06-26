## Why

The site's type, sizing, color, and section rhythm read as competent but templated, not premium. An
inventory found **7 font families** (2 dead) leaning on the three most-templated web choices — Fraunces,
Instrument Serif, and Inter — **52 ad-hoc font sizes**, ad-hoc spacing, and a mono "eyebrow" kicker on
*every* section. Two design skills (`design-taste-frontend`, `ui-ux-pro-max`) name those fonts and that
eyebrow rhythm as AI tells. The goal is a disciplined, high-end "$10k" feel through restraint: fewer
fonts, one tight size scale, a tokenized spacing scale, a locked color ramp, and confident section
headings that stand alone. Full analysis lives in `reference/premium-typography.md`.

## What Changes

- **Fonts: 7 → 3.** Adopt a sans-led, zero-serif, three-voice system, all free/OFL/self-hostable:
  - **Bricolage Grotesque** (variable) — identity + all titles + the heavy uppercase "machine" voice;
    the person/machine contrast is rebuilt within one family via weight + case (light 380 vs 800 caps).
  - **Geist** — all body, prose, UI, and short leads.
  - **JetBrains Mono** — kept, for labels/meta/tags/data/code.
  - **BREAKING (visual identity):** removes Fraunces, Instrument Serif, Inter, Anton, and the two dead
    families (Archivo, Space Grotesk).
- **Sizes: 52 → 8 tokens.** One modular scale (~1.25) as `--t-micro … --t-xl` (+ one display outlier),
  each responsive via `clamp()`; 16px body floor.
- **Micro-typography discipline.** Negative tracking on Bricolage 800 caps (≈ -0.02 to -0.04em) so
  machine headings read as solid blocks; positive tracking (≈ 0.05em+) on micro mono labels; tight
  line-height (≈1.0–1.1) on `--t-xl`/`--t-lg`, comfortable 1.5–1.6 on Geist body; `tabular-nums` on all
  numerals in stats/metrics/data.
- **Spacing as tokens.** A complementary fluid spacing scale (`--space-*` via `clamp()`) drives section
  padding, gaps, and rhythm so the layout never feels cramped — premium breathing room.
- **Color: lock the 3-tint ink ramp + 1 gold accent.** Promote faint *reading* text (currently
  `--ink-faint` 40%) to `--ink-dim` where it fails 4.5:1; keep faint only for true decoration. Fold the
  duplicate `--hero-ink`/`--hero-gold` aliases into the globals. Bronze/silver stay scoped to the one
  medallion diagram.
- **Kill eyebrow noise.** Drop the `.kicker` from almost all sections; let the Bricolage section heading
  stand alone (hero may keep its single allowed eyebrow). Confidence over hierarchy-explaining.
- **Apply everywhere:** home sections, project-detail pages, write pages, privacy, diagrams, chat UI.
- **Preserve:** the cursor/pointer interactions, the cinematic scene backdrop + scrim, the glass cards,
  and all content/IA. This is a restyle of the type/size/color/rhythm layer, not a rebuild.

## Capabilities

### New Capabilities
<!-- none — this is a modification to the existing cross-cutting design system -->

### Modified Capabilities
- `visual-language`: replace the serif/Anton typographic-duality requirement with the Bricolage/Geist/
  Mono three-voice system; add requirements for the modular size-token scale, the fluid spacing-token
  scale, micro-typography discipline (tracking, leading, tabular figures), the locked text-color ramp
  with a 4.5:1 contrast floor, and section-eyebrow restraint. Update the stale gold-scarcity requirement
  to the locked single-accent rule.

## Impact

- **Tokens:** `src/styles/backbone.css` (font, size, spacing, color tokens) is the hub of the change.
- **Font loading:** `src/layouts/Base.astro` + `package.json` — add `@fontsource-variable/bricolage-grotesque`
  and `@fontsource/geist-sans` (and weights); remove anton, archivo, inter, instrument-serif,
  space-grotesk, fraunces.
- **Components/pages (all):** Hero (`index.astro`), HeroBar, Experience, Projects, Writes, Chatbot,
  ChatPanel, ChatLauncher, Preloader, ProjectDetail, WriteLayout, privacy, the 5 diagram components, and
  the write pages — swap `--font-*`/sizes/colors to the new tokens and remove kickers.
- **No change to:** pointer/cursor interactions, scene backdrop, content, routes, analytics, chatbot
  backend.
- **Risk:** mostly visual-regression surface area (touches nearly every component). Watched, not gated:
  font payload drops (~11 files → ~6); verify reduced-motion + phone legibility + 4.5:1 contrast.
