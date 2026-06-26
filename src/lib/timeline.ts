// Single source of truth for all site-body content (below the hero).
// Consumed by the section components on the dark homepage (/).
// Sections: Experience (keyword-per-year) → Projects → Writes → Chatbot → Contact.

/** One year beat in the sticky-stack Experience timeline. Signal-only — never a CV replica. */
export interface YearBeat {
  year: string;        // "2021".."2026"
  keyword: string;     // the single large word that names that year's growth
  role: string;        // role + employer
  stack: string[];     // a few signal technologies
  outcome: string;     // one outcome line (may contain inline <strong>)
}

/** Five beats from the CV — the arc: learn → enter → build → scale → govern at scale. */
export const EXPERIENCE: YearBeat[] = [
  {
    year: '2021',
    keyword: 'Foundations',
    role: "Master's — Åbo Akademi University",
    stack: ['Data Governance', 'GPA 4.5'],
    outcome: 'Governance of Digitalization — where the <strong>data-governance lens</strong> started.',
  },
  {
    year: '2023',
    keyword: 'Liftoff',
    role: 'Data Analyst · Neste',
    stack: ['Azure', 'Snowflake', 'Power BI'],
    outcome: 'Into industry — first <strong>production pipelines</strong> and the dashboards that turned them into decisions.',
  },
  {
    year: '2024',
    keyword: '0 → 1',
    role: 'Analytics Engineer · PostNord',
    stack: ['Databricks', 'Azure Data Factory', 'Power BI'],
    outcome: 'Built the enterprise Power BI platform from scratch — reporting latency under <strong>3 hours</strong>, manual Excel gone.',
  },
  {
    year: '2025',
    keyword: 'Scale',
    role: 'Analytics Engineer · PostNord',
    stack: ['Databricks', 'Streaming', 'Cost tuning'],
    outcome: 'Hardened it — streaming pipelines, performance tuning, and <strong>cost-efficiency</strong> at platform scale.',
  },
  {
    year: '2026',
    keyword: 'Governance at scale',
    role: 'Data Engineer · Basware',
    stack: ['Databricks', 'DABs', 'GitHub Actions'],
    outcome: 'Standardized deployment across <strong>1,000+ pipelines</strong> — shared libraries, DAB templates, CI/CD quality gates.',
  },
];

/** Certifications by name (not exam code) — ride the hero boundary marquee. */
export const CERTS: string[] = [
  'Microsoft Fabric Data Engineer',
  'Azure Data Engineer Associate',
  'Power BI Data Analyst',
  'Snowflake Hands-On Essentials',
];

/** One curated project card in the horizontal gallery. */
export interface Project {
  name: string;
  summary: string;
  stack: string[];
  slug?: string;       // on-site detail page route (/projects/<slug>) where one exists
  url?: string;        // external repo link — only used when there is no detail page
}

/** Four curated projects — quality over quantity, strongest signal first.
 *  AWS DLT and Fingrid both feed off the Fingrid grid API; the summaries deliberately
 *  stress the different cloud/approach so the pair reads as multi-cloud breadth. */
export const PROJECTS: Project[] = [
  {
    name: 'AWS DLT Pipeline',
    summary: 'Terraform-provisioned Databricks on AWS running Delta Live Tables — a self-building medallion under centralized governance.',
    stack: ['Databricks DLT', 'Terraform', 'S3', 'Unity Catalog'],
    slug: 'aws-dlt-pipeline',   // has an on-site case study → links to its detail page
  },
  {
    name: 'Fingrid Data Platform',
    summary: "An Azure / Data Factory lakehouse — metadata-driven ingestion of Finland's grid API into a governed star schema.",
    stack: ['ADF', 'Databricks', 'Delta Lake', 'Power BI'],
    slug: 'fingrid-data-platform',   // has an on-site case study → links to its detail page
  },
  {
    name: 'J&D Power BI CI/CD',
    summary: 'Validation + release pipeline for Power BI — automated quality gates on Microsoft Fabric.',
    stack: ['Azure DevOps', 'Microsoft Fabric', 'Power BI'],
    slug: 'jd-power-bi-cicd',   // has an on-site case study → links to its detail page
  },
  {
    name: 'Forecasting Reservation Ratings',
    summary: "Master's-thesis ML: predict a reservation's rating from booking data, with a purpose-built cost-aware metric.",
    stack: ['Python', 'scikit-learn', 'XGBoost', 'Keras'],
    slug: 'hotel-rating-forecasting',   // has an on-site case study → links to its detail page
  },
];

/** One writing piece. Each write links to its own on-site detail page at /writes/<slug>. */
export interface Write {
  title: string;
  summary: string;
  slug: string;        // on-site detail page route (/writes/<slug>)
}

/** Two engineering-judgment case studies. Extensible — add entries, layout is unchanged. */
export const WRITES: Write[] = [
  {
    title: 'Deleting a Dependency Instead of Duplicating It',
    summary: 'A cleanup ticket that ended in removing an SDK entirely — a 30-second observability test showed the only feature justifying it was observable nowhere.',
    slug: 'deleting-a-dependency',
  },
  {
    title: "Dropping Security Code Because the Threat Didn't Exist",
    summary: 'Cut SQL-escaping defensive code after finding every input comes from typed config models, not users. The threat surface did not exist; the code would have protected nothing.',
    slug: 'dropping-security-code',
  },
];

/** Contact channels + standing — used by the closing Contact section. */
export const CONTACT = {
  email:    'ethan.nie2020@gmail.com',
  linkedin: 'https://www.linkedin.com/in/tong-nie/',
  github:   'https://github.com/Einsuomi',
  standing: 'Helsinki · EU Blue Card · open to Luxembourg',
};
