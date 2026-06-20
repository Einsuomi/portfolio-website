## Why

Tong's AWS lakehouse build ("Data Engineering With DLT Pipeline") is a second, distinct
data-engineering flagship — same problem domain as Fingrid but on AWS + Databricks DLT, with a
genuinely stronger metadata-driven design. It deserves an on-site case-study page, not a
dead-end link to a default-template GitHub repo. The source architecture diagram is a cramped,
blurry hand-drawing; rebuilding it as a native, on-brand diagram is both a clarity win and a
chance to make the page's centerpiece feel like a designed artifact rather than a screenshot.

## What Changes

- Add a new project detail page at `/projects/aws-dlt-pipeline` authored from the real in-repo
  assets and the actual repo/notebook source — the AWS S3 + Databricks DLT medallion lakehouse
  fed by Fingrid's open API, governed by Unity Catalog, shipped via Terraform + Databricks Asset
  Bundles + GitHub Actions, to Power BI.
- Extend the reusable detail template so a page's architecture section can render a **native,
  on-brand diagram component** (inline SVG/HTML/CSS, real text, no runtime JS) in a framed
  plate — instead of, or alongside, supplied diagram images. This new project uses it; existing
  pages (Fingrid) keep using image figures and are unaffected.
- Keep the two real Databricks UI screenshots (DLT lineage graph, job task DAG) as proof
  figures in the gallery; only the hand-drawn end-to-end architecture is rebuilt natively.
- Wire the homepage Projects gallery card so it deep-links to the new page.

## Capabilities

### New Capabilities
<!-- None — this reuses the existing project-detail template capability. -->

### Modified Capabilities
- `project-detail`: add the ability for the architecture section to render a native, on-brand
  diagram component (not only supplied images), and add the AWS DLT pipeline page as a second
  authored flagship grounded in its real assets and repo source.

## Impact

- `src/lib/projects.ts` — new `PROJECT_DETAILS['aws-dlt-pipeline']` entry; architecture field
  extended to allow a native-diagram variant.
- `src/components/ProjectDetail.astro` — render a native diagram when a page supplies one.
- New diagram component (e.g. `src/components/diagrams/DltArchitecture.astro`) — inline SVG/HTML.
- `src/scripts/timeline.ts` (or wherever the gallery cards/links live) — link the gallery card.
- `src/assets/projects/aws-dlt-pipeline/` — the three supplied images (two kept as screenshots).
- No new runtime dependencies; static HTML only.
