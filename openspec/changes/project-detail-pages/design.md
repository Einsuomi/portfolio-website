## Context

The homepage Projects gallery (`src/components/Projects.astro`, data in `src/lib/timeline.ts`)
renders four cards that link out to GitHub. There is no on-site place to go deeper. The site
is a single Astro page with a continuous, viewport-fixed hero scene (WebGL/video) that the
whole body rides (`site-shell`), driven by Lenis + GSAP ScrollTrigger, with reduced-motion /
no-JS fallbacks. We have six real Fingrid assets already in
`src/assets/projects/fingrid-data-platform/`: two architecture diagrams (Azure end-to-end
Medallion pipeline; Azure DevOps CI/CD across Dev/Test/Prod), two ADF pipeline screenshots
(metadata-driven Lookup→ForEach; incremental Until-loop with watermark timestamps), and two
cinematic glowing-grid cityscapes (gold-on-dark, palette-matched).

## Goals / Non-Goals

**Goals:**
- A real, shareable, indexable `/projects/[slug]` route per project that has detail content.
- One reusable premium template (fixed section anatomy) so the remaining projects are fast
  fills; it reserves an optional "Model & Results" block for the future ML/thesis page.
- The Fingrid flagship page, authored from the real assets with refined prose.
- Seamless card → page motion (shared-element morph) with no hard reload that tears down and
  re-initializes the hero scene.
- Full mobile / reduced-motion / no-JS usability; no page-level horizontal overflow.

**Non-Goals:**
- The other three projects and the ML/thesis page (fast follow-on changes reusing this template).
- The chatbot, Writes changes, or any backend.
- Redrawing the supplied diagrams to a custom theme (a possible future polish).

## Decisions

**D1 — One dynamic route, typed data source.** Implement `src/pages/projects/[slug].astro`
with `getStaticPaths()` fed by a typed `src/lib/projects.ts` (`ProjectDetail` objects: slug,
hero {title, value, stack, repo}, context, architecture [{image, caption}], howItWorks
[points], gallery [shots], outcome, optional `modelResults`). *Alternatives:* one `.astro`
file per project (rejected — duplication); Astro content collections / MDX (rejected for now —
Tong wants hardcoded in-repo content with imported `astro:assets`, not markdown through the
`sync` wiki pipeline; can migrate later if content volume grows).

**D2 — Astro View Transitions with a persistent hero.** Add `<ClientRouter />` to
`src/layouts/Base.astro` and mark the hero-scene container `transition:persist` so the
WebGL/video island is *not* re-created on same-origin navigation — no white flash, no
re-init. The gallery card's image and the detail hero share a `transition:name` for the
shared-element morph. *Alternatives:* native MPA cross-document view transitions (rejected —
no persistent island, hero would re-mount); SPA overlay (rejected — no shareable URL).

**D3 — Detail pages ride the same continuous scene.** Rather than give each detail page its
own backdrop, the detail page rides the same viewport-fixed scene as the homepage body, with
case-study content in glass panels over it — keeping the "same world" unity of `site-shell`.
The two grid-cityscape images are used as in-page section atmosphere, not as the page
backdrop. (Flagged for Tong's visual judgment at apply time.)

**D4 — Light "schematic plate" for the diagrams.** The supplied diagrams are light-background
Azure schematics; over the dark scene they sit inside a contained light/blueprint plate with
padding so they stay crisp and legible, presented full-bleed within the Architecture section.
Screenshots get the same treatment in the gallery.

**D5 — Transitions are progressive enhancement.** Routes are static HTML (Astro SSG); links
are ordinary anchors. Under `prefers-reduced-motion` or no-JS, navigation is a plain instant
load and every page is fully usable. Lenis/GSAP re-init is bound to `astro:page-load` and
guarded against double-init so the scroll engine works after client-side navigation.

## Risks / Trade-offs

- **Hero scene double-mounts or re-inits on client navigation** → use `transition:persist` on
  the scene island; bind all scene/scroll init to `astro:page-load` with an idempotent guard.
- **Light diagrams unreadable over the dark theme** → contained light schematic plate (D4)
  instead of dropping raw transparent PNGs onto the scene.
- **Partial view-transition support (Safari/older Firefox)** → Astro degrades to normal
  navigation automatically; the morph is enhancement only, never required for usability.
- **Image weight (one diagram ~400KB, six files)** → optimize via `astro:assets` `<Image>`,
  lazy-load everything below the fold; the hero text remains the LCP element. Watched, not gated.
- **Stack-list mismatch** (old card metadata says AWS/DLT; assets show the Azure build) →
  author the Fingrid page from the assets (Azure: ADF + ADLS Gen2 + Databricks + Power BI +
  Azure DevOps) and align the card's stack/summary to match.

## Open Questions

- Does Tong want the detail page to ride the global scene (D3) or have a distinct
  cityscape-led backdrop? Default is D3; revisit at apply once the flagship is visible.
- Final slug for the Fingrid route: `fingrid-data-platform` (matches the asset folder).
