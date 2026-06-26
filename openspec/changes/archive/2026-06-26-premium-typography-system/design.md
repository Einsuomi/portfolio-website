## Context

The visual layer is competent but templated. An inventory (`reference/premium-typography.md`) found 7
font families (2 dead), 52 ad-hoc font sizes, ad-hoc spacing, and a mono eyebrow on every section — the
exact patterns two design skills flag as AI tells. The text-color ramp is already disciplined. This is a
cross-cutting restyle: the tokens live in one file (`backbone.css`) but are referenced by ~20
components/pages, so it benefits from token-first decisions before the sweep. Constraints: public repo
(self-hosted free/OFL fonts only via `@fontsource`), must stay phone-usable with reduced-motion + WebGL
fallbacks, and the cursor/pointer interactions, scene backdrop, glass cards, content, and routes are
preserved. A throwaway preview validated the direction.

## Goals / Non-Goals

**Goals:**
- Collapse to **3 font voices** (Bricolage Grotesque, Geist, JetBrains Mono); remove the other four.
- One **8-token modular size scale** + a complementary **fluid spacing-token scale**.
- **Micro-typography discipline**: negative tracking on machine caps, positive on micro labels, tight
  leading on the largest tokens, tabular figures on data.
- **Lock the text-color ramp** (3 ink tints + gold) and clear the `--ink-faint` contrast risk on reading text.
- **Thin the eyebrows** so section headings stand alone (hero keeps one).
- Apply across all pages including project-detail, write pages, privacy, and diagrams.

**Non-Goals:**
- No change to pointer/cursor interactions, the scene backdrop, glass-card structure, content, IA,
  routes, analytics, or the chatbot backend.
- No new serif accent (Newsreader/Spectral) in this change — deferred unless explicitly wanted later.
- No layout/section re-composition beyond removing kickers and re-tokenizing spacing.

## Decisions

**D1 — One expressive display family (Bricolage Grotesque) for both identity and machine voices.**
The old serif-vs-Anton duality used two families; the skills say emphasis/contrast should come from
weight + case *within* one family. Bricolage (variable, 200–800) does light identity (~430 floor on the
hero) and heavy machine caps (700–800) from one file. **Bricolage ships NO italic** — so emphasis (the
"human note", pull-quotes) is expressed through weight/size, never faux italic (skill: never fake an
italic). *Alternative:* keep two display families — rejected as less disciplined and a known tell.

**D2 — Geist for all body/UI.** Free, OFL, self-hostable (`@fontsource/geist-sans`), thematically apt
(we deploy on Vercel), far from Inter's default read while staying ultra-legible for prose + chat.
*Alternatives:* Satoshi / General Sans / Cabinet Grotesk — comparable quality but Fontshare licensing
adds self-host friction on a public repo.

**D3 — Keep JetBrains Mono.** Distinctive, legible at tiny sizes, on-theme for a data engineer.
*Alternative:* Geist Mono (unifies the stack) — viable, deferred to Open Question B.

**D4 — Zero serif.** A data-engineer portfolio reads more premium in a disciplined sans system, and it
sidesteps the #1 AI tell (creative = serif). *Alternative:* one restrained serif accent — deferred.

**D5 — Token names.** Keep `--font-display` (→ Bricolage), `--font-body` (→ Geist), `--font-mono`
(unchanged). Remove `--font-serif` and `--font-luxe`; their usages migrate to `--font-display` (titles,
light) or `--font-body` (prose) per the proposed mapping in the reference doc. Add `--t-*` size tokens,
`--space-*` spacing tokens, and small `--lh-*`/`--track-*` helpers.

**D6 — Concrete token set** (defined once in `backbone.css`):

