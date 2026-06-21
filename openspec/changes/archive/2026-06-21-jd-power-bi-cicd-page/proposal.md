## Why

Tong's "J&D Report With CI/CD" project is a distinct flagship: it isn't another data
pipeline, it's **software-engineering discipline applied to BI** — a Power BI report
version-controlled as `.pbip`, automatically quality-gated, and promoted dev → test → prod
with a human approval. Today the homepage card dead-ends at a default-template GitHub repo,
and the original Wix write-up leans on a single white-background drawio export that clashes
with the site's dark, premium world. It deserves an on-site case study whose centerpiece —
the CI/CD architecture — is rebuilt as native, on-brand diagrams.

## What Changes

- Add a new project detail page at `/projects/jd-power-bi-cicd`, authored from the real repo
  source (the `powerbi-CI-pipelines.yml` pipeline, the PBIP project, the BPA/PBI-Inspector
  rule files) rather than the thin Wix copy — Power BI Desktop authoring → PBIP in Azure DevOps
  Git → automated validation on commit → Release Pipeline with approval → Deployment Pipelines
  across Development/Test/Production workspaces.
- Rebuild the architecture as **two native, on-brand diagrams** (inline SVG/HTML/CSS, real
  text, no runtime JS), reusing the native-diagram capability the AWS DLT page already added:
  a **validation gate** diagram (CI) and a **release rail** diagram (CD). The original
  white-background drawio image is *not* carried over.
- Ground the validation diagram in the *actual* shipped pipeline — two gates: dataset/model
  rules via **Tabular Editor** Best Practice Analyzer, and report rules via **PBI Inspector**.
  The old diagram's third "DAX query" gate is not in the shipped YAML and is omitted for
  accuracy (the repo is public).
- Include both Power BI dashboard screenshots (Overview, Customer Details) as proof figures in
  the gallery, matted in the existing dark plates.
- Rewrite the copy in the site's established voice (sharp value line, problem framing, tight
  "how it works" points, outcome).
- Flip the homepage Projects gallery card from an external GitHub link to a deep link into the
  new page (the repo link moves inside the page).

## Capabilities

### New Capabilities
<!-- None — reuses the existing project-detail template and its native-diagram capability. -->

### Modified Capabilities
- `project-detail`: add the J&D Power BI CI/CD page as a third authored flagship, grounded in
  its real repo source, with its architecture carried by two native on-brand diagrams (a CI
  validation gate and a CD release rail).

## Impact

- `src/lib/projects.ts` — new `PROJECT_DETAILS['jd-power-bi-cicd']` entry; extend the
  `ArchitectureDiagramId` union with the two new diagram ids.
- `src/components/ProjectDetail.astro` — register the two new diagram components in the
  `DIAGRAMS` map (no template structure change).
- New components `src/components/diagrams/PbiValidate.astro` and `.../PbiRelease.astro` —
  inline SVG/HTML, matched visual language with the existing DLT diagrams (the release rail
  adapts the `DltCicd` env-rail + approval-gate pattern).
- `src/lib/timeline.ts` — change the J&D gallery card from `url` to `slug: 'jd-power-bi-cicd'`.
- `src/assets/projects/jd-power-bi-cicd/` — the two existing dashboard screenshots, imported
  for `astro:assets`.
- No new runtime dependencies; static HTML only.
