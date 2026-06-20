## Context

The project detail capability already ships a reusable template (`ProjectDetail.astro`) driven
by a single `ProjectDetail` object in `src/lib/projects.ts`, plus the `/projects/[slug].astro`
static route. Its architecture section today only renders `Figure[]` — supplied images in light
"schematic plates." The Fingrid flagship uses that path.

This change adds a second flagship (the AWS Databricks DLT lakehouse) whose source architecture
diagram is a cramped, blurry hand-drawing. Rather than ship that as an image, we rebuild it as a
native diagram. The repo and notebooks were read in full, so the page content is grounded in the
actual build, not the marketing writeup:

- Ingestion job: `1_Configuration` (UC catalog + bronze/silver/gold/landing schemas + a seeded
  control table) → `2_dataset_loopup` (active datasets from the control table) → `for_each`
  loop running `3_Source_To_Landing` (incremental, paginated, 429-aware Fingrid API pulls to S3)
  → triggers the DLT pipeline.
- DLT pipeline: Auto Loader bronze (dynamically generated per dataset), silver (a
  `TRANSFORMATION_LOGIC_MAP` per dataset), intermediate `@dlt.view`s, Auto CDC (SCD-1) into a
  gold star schema (`fact_consumption`, `fact_generation_forecast`, `dim_*`).
- Platform: Terraform (S3) + Databricks Asset Bundles + GitHub Actions, catalog-per-env
  (`w_dev`/`w_test`/`w_prod`), Unity Catalog governance, Power BI.

Three supplied assets in `src/assets/projects/aws-dlt-pipeline/`: the hand-drawn architecture
(rebuilt natively), and two real Databricks UI screenshots — the DLT lineage graph
(`dlt pipeline.jpg`) and the job task DAG (`Screenshot ...214307.jpg`) — kept as proof.

## Goals / Non-Goals

**Goals:**
- A `/projects/aws-dlt-pipeline` page that reads as a designed case study, grounded in real code.
- One native, on-brand, end-to-end architecture diagram (inline SVG/HTML/CSS, no runtime JS) as
  the centerpiece — crisp at any zoom, real text, accessible, mobile-safe.
- Extend the template additively so native diagrams are supported without touching how Fingrid
  (and any future image-only page) renders.

**Non-Goals:**
- No redesign of the existing template anatomy, tokens, or scene backdrop.
- Not rebuilding the two Databricks screenshots — they are genuine proof artifacts, kept as-is.
- No Mermaid / runtime diagram library, no new dependencies.
- Not surfacing the repo's leftover cruft (default template README, `distance_km` UDF,
  Wärtsilä/Bitbucket residue) — the narrative quietly tells the clean story.

## Decisions

**Decision: Hand-authored inline SVG/HTML/CSS for the diagram, not Mermaid.**
The site taste is bespoke/premium (serif↔Anton type duality, gold scarcity, glass plates) and
the project rule requires content in real HTML, not JS-injected. Mermaid renders generic boxes,
needs a runtime/build renderer, and would read as templated. Bespoke SVG is static HTML, themes
to the dark scene, stays crisp, and lets us actually *clarify* the cramped original (one unified
left-to-right flow with a governing CI/CD band) instead of redrawing the mess.
- Alternative considered: Mermaid — rejected (taste clash, runtime JS, generic output).
- Alternative considered: just re-export the image crisper — rejected (still off-brand, and
  doesn't fix the cramped structure).

**Decision: Extend `architecture` additively via a diagram slot, keep `Figure[]` working.**
Add an optional native-diagram marker to the `ProjectDetail` shape (e.g. an `architectureDiagram`
discriminator naming a component, or an optional component slot rendered before the figures).
`ProjectDetail.astro` renders the native diagram when present, then any image figures. Fingrid
sets nothing new and is byte-for-byte unchanged. This avoids a breaking change to the interface.
- Alternative considered: replace `Figure[]` with a union type — rejected (touches Fingrid,
  larger blast radius for no gain).

**Decision: Diagram lives as its own component** (`src/components/diagrams/DltArchitecture.astro`)
so the SVG/markup is isolated, testable, and the template stays generic. The template references
it by the page's diagram marker rather than hardcoding.

**Decision: Keep the two Databricks screenshots as gallery proof figures**, captioned as figure
notes (DLT lineage; orchestration DAG). They corroborate the native diagram with real UI.

## Risks / Trade-offs

- [Native diagram is verbose to hand-author and easy to break responsively] → Build mobile-first
  with a single-column reflow at narrow widths; verify at 390px for zero horizontal overflow;
  prefer flow/grid layout over absolute positioning so it reflows rather than clips.
- [Diagram text could wash into the dark scene] → Render inside the existing light framed plate,
  reusing the same plate treatment as image figures so contrast rules already hold.
- [Template change could regress Fingrid] → Additive optional field; render path for image
  figures is untouched. Verify the Fingrid page renders identically after the change.
- [Repo cruft tempts inaccurate claims] → Page prose is written from the code actually read
  (notebooks + DLT transforms), framing CI/CD as GitHub Actions (what the repo ships), not the
  Bitbucket the old diagram showed.

## Migration Plan

Additive feature on a feature branch → PR; no data migration, no rollback concern. Reverting the
PR fully removes the page and the template's diagram slot. Run `astro check` and a local build;
verify `/projects/aws-dlt-pipeline` and the unchanged Fingrid page before merge.

## Open Questions

- None blocking. Exact `ProjectDetail` field name for the diagram marker is an implementation
  detail settled during apply.
