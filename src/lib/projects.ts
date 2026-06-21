// Detail-page content for project case studies (the /projects/<slug> routes).
// Hardcoded in-repo (not the wiki sync pipeline): refined prose + real assets.
// The gallery cards live in timeline.ts; this is the deep content behind them.
import type { ImageMetadata } from 'astro';

// Fingrid assets — imported so astro:assets can optimize them.
import archPipeline from '../assets/projects/fingrid-data-platform/architecture-pipeline.png';
import archCicd from '../assets/projects/fingrid-data-platform/architecture-cicd.png';
import adfLookup from '../assets/projects/fingrid-data-platform/adf-lookup-foreach.jpg';
import adfIncremental from '../assets/projects/fingrid-data-platform/adf-incremental-load.jpg';

// AWS DLT pipeline assets — two real Databricks UI screenshots kept as proof
// (the architecture diagram itself is rebuilt natively, see DltArchitecture).
import dltJobDag from '../assets/projects/aws-dlt-pipeline/job-task-dag.jpg';
import dltLineage from '../assets/projects/aws-dlt-pipeline/dlt-lineage-graph.jpg';

// J&D Power BI CI/CD assets — the two real Power BI dashboard screenshots, kept
// as proof figures (the architecture itself is rebuilt natively, see PbiValidate
// and PbiRelease).
import jdOverview from '../assets/projects/jd-power-bi-cicd/Screenshot 2025-07-27 201111.jpg';
import jdCustomers from '../assets/projects/jd-power-bi-cicd/Screenshot 2025-07-27 202244.jpg';

/** An image with a caption — used for both diagrams and screenshots. */
export interface Figure {
  image: ImageMetadata;
  alt: string;
  caption: string;
}

/** One titled point in the "How it works" list. */
export interface Point {
  title: string;
  body: string;
}

/**
 * A native, on-brand architecture diagram rendered as inline HTML/SVG (real text,
 * no runtime JS) instead of a supplied image. `id` selects which diagram component
 * the template renders; `alt`/`caption` give it the same figure note as an image.
 * Pages render these native diagrams (in order) before any image `architecture`
 * figures; image-only pages (Fingrid) leave the list undefined and are unaffected.
 *   - `dlt`          — the end-to-end data flow (medallion)
 *   - `dlt-cicd`     — the CI/CD delivery / promotion rail (dev → test → prod)
 *   - `pbi-validate` — the Power BI CI validation gate (BPA + PBI Inspector)
 *   - `pbi-release`  — the Power BI CD release rail (dev → test → prod workspaces)
 *   - `ml-pipeline`  — the ML modelling flow (scrape → prepare → 124 models → act)
 */
export type ArchitectureDiagramId =
  | 'dlt'
  | 'dlt-cicd'
  | 'pbi-validate'
  | 'pbi-release'
  | 'ml-pipeline';
export interface NativeDiagram {
  id: ArchitectureDiagramId;
  alt: string;
  caption: string;
}

/**
 * Optional ML/DS block — reserved for the future thesis page. A detail page that
 * provides it renders the block; every other page omits it. Wired, unused today.
 */
export interface ModelResults {
  problem: string;
  data: string;
  features: string;
  model: string;
  metrics: { label: string; value: string }[];
  takeaway: string;
}

/** A full project case study rendered by the reusable detail template. */
export interface ProjectDetail {
  slug: string;
  name: string;           // the page wordmark
  value: string;          // one-line value, lands in the first viewport
  stack: string[];
  repo?: string;
  context: string[];      // problem / framing paragraphs
  architectureDiagrams?: NativeDiagram[]; // optional native HTML/SVG diagrams, rendered first
  architecture: Figure[]; // the full-bleed diagram images (Fingrid uses these)
  howItWorks: Point[];    // a few tight points
  gallery: Figure[];      // proof screenshots
  outcome: string[];      // closing paragraphs
  modelResults?: ModelResults;
}