```
/* Voices */
--font-display: 'Bricolage Grotesque Variable', system-ui, sans-serif;
--font-body:    'Geist', system-ui, sans-serif;
--font-mono:    'JetBrains Mono', ui-monospace, monospace;

/* Size scale (~1.25), responsive */
--t-micro: clamp(0.64rem, 0.6rem + 0.2vw, 0.66rem);
--t-label: clamp(0.74rem, 0.7rem + 0.3vw, 0.82rem);
--t-body:  1rem;                              /* 16px floor */
--t-lead:  clamp(1.1rem, 1rem + 0.6vw, 1.25rem);
--t-sm:    clamp(1.35rem, 1.2rem + 1vw, 1.6rem);
--t-md:    clamp(1.6rem, 1.3rem + 1.6vw, 2.05rem);
--t-lg:    clamp(2.4rem, 1.8rem + 3vw, 3.25rem);
--t-xl:    clamp(3rem, 2rem + 5vw, 5.25rem);
--t-display: clamp(5rem, 22vw, 16rem);        /* preloader outlier only */

/* Spacing scale, responsive */
--space-2xs: clamp(0.5rem, 1vw, 0.75rem);
--space-xs:  clamp(0.75rem, 1.5vw, 1rem);
--space-sm:  clamp(1rem, 2vw, 1.5rem);
--space-md:  clamp(1.5rem, 3vw, 2.5rem);
--space-lg:  clamp(2.5rem, 5vw, 4rem);
--space-xl:  clamp(4rem, 8vw, 7rem);
--space-2xl: clamp(5.5rem, 11vw, 10rem);      /* section padding-block */

/* Micro-typography helpers */
--lh-tight: 1.05;  --lh-snug: 1.15;  --lh-body: 1.6;
--track-machine:    -0.03em;  /* large machine caps (--t-lg/--t-xl) = solid blocks */
--track-machine-sm: -0.01em;  /* small machine caps (~card titles) = near-zero, legibility wins */
--track-label:       0.08em;  /* mono micro labels (>= 0.05em) */

/* Resolved 🟡 decisions (2026-06-25):
   - Aligned/stacked numeric data uses --font-mono (JetBrains Mono, real tabular figures);
     Bricolage carries ONLY the single large display numeral (hero/one big stat).
   - Hero wordmark weight floors at ~430 (it sits over moving video); other identity
     titles on the static scene may go as light as ~380.
   - Machine-caps tracking is size-aware: --track-machine on big headings,
     --track-machine-sm on small card titles.
   - Long-form article body (write/project-detail) holds ~17–18px / --lh-body 1.6 / 66ch. */
```

**D7 — Eyebrow thinning.** Remove the `.kicker` markup from Experience, Projects, Writes, and Chatbot;
the hero keeps its single kicker. Keep the `.kicker` CSS (used by hero + any future justified use).

**D8 — Tabular figures.** Apply `font-variant-numeric: tabular-nums` to data-bearing selectors (stat
numbers/labels, Experience meta, project meta, diagram numerics), not globally.

## Risks / Trade-offs

- **Wide visual-regression surface (~20 files)** → token-first edits, then a section-by-section build +
  visual pass; the throwaway preview already validated the look.
- **Bricolage may read too quirky** → Schibsted Grotesk is a drop-in fallback (single `--font-display`
  swap); decided at Open Question A before/at apply.
- **`@fontsource` package availability/weights** → verify `@fontsource-variable/bricolage-grotesque` and
  `@fontsource/geist-sans` exist with needed weights before the sweep; fail early.
- **Faint reading text under 4.5:1** → audit the `--ink-faint` reading-content list, promote to
  `--ink-dim`; keep faint for decoration only.
- **Font payload / LCP** → families drop ~11 files → ~6 (variable fonts); watch Lighthouse, not a gate.
- **Reduced-motion / phone** → no motion change here, but re-verify legibility + no horizontal overflow
  after the spacing re-tokenization.

## Implementation gotcha (found at apply, fixed)

`@fontsource/geist-sans` registers the CSS family name as **`Geist Sans`**, NOT `Geist` (the Google
Fonts name used in the throwaway previews). The token initially said `'Geist'`, so body text silently
fell back to system-ui. Fix: `--font-body: 'Geist Sans', system-ui, sans-serif`. Caught via a browser
`document.fonts` check, not the build (the build is happy with a non-matching family name).

