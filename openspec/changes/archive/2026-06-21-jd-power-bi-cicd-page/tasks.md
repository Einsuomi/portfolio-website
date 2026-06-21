## 1. Native diagrams

- [x] 1.1 Create `src/components/diagrams/PbiValidate.astro` (Fig 01, CI validation gate): authoring lane (Power BI Desktop → PBIP in Azure DevOps Git) → "commit to dev" connector → two chevron gate cards (Dataset rules · Tabular Editor BPA / Report rules · PBI Inspector) → "merge to main" → `main` node. Inline SVG/HTML in the site palette; container-query reflow to vertical below ~46rem; no runtime JS.
- [x] 1.2 Create `src/components/diagrams/PbiRelease.astro` (Fig 02, CD release rail) by adapting `DltCicd.astro`: `main` → Release Pipeline node → approval lock ("Release Manager approval") → promotion rail Development → Test → Production workspace cards (prod card gold-accented). Reuse the lock SVG, chevrons, env-card styling, reflow behavior.

## 2. Wire the page data

- [x] 2.1 In `src/lib/projects.ts`: extend the `ArchitectureDiagramId` union with `'pbi-validate' | 'pbi-release'`; import the two dashboard screenshots from `src/assets/projects/jd-power-bi-cicd/`.
- [x] 2.2 Add `PROJECT_DETAILS['jd-power-bi-cicd']`: slug, name ("J&D Power BI CI/CD"), value line, stack chips (Power BI · PBIP, Azure DevOps, Tabular Editor BPA, PBI Inspector, Deployment Pipelines, Microsoft Fabric), repo link, context paragraphs, `architectureDiagrams` (the two native ids with alt + caption), the two screenshots as `gallery` figures, 4 `howItWorks` points, and `outcome` — all in the established voice, grounded in the real repo source.
- [x] 2.3 In `src/components/ProjectDetail.astro`: import `PbiValidate` and `PbiRelease` and register them in the `DIAGRAMS` map.

## 3. Homepage gallery link

- [x] 3.1 In `src/lib/timeline.ts`: change the J&D entry from `url: 'https://github.com/...'` to `slug: 'jd-power-bi-cicd'` so the card deep-links into the new page.

## 4. Verify

- [x] 4.1 `astro check` and `npm run build` pass; new static route `/projects/jd-power-bi-cicd` is emitted.
- [x] 4.2 Visually verify in `npm run dev`: both diagrams render crisp on the dark scene, reflow to vertical at a 390px viewport with no horizontal overflow, screenshots sit in plates, figure numbering is continuous, name + value land in the first viewport, and the gallery card navigates in/back. Check legibility with JS disabled / reduced motion.
