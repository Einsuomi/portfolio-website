// Detail-page content for project case studies (the /projects/<slug> routes).
// Hardcoded in-repo (not the wiki sync pipeline): refined prose + real assets.
// The gallery cards live in timeline.ts; this is the deep content behind them.
import type { ImageMetadata } from 'astro';

// Fingrid assets — imported so astro:assets can optimize them.
import archPipeline from '../assets/projects/fingrid-data-platform/architecture-pipeline.png';
import archCicd from '../assets/projects/fingrid-data-platform/architecture-cicd.png';
import adfLookup from '../assets/projects/fingrid-data-platform/adf-lookup-foreach.jpg';
import adfIncremental from '../assets/projects/fingrid-data-platform/adf-incremental-load.jpg';

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
  architecture: Figure[]; // the full-bleed diagrams
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
};
