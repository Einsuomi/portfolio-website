## 1. Data model & routing scaffold

- [x] 1.1 Add a typed `ProjectDetail` model and `src/lib/projects.ts` (slug, hero {title, value, stack, repo}, context, architecture [{image, caption}], howItWorks [points], gallery [shots], outcome, optional `modelResults`); give each existing project a slug, Fingrid = `fingrid-data-platform`
- [x] 1.2 Create `src/pages/projects/[slug].astro` with `getStaticPaths()` driven by `projects.ts`; render only projects that have detail content
- [x] 1.3 Confirm the route builds to static HTML and is reachable directly (no client JS required to see content) — verified: prerenders to `/projects/fingrid-data-platform/index.html`

## 2. View transitions & persistent hero (site-shell)

- [x] 2.1 Add Astro `<ClientRouter />` to `src/layouts/Base.astro` for same-origin navigation
- [x] 2.2 Hero persistence — NOTE: `transition:persist` not needed. The "scene" is a pure-CSS `background-attachment: fixed` still (identical on every page), so it is continuous across navigation without an island. The real risk was the refresh Preloader + hero entrance (deduped scripts) not re-running on back-nav — handled in 2.3 by making them nav-aware so the curtain never re-traps and the hero copy is never left hidden
- [x] 2.3 Bind Lenis + GSAP/ScrollTrigger init to `astro:page-load` with an idempotent guard + `astro:before-swap` teardown so the scroll engine re-initializes cleanly after navigation (no leaked listeners); Preloader + hero entrance made refresh-only via a first-load flag
- [x] 2.4 Verify navigating homepage ⇄ detail page is animated, scene stays alive, and back returns to the gallery — verified in browser: forward via card, back restores home with hero visible + preloader hidden

## 3. Reusable premium template

- [x] 3.1 Build the detail-page template (`src/components/ProjectDetail.astro`) for the fixed anatomy: hero → context → architecture → how it works → gallery → outcome/links, using backbone tokens (serif/Anton type duality, gold scarcity, glass-over-scene)
- [x] 3.2 Implement the optional "Model & Results" block (renders when `modelResults` present, omitted otherwise) — wired but unused until the ML/thesis page
- [x] 3.3 Light "schematic plate" for diagrams/screenshots (caption sits below on the scene for contrast); all images via `astro:assets` `<Image>`, lazy below the fold, hero eager
- [x] 3.4 Backdrop decision — DEFAULT applied: body rides the global doorway scene; the project's cityscape is the hero band only. Reads well; flagged for Tong's visual confirm/override

## 4. Gallery integration (projects-gallery)

- [x] 4.1 Update `src/components/Projects.astro` so a card with a detail page links to `/projects/<slug>` (repo link moved to the detail page)
- [x] 4.2 Add the shared-element `transition:name` pairing between the gallery card and the detail hero for the morph
- [x] 4.3 Align the Fingrid card's summary/stack with the real Azure build (ADF · Databricks · Delta Lake · Power BI)

## 5. Fingrid flagship content

- [x] 5.1 Author refined Fingrid prose (hero value, context, how-it-works points, outcome) describing the Azure build — ADF + control table + incremental load → ADLS Gen2 → Databricks Medallion + gold star schema → Power BI, Azure DevOps CI/CD across Dev/Test/Prod
- [x] 5.2 Place the two architecture diagrams + two ADF screenshots with captions; grid-cityscape image used as the hero band atmosphere
- [x] 5.3 Confirm name + one-line value land within the first viewport — verified

## 6. Verify & deliver

- [x] 6.1 `npm run build` + `astro check` pass; route emits static HTML — 0 errors
- [x] 6.2 Manual check desktop + 390px: no page-level horizontal overflow (390px scrollWidth == clientWidth); diagrams legible in plates; caption-contrast bug found + fixed (caption moved off the white plate onto the scene)
- [x] 6.3 Fallbacks: content is real prerendered HTML (no-JS usable); reduced-motion forces `[data-reveal]` visible and transitions degrade to plain navigation (same guarantees as the rest of the site)
- [x] 6.4 LCP / image weight — six assets optimized to WebP (e.g. the 401KB architecture diagram → 17KB; hero cityscape 117KB → 58KB, eager); total page image weight ~118KB WebP. JS adds only the small ClientRouter. Watched, not gated
- [x] 6.5 Open a PR from `feat/project-detail-pages` for Tong to review and merge

## 7. Review revisions (2026-06-20)

- [x] 7.1 Whole card is now a single real `<a>` (not a stretched-link overlay) — fixes card-01 being unclickable after a view-transition back-navigation (lingering `view-transition-name` disturbed the overlay's stacking)
- [x] 7.2 Hero band rides the global doorway scene (dropped the project cityscape) for site consistency
- [x] 7.3 Diagrams/screenshots framed in dark translucent panels (the supplied images have solid white backgrounds + dark text baked in, so transparent/dark-direct isn't possible without re-export) — matted as contained "screens"
- [x] 7.4 Premium caption treatment: mono "FIG. 0N" gold label + Instrument Serif italic description + gold hairline rule (was plain body text)
- [x] 7.5 Tong accepted the current page as the reusable TEMPLATE baseline; more screenshots + the other projects come as follow-ons
