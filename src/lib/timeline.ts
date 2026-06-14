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
    body: 'Data Engineer. [DRAFT — awaiting Tong\'s specifics: domain, pipelines built, impact.]',
    tags: ['Azure', 'Databricks', 'Delta Lake'],
    draft: true,
  },
  {
    id: 'postnord',
    index: '02',
    eyebrow: '02 · Logistics',
    title: 'PostNord',
    body: 'Data Engineer. [DRAFT — awaiting Tong\'s specifics.]',
    tags: ['Spark', 'ADF', 'Power BI'],
    draft: true,
  },
  {
    id: 'basware',
    index: '03',
    eyebrow: '03 · Scale',
    title: 'Basware',
    body: 'Data Engineer. [DRAFT — awaiting Tong\'s specifics.]',
    tags: ['Snowflake', 'dbt', 'CI/CD'],
    draft: true,
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
