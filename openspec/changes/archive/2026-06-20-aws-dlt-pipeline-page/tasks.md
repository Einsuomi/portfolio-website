## 1. Template: native diagram slot

- [x] 1.1 Extend the `ProjectDetail` shape in `src/lib/projects.ts` with an optional native-diagram marker (component slot/discriminator), leaving `architecture: Figure[]` intact and backward-compatible.
- [x] 1.2 Update `src/components/ProjectDetail.astro` to render the native diagram (when present) in a framed plate with a figure note, then render any image figures; image-only pages (Fingrid) render unchanged.

## 2. Native architecture diagram component

- [x] 2.1 Create `src/components/diagrams/DltArchitecture.astro` — one unified left-to-right end-to-end flow as inline SVG/HTML/CSS, real text, no runtime JS: Fingrid API → control-table-driven incremental ingestion → S3 landing → DLT medallion (bronze → silver → gold) → gold star schema → Power BI.
- [x] 2.2 Add a governing band/lane for the platform: Terraform + Databricks Asset Bundles + GitHub Actions across dev/test/prod, Unity Catalog governance.
- [x] 2.3 Style it to the site visual language (glass plate, serif/Anton duality, gold used sparingly) so it sits crisp on the dark scene; ensure single-column reflow with no horizontal overflow at 390px.

## 3. AWS DLT page content

- [x] 3.1 Add `PROJECT_DETAILS['aws-dlt-pipeline']` to `src/lib/projects.ts`: slug, name, one-line value, stack chips (AWS S3, Databricks, Delta Live Tables, Auto Loader, Delta Lake, Unity Catalog, Terraform, Asset Bundles, GitHub Actions, Power BI), repo link.
- [x] 3.2 Write refined `context`, `howItWorks` (metadata-driven ingestion, dynamic DLT generation, Auto CDC/SCD-1, star schema), and `outcome` prose grounded in the actual repo/notebook source — clean story, no Wärtsilä/Bitbucket/template cruft.
- [x] 3.3 Wire the native diagram as the architecture centerpiece; add the two Databricks screenshots (`dlt pipeline.jpg` DLT lineage, `Screenshot ...214307.jpg` job DAG) as captioned gallery proof figures, imported via astro:assets.

## 4. Gallery link

- [x] 4.1 Link the homepage Projects gallery card for this project to `/projects/aws-dlt-pipeline` (in `src/scripts/timeline.ts` or wherever the gallery cards/links are defined).

## 5. CI/CD delivery diagram (added in review)

- [x] 5.1 Generalize the template to render an ordered list of native diagrams (`architectureDiagrams: NativeDiagram[]`), so a page can show more than one; figure numbering and the gallery offset span them.
- [x] 5.2 Create `src/components/diagrams/DltCicd.astro` — a native promotion rail: trigger (push / PR merge) → GitHub Actions (builds the Asset Bundle) → promote across dev → test → prod, each env showing terraform apply + bundle deploy on isolated infra (w_{env} catalog · {env} S3 · workspace), with a manual approval gate before prod. Same visual language; reflows horizontal → stacked.
- [x] 5.3 Trim the data-flow diagram's platform band to a runtime governance footnote (Unity Catalog) so the delivery story lives only in its own diagram.

## 6. Verify

- [x] 5.1 Run `astro check` and `npm run build`; load `/projects/aws-dlt-pipeline` and confirm name + value land in the first viewport, diagram is crisp, screenshots legible.
- [x] 5.2 Confirm the Fingrid page renders identically (no regression), and verify the new page under reduced motion / no-JS and at a 390px viewport (no horizontal overflow).
