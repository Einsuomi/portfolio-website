## Why

The Projects gallery shows four cards but every project dead-ends at an external GitHub
repo — a recruiter who is interested has nowhere on the site to go deeper, and the real
engineering (architecture, trade-offs, proof shots) stays invisible. We have rich, real
assets for the flagship Fingrid build (two architecture diagrams, two ADF pipeline
screenshots, two cinematic grid cityscapes) that deserve a first-class, on-site case study
— told with the site's premium voice, not the dense old Wix copy.

## What Changes

- Introduce shareable per-project detail routes at `/projects/[slug]` — real, indexable,
  deep-linkable pages (a recruiter can send one project URL).
- Add a reusable **premium detail-page template** with a fixed anatomy: hero (title ·
  one-line value · stack chips · repo link) → context/problem → architecture (full-bleed
  diagram) → how it works (tight points) → screenshot gallery → outcome/links. The template
  reserves an optional **"Model & Results"** block for the future ML/thesis page.
- Ship the **Fingrid flagship page** as the first instance, authored from real assets and
  rewritten for clarity/impact (not bounded by the old Wix text or the old stack list — the
  assets describe the Azure build: ADF + ADLS Gen2 + Databricks Medallion + Power BI, with
  Azure DevOps CI/CD across Dev/Test/Prod).
- Enable **cross-page View Transitions** so a gallery card morphs into its detail page (a
  shared-element move) with no hard page reload — the continuous hero scene persists instead
  of tearing down and re-initializing, preserving the magnetic-scroll feel.
- Gallery cards that have a detail page link to their route (card → page transition) rather
  than only to the external repo.
- Project detail content is **hardcoded** in-repo (refined prose + real assets), outside the
  `npm run sync` wiki pipeline; no confidential content is introduced.

Scope of this change: the **template + the Fingrid page only**. The remaining three projects
and the ML/thesis page are fast follow-on changes that reuse this template; they are out of
scope here so we lock the visual on the flagship first.

## Capabilities

### New Capabilities
- `project-detail`: Per-project detail routes (`/projects/[slug]`), the reusable premium
  template and its section anatomy (including the reserved Model & Results block), the
  Fingrid flagship instance, asset handling via `astro:assets`, and the mobile /
  reduced-motion / no-JS fallbacks for the page.

### Modified Capabilities
- `projects-gallery`: A card that has a detail page SHALL link to its `/projects/[slug]`
  route (becoming the primary affordance), with a shared-element transition into the page;
  the external repo link moves into the detail page.
- `site-shell`: The shell SHALL enable client-side View Transitions for same-origin
  navigation and keep the hero scene persistent across navigation, so moving between the
  homepage and a detail page is a seamless animated transition rather than a full reload.

## Impact

- **New:** `src/pages/projects/[slug].astro` (dynamic route), a project content/data source
  (extend `src/lib/timeline.ts` or a new `src/lib/projects.ts` with structured detail data),
  detail-page section components, and styles consistent with `backbone.css` tokens.
- **Modified:** `src/components/Projects.astro` (card link → route), `src/layouts/Base.astro`
  (enable Astro `ClientRouter` / view transitions; mark the hero scene `transition:persist`).
- **Assets:** `src/assets/projects/fingrid-data-platform/` (6 files already dropped),
  optimized through `astro:assets`.
- **Risk to watch:** the hero scene must survive client-side navigation without re-init or
  double-mount; reduced-motion and no-JS visitors must still get a fully usable static page
  (transitions degrade to ordinary links). Performance (LCP, image weight) watched, not gated.