export const PROJECT_DETAILS: Record<string, ProjectDetail> = {
  'fingrid-data-platform': {
    slug: 'fingrid-data-platform',
    name: 'Fingrid Data Platform',
    value:
      "An end-to-end Azure lakehouse that turns Finland's national power-grid API into governed, analytics-ready data — built declaratively, shipped through CI/CD.",
    stack: [
      'Azure Data Factory',
      'ADLS Gen2',
      'Databricks',
      'Delta Lake',
      'Power BI',
      'Azure DevOps',
    ],
    repo: 'https://github.com/Einsuomi/Data_Engineering_Fingrid',
    context: [
      'Fingrid — the operator of Finland’s national power grid — publishes live grid and energy-market data through an open API. Raw, high-frequency, and time-series by nature, it is a long way from something an analyst can trust.',
      'I built a cloud-native platform that ingests that API, governs it, and models it into a single source of truth for reporting — with no manual steps and full reproducibility across environments.',
    ],
    architecture: [
      {
        image: archPipeline,
        alt: 'End-to-end architecture: Fingrid API through Azure Data Factory and a control table into ADLS Gen2, refined by a Databricks Medallion pipeline into a star schema for Power BI.',
        caption:
          'End-to-end flow. A control table in Azure Data Factory drives incremental, configurable-batch ingestion from the Fingrid API into an ADLS Gen2 landing zone; a Databricks Medallion pipeline then refines bronze → silver → gold into a star schema for Power BI.',
      },
      {
        image: archCicd,
        alt: 'CI/CD: GitHub feature branches build through an Azure DevOps release pipeline and deploy the Data Factory across Dev, Test and Production environments.',
        caption:
          'CI/CD. Feature branches merge to main in GitHub; an Azure DevOps release pipeline builds and promotes the Data Factory across isolated Dev, Test, and Production environments.',
      },
    ],
    howItWorks: [
      {
        title: 'Metadata-driven ingestion',
        body: 'A single control table holds the state and parameters for every source, so one parameterized pipeline ingests every endpoint at a configurable batch size — instead of a brittle pipeline per source.',
      },
      {
        title: 'Incremental by watermark',
        body: 'Each run reads the last-loaded window from the control table, copies only the new slice in an Until loop, then writes the refreshed timestamp back — so loads stay cheap and idempotent.',
      },
      {
        title: 'Medallion lakehouse on Delta',
        body: 'Bronze (raw) → silver (validated) → gold (business-ready) on Delta Lake, with ACID transactions and schema enforcement, ending in a gold star schema as the single source of truth.',
      },
      {
        title: 'Governed and reproducible',
        body: 'Unity Catalog governs access and lineage, and the whole platform deploys declaratively, promoted through CI/CD across Dev, Test, and Production.',
      },
    ],
    gallery: [
      {
        image: adfLookup,
        alt: 'Azure Data Factory pipeline: a Lookup activity feeds a ForEach that fans out the copy.',
        caption:
          'Metadata-driven orchestration: a Lookup reads the load parameters, then a ForEach fans the copy out across every configured endpoint.',
      },
      {
        image: adfIncremental,
        alt: 'Azure Data Factory incremental-load pipeline with set-variable activities, an Until loop, and a notebook step.',
        caption:
          'Incremental load: variables set the time window from the Fingrid API, an Until loop copies data incrementally, and a notebook updates the last-refresh timestamp.',
      },
    ],
    outcome: [
      'The result is a hands-off platform: new grid data lands, is validated, and reaches Power BI without anyone touching it — governed end to end and reproducible across every environment.',
    ],
  },

  'aws-dlt-pipeline': {
    slug: 'aws-dlt-pipeline',
    name: 'AWS DLT Pipeline',
    value:
      "A metadata-driven AWS lakehouse: Finland's open grid API, ingested incrementally and refined by Databricks Delta Live Tables into a governed star schema — provisioned by Terraform, shipped through CI/CD.",
    stack: [
      'AWS S3',
      'Databricks',
      'Delta Live Tables',
      'Auto Loader',
      'Delta Lake',
      'Unity Catalog',
      'Terraform',
      'Asset Bundles',
      'GitHub Actions',
      'Power BI',
    ],
    repo: 'https://github.com/Einsuomi/AWS-data-engineering-demo',
    context: [
      "Fingrid — the operator of Finland's national power grid — streams electricity consumption and wind- and solar-generation data through an open REST API. It is high-frequency, time-series, and paginated: useful only once it is ingested reliably, modeled cleanly, and governed.",
      'I built a cloud-native lakehouse on AWS that does exactly that — and does it declaratively. Adding a new dataset is a row of configuration, not a new pipeline; every environment is provisioned and deployed the same way, from code.',
    ],
    architectureDiagrams: [
      {
        id: 'dlt',
        alt: 'Data architecture: the Fingrid API is ingested incrementally into an S3 landing zone, refined by a Databricks Delta Live Tables medallion (bronze, silver, gold) into a gold star schema for Power BI, governed throughout by Unity Catalog.',
        caption:
          'The data flow. A control table drives incremental ingestion from the Fingrid API into an S3 landing zone; a Delta Live Tables medallion refines bronze → silver → gold with Auto Loader and Auto CDC into a governed star schema for Power BI.',
      },
      {
        id: 'dlt-cicd',
        alt: 'CI/CD promotion: a push or pull-request merge triggers GitHub Actions to build a Databricks Asset Bundle, which is promoted across dev, test and prod — each an isolated environment with its own Terraform-provisioned S3 and Unity Catalog — with a manual approval gate before production.',
        caption:
          'The delivery. A push or merged PR triggers GitHub Actions, which builds a Databricks Asset Bundle and promotes it across three isolated environments — Terraform provisions each one’s S3 and Unity Catalog, the bundle deploys the job and DLT pipeline, and a manual approval gates production.',
      },
    ],
    architecture: [],
    howItWorks: [
      {
        title: 'Metadata-driven ingestion',
        body: 'A control table holds each source — its id, watermark, and batch size. One job reads the active rows, fans out with a for-each, and pulls only each dataset’s new window from the API (paginated, with rate-limit retries), landing raw JSON on S3.',
      },
      {
        title: 'A medallion that builds itself',
        body: 'The Delta Live Tables pipeline generates its tables from config: a bronze table per dataset via Auto Loader, then a silver layer that routes each dataset to its own cleansing logic. Add a dataset and the graph grows — no new code.',
      },
      {
        title: 'Auto CDC into a star schema',
        body: 'Intermediate DLT views join the cleaned streams to conformed date and time dimensions, then Auto CDC flows apply SCD-1 upserts into the gold facts and dimensions — fact_consumption and fact_generation_forecast, ready for BI.',
      },
      {
        title: 'Governed, multi-env, from code',
        body: 'Terraform provisions the S3 lake; Databricks Asset Bundles package the job and pipeline; GitHub Actions promote them across dev, test, and prod — each an isolated Unity Catalog, so governance and lineage are centralized, not bolted on.',
      },
    ],
    gallery: [
      {
        image: dltJobDag,
        alt: 'Databricks job graph: a configuration task, a lookup task, a for-each loop running source-to-landing, then the ETL pipeline.',
        caption:
          'The orchestration job. A configuration step seeds the control table, a lookup reads the active datasets, a for-each fans the API pulls out across them, and the final task triggers the DLT pipeline.',
      },
      {
        image: dltLineage,
        alt: 'Databricks Delta Live Tables lineage graph: silver streaming tables and dimension views feeding pre-fact views into gold fact and dimension tables.',
        caption:
          'The DLT lineage graph. Per-dataset silver tables and conformed dimensions flow through pre-fact views into the gold fact and dimension tables — the medallion, materialized.',
      },
    ],
    outcome: [
      'The result is a hands-off, config-driven lakehouse: a new Fingrid dataset is one row in a control table, and it flows — ingested incrementally, refined through bronze, silver, and gold, and modeled into the star schema — all the way to Power BI, governed end to end and reproducible across every environment.',
    ],
  },

  'jd-power-bi-cicd': {
    slug: 'jd-power-bi-cicd',
    name: 'J&D Power BI CI/CD',
    value:
      'CI/CD for a Power BI report — the .pbip project version-controlled, automatically quality-gated, and promoted dev → test → prod behind an approval. Software engineering discipline, applied to BI.',
    stack: [
      'Power BI (PBIP)',
      'Azure DevOps',
      'Azure Pipelines',
      'Tabular Editor · BPA',
      'PBI Inspector',
      'Deployment Pipelines',
      'Microsoft Fabric',
      'DAX',
    ],
    repo: 'https://github.com/Einsuomi/J-D-Power-BI-CI-CD',
    context: [
      'Most Power BI lives as clickops: a .pbix binary passed around and edited live in a workspace, with no version history and no quality gate. A broken measure or a sloppy model reaches production before anyone notices — and there is no clean way to review, roll back, or reproduce a change.',
      'I rebuilt the J&D sales report’s delivery the way software ships. The report is source-controlled as a .pbip project, every change is automatically validated against model and report best practices, and it is promoted through isolated environments behind a human approval — reviewable, reproducible, and safe to release.',
    ],
    architectureDiagrams: [
      {
        id: 'pbi-validate',
        alt: 'CI validation gate: the report is authored in Power BI Desktop as a .pbip project and committed to Azure DevOps Git; a commit to the dev branch triggers a validation pipeline with two gates — dataset and model rules via Tabular Editor Best Practice Analyzer, and report rules via PBI Inspector — and the pull request can only merge to main once both pass.',
        caption:
          'The validation gate. The report is authored as a .pbip project in Azure DevOps Git; a commit to dev runs the validation pipeline — Tabular Editor’s Best Practice Analyzer on the model, PBI Inspector on the report — and only a green run lets the change merge to main.',
      },
      {
        id: 'pbi-release',
        alt: 'CD release rail: from main, a release pipeline using Power BI Deployment Pipelines promotes the report across three isolated workspaces — Development, then Test, then Production — with a Release Manager approval gating the step into production.',
        caption:
          'The release rail. From main, Power BI Deployment Pipelines promote the report across isolated Development, Test, and Production workspaces — with a Release Manager approval gating the step into production.',
      },
    ],
    architecture: [],
    howItWorks: [
      {
        title: 'Report as code',
        body: 'Saved in the .pbip format, the report’s model and pages are plain-text files — so they branch, diff, and pull-request in Azure DevOps Git like any other code, instead of living as an opaque .pbix binary.',
      },
      {
        title: 'Automated quality gates',
        body: 'Every commit to dev runs a validation pipeline: Tabular Editor’s Best Practice Analyzer checks the model and measures, PBI Inspector checks the report pages. A pull request can’t merge to main until both gates are green.',
      },
      {
        title: 'Promoted, not republished',
        body: 'Once on main, Power BI Deployment Pipelines promote the same report through isolated Development, Test, and Production workspaces — so changes are tested in a production-like setting before anyone sees them live.',
      },
      {
        title: 'A human before production',
        body: 'The step into Production is gated by a Release Manager approval — deliberate oversight and compliance before a change goes live, not an automatic push.',
      },
    ],
    gallery: [
      {
        image: jdOverview,
        alt: 'Power BI Overview page: revenue, orders, profit and return-rate KPIs, a revenue trend against target, orders by category, and the top subcategories by orders and return rate.',
        caption:
          'The Overview page — headline KPIs, a revenue trend against target, and the top subcategories by orders and return rate. Hidden slicers and drill-through keep it clean while staying explorable.',
      },
      {
        image: jdCustomers,
        alt: 'Power BI Customer Details page: total customers and revenue-per-customer KPIs, orders by income and occupation, a top-100-customers table, and the top customer by revenue.',
        caption:
          'The Customer Details page — switchable KPIs, top customers by segment, and a no-purchase cohort that surfaces re-engagement opportunities.',
      },
    ],
    outcome: [
      'The result is a Power BI report you can trust like code: every change is versioned, automatically checked against model and report best practices, and promoted to production only after it passes validation and a person signs off — no more editing live in the workspace and hoping nothing breaks.',
    ],
  },

  'hotel-rating-forecasting': {
    slug: 'hotel-rating-forecasting',
    name: 'Forecasting Reservation Ratings',
    value:
      "A machine-learning early-warning model: predict, from what a guest gives at booking, which reservations will rate below a hotel's average — so the hotel can fix the stay before the review is ever written.",
    stack: [
      'Python',
      'scikit-learn',
      'XGBoost',
      'Keras',
      'pandas',
      'BeautifulSoup',
      'NLTK',
    ],
    context: [
      "A hotel's online rating is its reputation, and a single below-average review drags it down. But by the time a low rating is posted, it is already too late to act. My master's thesis (Åbo Akademi University, 2023) asked whether that low rating could be seen coming — predicted from the only thing known before the stay: the data a guest gives when they book.",
      'The target hotel is the Radisson Blu Seaside in Helsinki. The idea is an early-warning model: flag a reservation likely to rate below the hotel’s own average, while the guest can still be moved to a better room or have a problem pre-empted — and pair it with a review analysis that tells managers exactly what tends to go wrong.',
    ],
    architectureDiagrams: [
      {
        id: 'ml-pipeline',
        alt: 'The modelling pipeline: Booking.com reviews are scraped and translated, the rating is binarized at the hotel’s 8.4 average with five booking-time features, 124 models (four algorithms across 31 feature subsets) are trained and ranked by a custom TN-score with an ANN winning at 0.55, and a flagged below-average reservation is acted on before arrival, guided by an NLTK review analysis.',
        caption:
          'The pipeline. 5,885 Booking.com reviews are scraped and translated, the rating is split at the hotel’s own 8.4 average, and 124 tuned models — four algorithms across every feature subset — are ranked by a purpose-built TN-score. The winning ANN feeds an act-before-arrival loop, with a parallel NLTK analysis naming what to fix.',
      },
    ],
    architecture: [],
    howItWorks: [
      {
        title: 'Scrape and normalize',
        body: 'A BeautifulSoup scraper collects 5,885 public reviews of the hotel from Booking.com. The reviews span 33 languages, so a translation step folds them all into English before any analysis — a clean, comparable corpus from a messy public source.',
      },
      {
        title: 'A target the business cares about',
        body: 'The 0–10 rating is binarized at 8.4 — the hotel’s own average — so the model predicts a single, decision-ready class: will this reservation drag the average down? Five booking-time fields (country, room type, nights, check-in month, travel type) are the only predictors, because they are all that is known in advance.',
      },
      {
        title: '124 models, not one',
        body: 'Four algorithms — logistic regression, random forest, XGBoost, and a neural network — are each trained across all 31 feature subsets and hyperparameter-tuned: 124 models in total, compared on equal footing to find which signal and which method actually carry the prediction.',
      },
      {
        title: 'A metric built for the cost',
        body: 'Accuracy is the wrong objective here: the classes are imbalanced and the costs are asymmetric. So I designed TN-score — it rewards catching genuine below-average reservations while penalizing false alarms, because a missed warning and a wasted intervention cost the hotel very different things.',
      },
    ],
    gallery: [],
    modelResults: {
      problem:
        "Predict, at booking time, whether a future reservation will rate below the hotel's 8.4 average — a binary, cost-asymmetric classification on data known before the guest arrives.",
      data:
        '5,885 Booking.com reviews of the Radisson Blu Seaside, Helsinki, scraped with BeautifulSoup and translated from 33 languages to English; missing rows dropped, categoricals one-hot encoded.',
      features:
        'Five PNR (booking-record) fields — country, room type, nights, check-in month, travel type — searched across all 31 non-empty subsets.',
      model:
        'Logistic regression, random forest, XGBoost, and a Keras ANN, each tuned across every feature subset (124 models) and ranked by a custom TN-score. A 6-layer ANN on {room type, travel type, check-in month, nights} won.',
      metrics: [
        { label: 'Best TN-score (ANN)', value: '0.55' },
        { label: 'Below-average reservations caught', value: '60%' },
        { label: 'Models trained & tuned', value: '124' },
        { label: 'Reviews scraped & analysed', value: '5,885' },
      ],
      takeaway:
        'The best model caught 60% of below-average reservations — but catching more of them also raised false alarms, so its precision stayed near 50%. The honest finding: booking-time data alone does not reliably predict a guest’s eventual rating, because satisfaction is shaped by what happens during the stay. The contribution is the framing and the method — a decision-ready target, a custom cost-aware metric, and an exhaustive, honestly-reported model search.',
    },
    outcome: [
      'Alongside the predictive model, an NLTK text analysis of the reviews gives managers the other half of the answer: across thousands of comments, the recurring complaints cluster on room cleanliness, bedding comfort, and breakfast — concrete levers to pull when a reservation is flagged, or simply to raise the baseline.',
      'The thesis lands on a mature conclusion rather than an inflated one: it maps a real problem end to end, builds the data and the metric to fit the business cost, and reports a result that says as much about the limits of the data as the power of the model — the judgment a data role actually runs on.',
    ],
  },
};
