## Context

The project-detail template (`ProjectDetail.astro`, driven by `PROJECT_DETAILS` in
`src/lib/projects.ts`) already renders native architecture diagrams via a `DIAGRAMS` map keyed by
a typed `ArchitectureDiagramId` union (AWS DLT and J&D each ship two), and already conditionally
renders an optional `modelResults` block that was reserved, unused, for exactly this thesis page.
This change reuses both: one new native diagram id, plus the first real use of `modelResults`.

Source of truth (Tong's 2023 master's thesis, Åbo Akademi University, "Machine Learning for
Forecasting Future Reservations' Ratings — Radisson Blu Seaside in Helsinki", supervisor Prof.
József Mezei), verified from the PDF in `reference/`:

- **Problem.** Forecast, from the data a guest gives at booking (PNR), whether a future
  reservation will rate **below the hotel's own average** so the hotel can intervene before
  arrival and protect its online reputation. Binary target: rating binarized at the **8.4/10**
  threshold (the hotel's general Booking.com rating) — class 0 = below average (the class of
  concern), class 1 = at/above.
- **Data.** Web-scraped from Booking.com (BeautifulSoup + lxml): **5,885** reviews of the
  Radisson Blu Seaside, Helsinki. Reviews in **33 languages**, translated to English
  (langdetect + deep_translator). Missing values dropped; categoricals one-hot encoded
  (`get_dummies`) with dimensionality reduction.
- **Features (PNR).** Country, Room_Type, Nights, Check_In_Month, Travel_Type — 5 features →
  **31** non-empty subsets, each tried as its own feature set.
- **Models.** Logistic Regression, Random Forest, XGBoost, ANN. Each across all 31 subsets,
  each hyperparameter-tuned → **124** models. Best per algorithm (TN-score): LogReg 0.50,
  RF 0.45, XGBoost 0.44, ANN **0.55**.
- **Custom metric — TN-score.** A bespoke metric, not accuracy: prioritize catching true
  negatives (below-average reservations the hotel can still rescue) while penalizing false
  negatives (wasted intervention on guests who'd have rated fine). Accuracy is the wrong
  objective for this imbalanced, cost-asymmetric business problem — designing the metric is the
  thesis's methodological contribution.
- **Best model.** ANN (feature subset Room_Type, Travel_Type, Check_In_Month, Nights;
  hyperparameters batch_size 30, epochs 100, 6 hidden layers, 6 nodes): **TN-score 0.55**,
  true-negative rate **60%** (204 / 338 below-average reservations caught) — but 52% of negative
  predictions were actually positive (high false-negative count).
- **Text analysis (RQ3).** NLTK pipeline (tokenize, lemmatize, stopword removal,
  CountVectorizer) over 2,359 "liked" and 165 "disliked" reviews. Top liked: breakfast, room,
  location, staff, bed. Top disliked: room, breakfast, bed, bathroom, reception. Insight:
  managers should prioritize room cleanliness, bedding comfort, and breakfast quality —
  actionable guidance to pair with a predicted-negative reservation.

## Goals / Non-Goals

**Goals:**
- An on-site `/projects/hotel-rating-forecasting` ML case study in the established premium voice.
- The reserved `modelResults` block as the page's quantitative centerpiece.
- One native, on-brand pipeline diagram (no raw thesis matplotlib charts), consistent with the
  existing diagram visual language and the dark theme.
- An honest result that reads as rigor (custom metric, real trade-off) — not spun as a win.
- Trim and reorder the gallery so the strongest signal leads and there is no duplicate Power BI.

**Non-Goals:**
- No raw thesis figures (plain matplotlib, one with a "Randon Forest" legend typo) shipped on a
  premium page.
- No second diagram or proof gallery — the metrics block plus one diagram carry the page.
- No change to the template's section anatomy beyond making the gallery section conditional.
- No interactive/animated diagram beyond the existing reveal-on-scroll; no runtime JS.

## Decisions

- **Reuse `modelResults`, don't invent UI.** The reserved block (problem / data / features /
  model + a gold metrics row + takeaway) is the natural home for an ML case. Metrics row: `0.55`
  best TN-score (ANN) · `60%` below-average reservations caught · `124` models trained & tuned ·
  `5,885` reviews analysed.

- **One native diagram `MlPipeline.astro` (Fig 01).** A left-to-right (vertical-reflow) flow:
  Booking.com → scrape (BeautifulSoup) → 5,885 reviews / 33 langs translated → preprocess +
  **binarize @ 8.4** → 5 PNR features → a fan to **4 algorithms × 31 subsets = 124 models** →
  **select by TN-score** → best **ANN (0.55)**. Inline SVG/HTML in the site palette; the 124-model
  fan and the gold-accented "best ANN" terminal echo the env-rail / accent patterns in the DLT
  diagrams. Container-query reflow to vertical below ~46rem; no runtime JS.

- **Guard the gallery section.** Wrap the "Inside the pipeline" section in
  `{detail.gallery.length > 0 && (…)}`, mirroring how `modelResults` is already conditional. This
  keeps the ML page (no screenshots) from rendering a lonely empty kicker, and is a harmless
  robustness fix for every page (the three existing pages all have galleries, so they're
  unaffected).

- **Honest reporting, on purpose.** The takeaway states the ~60% recall and the
  precision/recall trade-off plainly, then frames it as the thesis's actual finding — customer
  behaviour resists prediction from PNR alone — and pairs the predictive model with the
  text-analysis insight as the practical deliverable. For a data role this reads as maturity.

- **Stack chips named honestly.** Python, scikit-learn, XGBoost, Keras (the ANN), pandas,
  BeautifulSoup, NLTK — the real toolchain, not a generic "ML" label.

- **Reorder + trim in `timeline.ts`.** AWS DLT #1 (most advanced), Fingrid #2, J&D #3, ML #4;
  drop Heureka; sharpen Fingrid's summary to foreground Azure / ADF so the two grid pipelines
  read as multi-cloud breadth rather than a repeat.

## Risks / Trade-offs

- **No proof screenshots.** Unlike the other three pages, the ML page has no real artifact image.
  Accepted: the raw thesis charts are plain and one has a typo; a native pipeline diagram + a
  strong metrics block + honest prose is more premium and still credible (the repo/thesis exist
  and can be linked). If Tong wants a real artifact later, a cleaned-up chart can be added to the
  (now-conditional) gallery.
- **Two grid pipelines up top.** AWS DLT and Fingrid share the Fingrid API. Mitigated by leading
  with the more advanced one and rewriting Fingrid's card to stress the different cloud/approach;
  the pairing then sells multi-cloud breadth. (Confirmed with Tong.)
- **Honest negative-ish result.** A ~60% recall could read as a weak project to a shallow
  skimmer. Mitigated by foregrounding the *method* (custom metric, 124 tuned models, the text
  deliverable) and framing the result as a genuine finding — the intended signal for a data role.
- **Framework attribution.** The ANN is attributed to Keras based on the thesis's
  Keras-conventional hyperparameter naming (epochs / hidden layers / nodes / batch size); if the
  thesis used another framework the chip is a one-word edit.
