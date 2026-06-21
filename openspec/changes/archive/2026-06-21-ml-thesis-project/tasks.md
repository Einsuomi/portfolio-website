## 1. Native diagram

- [x] 1.1 Create `src/components/diagrams/MlPipeline.astro` (Fig 01): a left-to-right (vertical-reflow) modelling pipeline — Booking.com → scrape (BeautifulSoup) → 5,885 reviews / 33 languages translated → preprocess + binarize at the 8.4 threshold → 5 PNR features → fan to 4 algorithms × 31 feature subsets (124 tuned models) → select by the custom TN-score → best ANN (TN-score 0.55), the terminal gold-accented. Inline SVG/HTML in the site palette, matched to the DLT/PBI diagram language; container-query reflow to vertical below ~46rem; no runtime JS; no horizontal overflow at 390px.

## 2. Wire the page data

- [x] 2.1 In `src/lib/projects.ts`: extend the `ArchitectureDiagramId` union with `'ml-pipeline'` and update its doc comment.
- [x] 2.2 Add `PROJECT_DETAILS['hotel-rating-forecasting']`: slug, name, value line, stack chips (Python, scikit-learn, XGBoost, Keras, pandas, BeautifulSoup, NLTK), context paragraphs, `architectureDiagrams: [{ id: 'ml-pipeline', … }]`, empty `architecture` and `gallery`, 4 `howItWorks` points (scraping + 33-language translation; binary target at the hotel's own 8.4 rating; 124 models across every feature subset; the bespoke TN-score metric), the `modelResults` block (problem / data / features / model + 4 metrics: 0.55 best TN-score (ANN), 60% below-average reservations caught, 124 models trained & tuned, 5,885 reviews analysed; honest takeaway), and `outcome` paragraphs weaving in the text-analysis insight (prioritize room cleanliness, bedding, breakfast) and the honest finding — all in the established premium voice.
- [x] 2.3 In `src/components/ProjectDetail.astro`: import `MlPipeline` and register it in the `DIAGRAMS` map.

## 3. Template guard + gallery edits

- [x] 3.1 In `src/components/ProjectDetail.astro`: wrap the gallery ("Inside the pipeline") section in `{detail.gallery.length > 0 && (…)}` so a page without gallery figures renders no empty section. Verify `archCount` figure numbering is unaffected for pages that do have galleries.
- [x] 3.2 In `src/lib/timeline.ts` PROJECTS: remove the Heureka Science Centre BI card; reorder to AWS DLT #1, Fingrid #2, J&D Power BI #3; add the ML card #4 with `slug: 'hotel-rating-forecasting'`; sharpen the Fingrid card summary to foreground Azure / ADF so it doesn't echo AWS DLT.

## 4. Verify

- [x] 4.1 `astro check` and `npm run build` pass; the new static route `/projects/hotel-rating-forecasting` is emitted and the three existing project routes still build.
- [x] 4.2 Visually verify in `npm run dev`: the pipeline diagram renders crisp on the dark scene and reflows to vertical at a 390px viewport with no horizontal overflow; the Model & Results metrics row reads well; name + value land in the first viewport; the gallery section does not appear (no empty kicker); the homepage gallery shows the four cards in the new order with no Heureka; the ML card navigates in and the back affordance returns. Check legibility with JS disabled / reduced motion.
- [x] 4.3 `npm run check-leaks` after build; confirm no `/confidential/` markers and no thesis PII leaked into `dist/`.
