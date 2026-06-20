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
 *   - `dlt`      — the end-to-end data flow (medallion)
 *   - `dlt-cicd` — the CI/CD delivery / promotion rail (dev → test → prod)
 */
export type ArchitectureDiagramId = 'dlt' | 'dlt-cicd';
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
};
