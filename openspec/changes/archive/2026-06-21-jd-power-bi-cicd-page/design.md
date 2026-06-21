## Context

The project-detail template (`ProjectDetail.astro`, driven by `PROJECT_DETAILS` in
`src/lib/projects.ts`) already renders native architecture diagrams via a `DIAGRAMS` map keyed
by a typed `ArchitectureDiagramId` union — the AWS DLT page added this and ships two diagrams
(`DltArchitecture`, `DltCicd`). This change reuses that machinery for a third flagship; no
template structure changes are needed beyond registering two new diagram ids.

Source of truth for the J&D build (verified):
- `powerbi-CI-pipelines.yml` — Azure DevOps pipeline on `windows-latest`, `trigger: none`,
  one `Build` stage with **two** jobs:
  - `Build_Datasets` — downloads Tabular Editor portable + Microsoft BPA rules, runs Best
    Practice Analyzer over `.pbidataset`/`.pbism` model definitions.
  - `Build_Reports` — downloads PBI Inspector CLI + report rules, runs them over `.pbir`.
- README — Validation Pipeline (on commit to `dev`) → merge to `main` → Release Pipeline →
  Release Manager approval → Deployment stages, each its own workspace.
- Original drawio — authoring lane (Power BI Desktop + PBIP synced to Azure DevOps Git),
  validation chevrons, merge to `main`, Release Pipeline + approval, Deployment Pipelines
  (Development → Test → Production). It also drew a third "DAX Query Validation" gate that is
  **not** in the shipped YAML.

## Goals / Non-Goals

**Goals:**
- An on-site `/projects/jd-power-bi-cicd` page in the established premium voice.
- Architecture rebuilt as two native, on-brand diagrams (no white-background image), consistent
  with the existing DLT diagram visual language and the site's dark theme.
- Accuracy: diagrams and prose reflect the *shipped* pipeline (public repo).
- Homepage card deep-links into the page instead of leaving the site.

**Non-Goals:**
- No changes to other project pages or to the template's section anatomy.
- Not reproducing the drawio's third DAX gate (absent from the shipped pipeline).
- No interactive/animated diagram beyond the existing reveal-on-scroll; no runtime JS for the
  diagrams themselves.

## Decisions

- **Two diagrams, not one.** Split the single tall drawio into a CI **validation gate**
  (`pbi-validate`) and a CD **release rail** (`pbi-release`). Rationale: matches the AWS page's
  two-diagram pattern, keeps each diagram legible and mobile-safe, and lets the release rail
  reuse `DltCicd`'s env-rail + approval-gate structure almost directly. Confirmed with Tong.

- **`PbiValidate.astro` (Fig 01).** Top: an authoring lane (Power BI Desktop → PBIP files in
  Azure DevOps Git). A downward connector labeled "commit to dev" into a validation track holding
  **two** chevron-style gate cards — "Dataset rules · Tabular Editor BPA" and "Report rules ·
  PBI Inspector" — then a connector "merge to main once green" to a `main` node. Chevron shapes
  echo both the old drawio and our existing chevron connectors. Container-query reflow: lanes
  stack vertically below ~46rem (same approach as `DltCicd`).

- **`PbiRelease.astro` (Fig 02).** Adapt `DltCicd`: `main` → Release Pipeline node → an approval
  lock gate ("Release Manager approval") → a promotion rail of three workspace cards
  Development → Test → Production. Reuse the lock SVG, chevrons, env-card styling, and the
  prod-card gold accent. Each card names a Power BI workspace (Development / Test / Production)
  rather than terraform/S3 steps.

- **Tooling named honestly.** Prose and stack chips name the real tools: Power BI (PBIP), Azure
  DevOps (Repos + Pipelines), Tabular Editor / Best Practice Analyzer, PBI Inspector, Power BI
  Deployment Pipelines, Microsoft Fabric. This is stronger and more credible than the Wix copy.

- **Diagrams render before screenshots.** Both dashboard screenshots stay as image figures in
  the gallery (light plates), continuing the figure numbering after the two native diagrams —
  exactly as the template already orders things.

- **Homepage card.** Change the `timeline.ts` J&D entry from `url` to `slug:
  'jd-power-bi-cicd'`; the GitHub link lives inside the page (`repo` field), matching the AWS,
  Fingrid pattern.

## Risks / Trade-offs

- **Drawio fidelity vs. accuracy.** Dropping the third DAX gate makes the diagram less faithful
  to the old picture but truthful to the shipped pipeline. Accuracy wins for a public repo a
  recruiter could open. If Tong later adds a real DAX-query job, the gate can be added then.
- **Diagram code duplication.** `PbiRelease` overlaps heavily with `DltCicd`. Accepted: small,
  self-contained Astro components are cheaper to copy-and-adapt than to over-abstract into one
  parameterized component, and keeps each page's diagram independently editable.
- **Screenshots are light-on-dark.** Same as Fingrid/AWS — the existing `.pd__plate` matte
  handles white-background images; no new treatment needed.