## Migration Plan

1. Add `@fontsource-variable/bricolage-grotesque` + `@fontsource/geist-sans`; remove anton, archivo,
   inter, instrument-serif, space-grotesk, fraunces from `package.json` + `Base.astro` imports.
2. Define all tokens (D6) in `backbone.css`; remove `--font-serif`/`--font-luxe`.
3. Sweep components/pages to the new tokens (fonts, sizes, spacing, tracking, leading, tabular-nums) and
   remove kickers from non-hero sections — per the proposed table in `reference/premium-typography.md`.
4. Contrast audit: promote faint reading text to `--ink-dim`; fold `--hero-ink`/`--hero-gold` into globals.
5. Verify: `astro check` + build, phone width, reduced-motion, 4.5:1 contrast, Lighthouse note.
6. Rollback: revert the `feat/premium-typography` branch (single-branch, no data/migration).

## Open Questions

- **A — Display font:** **DECIDED 2026-06-25 → Bricolage Grotesque.** (Schibsted Grotesk remains the
  drop-in fallback if Bricolage's quirk reads as too much at build time.)
- **B — Mono:** keep JetBrains Mono (default) vs switch to Geist Mono to unify.
- **C — Serif accent:** none (default) vs one restrained free serif (Newsreader/Spectral) for pull-quotes only.
- **D — DECIDED 2026-06-25 → promote both.** Experience and Writes each get a real, confident Bricolage
  `h2` (no gold kicker above it). Rationale: the anti-slop rule is "let the *headline* stand alone" (it
  presupposes a headline; confidence reads as premium), and accessibility — ranked #1 in both skills —
  needs a semantic heading per major section for screen-reader/SEO structure. Heading-less was the weaker
  call for a recruiter-facing site. **Placement:** the heading sits at the section top, left-aligned to the
  section's content edge, with `--space-lg` below it; exactly one heading, no eyebrow. Keep each section's
  existing distinct composition (Experience ladder, Projects gallery, Writes spotlight card, Chatbot) so
  the four promoted headings do NOT collapse into an identical "big-heading-top-left" stamp
  (section-layout-repetition guard).

## Additional Risks (from the whole-picture audit, 2026-06-25)

- **Tabular figures may be a no-op on Bricolage.** Display grotesques often lack a `tnum` feature. If
  absent, stacked numeric data SHALL use JetBrains Mono for alignment; Bricolage keeps only the single
  large hero/stat numeral. → verify the feature exists before relying on it.
- **Hero wordmark at light weight (~380) over moving video.** Thin strokes over busy footage risk the
  "readable over any background / name in ~5s" guardrail. → test on the actual video; raise to a ~420–440
  floor or lean on the scrim if it fails.
- **Machine caps at negative tracking on small titles.** `--track-machine` (-0.03em) on ~22px uppercase
  Bricolage card titles + Bricolage's quirky letterforms → verify legibility at small sizes, not just big.
- **All-sans long-form reading.** Write/project-detail prose moves from a light editorial serif to Geist;
  → keep 65–75ch line length, 1.5–1.6 leading, and consider `--t-lead` for the longest article bodies so
  reading stays comfortable.
- **Em-dash scope (DECIDED 2026-06-25):** ~1,150 em-dashes exist in `src/`, mostly chatbot corpus + wiki
  source (not rendered type). **In this change:** fix only the *visible em-dashes that live in component
  `.astro` markup we are already restyling* (e.g. the Chatbot `<h2>` `Don't just read — talk.`) — cheap,
  and we won't reship a known tell in a heading we're editing. **Deferred to a separate copy-audit change:**
  the bulk content (`projects.ts` blurbs/body, wiki, chatbot corpus) — it's voice-sensitive and large.
- **Out-of-scope but logged:** decorative `✦`/`·` separators and the `01/02/03` + card watermark numbers
  are section-number/decorative tells worth a separate placement pass (not this change).
