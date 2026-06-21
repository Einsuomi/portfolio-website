## Why

The projects gallery is all data-engineering: two grid-API lakehouses (AWS DLT, Fingrid) and a
Power BI CI/CD build. It has no machine-learning / data-science signal, and it carries a weak
fourth card — **Heureka Science Centre BI** — that is a second Power BI project, card-only (no
case study), and an *analyst* result ("20% YoY insight") rather than an engineering one. Tong's
2023 Åbo Akademi master's thesis — **Machine Learning for Forecasting Future Reservations'
Ratings** (Radisson Blu Seaside, Helsinki) — is the missing dimension: a real, end-to-end ML
study with a bespoke evaluation metric and an honestly-reported result. Promoting it to the
fourth slot rounds the arc to *DE platforms → BI delivery → ML*, and the `modelResults` block in
`projects.ts` was reserved for exactly this page.

## What Changes

- Add a new project detail page at `/projects/hotel-rating-forecasting`, authored from the
  thesis: predict, **at booking time**, which reservations will rate below the hotel's own
  average (the 8.4/10 Booking.com rating, used as the binary threshold) so the hotel can act
  before the guest arrives — plus a parallel text-analysis of reviews that tells managers *what*
  to fix.
- Build the architecture as **one new native, on-brand diagram** (`ml-pipeline`) following the
  established `DltArchitecture` / `PbiValidate` pattern (inline SVG/HTML/CSS, real text, no
  runtime JS): Booking.com scrape → preprocess + binarize at 8.4 → 5 PNR features → 4 algorithms
  × 31 feature subsets (124 tuned models) → selection by the custom **TN-score** → best ANN.
- Use the reserved `modelResults` block as the page's centerpiece — problem / data / features /
  model, four headline metrics (best TN-score 0.55 · 60% of below-average reservations caught ·
  124 models trained & tuned · 5,885 reviews analysed), and an honest takeaway.
- Report the result **honestly**: ~60% recall on the negative class, with a real precision/recall
  trade-off — catching more true negatives also raised false negatives, because customer
  behaviour is hard to predict from PNR alone. This reads as research maturity, not failure.
- In `src/lib/timeline.ts` PROJECTS: **remove** the Heureka card; **reorder** to AWS DLT #1,
  Fingrid #2, J&D Power BI #3, ML thesis #4; **add** the new ML card with its `slug`; and
  **sharpen** the Fingrid summary to emphasize Azure / ADF so it no longer echoes AWS DLT.
- Add a small template guard in `ProjectDetail.astro` so the "Gallery" section is skipped when a
  page has no gallery figures (the ML page has no premium proof screenshots; the raw thesis
  matplotlib charts are too plain — and one carries a typo — to ship on a premium page).

## Capabilities

### New Capabilities
<!-- None — reuses the existing project-detail template, its native-diagram capability, and the
     reserved modelResults block. -->

### Modified Capabilities
- `project-detail`: add the ML thesis page as the fourth flagship — a machine-learning case
  study carried by the reserved Model & Results block and one native pipeline diagram; make the
  gallery section conditional so an ML page without proof screenshots renders cleanly.

## Impact

- `src/lib/projects.ts` — new `PROJECT_DETAILS['hotel-rating-forecasting']` entry; extend the
  `ArchitectureDiagramId` union with `'ml-pipeline'`.
- `src/components/diagrams/MlPipeline.astro` — new native diagram (inline SVG/HTML), matched to
  the existing diagram visual language.
- `src/components/ProjectDetail.astro` — register `MlPipeline` in the `DIAGRAMS` map; guard the
  gallery section so it renders only when `gallery.length > 0` (no other structure change).
- `src/lib/timeline.ts` — remove the Heureka entry, reorder the four cards, add the ML card with
  `slug: 'hotel-rating-forecasting'`, sharpen the Fingrid summary.
- No new assets (fully native), no new runtime dependencies; static HTML only.
