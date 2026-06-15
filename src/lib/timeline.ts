// Single source of truth for all homepage copy.
// Both dark (/) and light (/light) routes consume this array.
// Beats are ordered hero → neste → postnord → basware → projects → writes → bot.

export interface Beat {
  id: string;
  index: string;       // "00".."06"
  eyebrow: string;
  title: string;
  body: string;        // may contain inline <strong>
  tags?: string[];
  links?: { label: string; url: string }[];
  draft?: true;
}

export const TIMELINE: Beat[] = [
  {
    id: 'hero',
    index: '00',
    eyebrow: 'Data Engineer & Builder',
    title: 'Tong Nie',
    body: 'I build enterprise data pipelines and the platforms around them — turning raw events into decisions on <strong>Azure, AWS and Databricks</strong>. Three years in, lakehouse-deep, building in public from Western Europe.',
  },
  {
    id: 'neste',
    index: '01',
    eyebrow: '01 · Energy',
    title: 'Neste',
    body: 'Data Analyst. Built Azure pipelines ingesting diverse APIs into <strong>Snowflake</strong>, and shipped the Power BI dashboards that turned them into decisions.',
    tags: ['Azure', 'Snowflake', 'Power BI'],
  },
  {
    id: 'postnord',
    index: '02',
    eyebrow: '02 · Logistics',
    title: 'PostNord',
    body: 'Analytics Engineer. Engineered batch + streaming pipelines on <strong>Databricks</strong> and built the enterprise Power BI platform 0→1 — cutting reporting latency to under 3 hours.',
    tags: ['Databricks', 'Azure Data Factory', 'Power BI'],
  },
  {
    id: 'basware',
    index: '03',
    eyebrow: '03 · Scale',
    title: 'Basware',
    body: 'Data Engineer. Standardized deployment across <strong>1,000+ pipelines</strong> with shared Python libraries and Databricks Asset Bundles — governance and quality gates baked into CI/CD.',
    tags: ['Databricks', 'DABs', 'GitHub Actions'],
  },
  {
    id: 'projects',
    index: '04',
    eyebrow: '04 · Built',
    title: 'Projects',
    body: 'Two enterprise data-engineering pipelines, three Power BI products, twelve Python ML notebooks.',
    links: [
      { label: 'Fingrid Azure Pipeline', url: 'https://github.com/Einsuomi/Data_Engineering_Fingrid' },
      { label: 'AWS DLT Pipeline',       url: 'https://github.com/Einsuomi/AWS-data-engineering-demo' },
      { label: 'J&D Power BI CI/CD',     url: 'https://github.com/Einsuomi/J-D-Power-BI-CI-CD' },
      { label: 'Python / ML',            url: 'https://github.com/Einsuomi/Python' },
    ],
  },
  {
    id: 'writes',
    index: '05',
    eyebrow: '05 · Written down',
    title: 'Writes',
    body: 'Decisions, in prose.',
    links: [
      { label: 'Deleting a Dependency Instead of Duplicating It',             url: '#' },
      { label: 'Dropping Security Code Because the Threat Didn\'t Exist',     url: '#' },
    ],
  },
  {
    id: 'bot',
    index: '06',
    eyebrow: '06 · Ask me anything',
    title: 'Talk to me',
    body: 'Ask about my pipelines, my stack, my decisions.',
    draft: true,
  },
];

// Shared contact links used in both routes and the layout.
export const CONTACT = {
  email:    'ethan.nie2020@gmail.com',
  linkedin: 'https://www.linkedin.com/in/tong-nie/',
  github:   'https://github.com/Einsuomi',
};
