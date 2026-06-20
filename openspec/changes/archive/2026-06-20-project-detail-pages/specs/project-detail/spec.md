## ADDED Requirements

### Requirement: Per-project detail route
Each project that has detail content SHALL have a real, server-rendered page at a stable,
shareable URL `/projects/<slug>`. The page SHALL be deep-linkable and indexable (present in
static HTML, not injected by client JavaScript), and SHALL be reachable directly without
first visiting the homepage.

#### Scenario: Opening a project URL directly
- **WHEN** a recruiter loads `/projects/fingrid-data-platform` directly
- **THEN** the full case-study page renders from server HTML with its title, value line, and content present without requiring client JavaScript

#### Scenario: Sharing a single project
- **WHEN** the URL of one project's page is copied and opened elsewhere
- **THEN** it resolves to that same project's detail page

### Requirement: Reusable premium detail template
Project detail pages SHALL be produced from one reusable template with a fixed section
anatomy: hero (title · one-line value · tech-stack chips · repo link) → context/problem →
architecture (full-bleed diagram with caption) → how it works (a few tight points) →
screenshot gallery → outcome and links. The template SHALL reserve an optional "Model &
Results" block (data → features → model → evaluation/metrics → outcome) that an ML/DS project
page can render and other pages omit. The template SHALL use the site's premium visual
language — the serif identity / Anton machine type duality, gold used sparingly, and the
glass-over-scene treatment — consistent with the existing design tokens.

#### Scenario: Template anatomy is consistent
- **WHEN** a project detail page is rendered from the template
- **THEN** its sections appear in the order hero → context → architecture → how it works → gallery → outcome, using the site's type duality and gold-scarcity rules

#### Scenario: Model & Results block is optional
- **WHEN** a project provides Model & Results data
- **THEN** the page renders that block; **WHEN** a project omits it, the block does not appear and the layout still reads cleanly

### Requirement: Fingrid flagship page
The Fingrid detail page SHALL be authored from the real in-repo assets (the two architecture
diagrams, the two ADF pipeline screenshots, and the grid-cityscape atmosphere imagery) with
prose rewritten for clarity and impact rather than carried over verbatim from the prior site.
It SHALL describe the actual Azure build the assets depict — Azure Data Factory ingestion with
a control table and incremental load, ADLS Gen2 landing, a Databricks Medallion lakehouse with
a gold star schema, Power BI reporting, and Azure DevOps CI/CD across Dev/Test/Prod — and SHALL
surface the project name and one-line value within the first viewport.

#### Scenario: Flagship content is grounded and refined
- **WHEN** the Fingrid page is rendered
- **THEN** it shows the architecture diagram, the ADF pipeline screenshots, and refined prose describing the Azure ingestion → Medallion → Power BI pipeline with its CI/CD flow

#### Scenario: Name and value land fast
- **WHEN** the Fingrid page first paints
- **THEN** the project name and its one-line value are visible in the first viewport

### Requirement: Diagrams and screenshots stay legible
Supplied light-background diagrams and screenshots SHALL be presented in a contained light
plate (not dropped as raw transparent images onto the dark scene) so they remain crisp and
readable, and images SHALL be optimized and lazy-loaded below the fold.

#### Scenario: A light diagram over the dark scene
- **WHEN** the architecture diagram is shown on the dark page
- **THEN** it sits inside a contained light plate that keeps it crisp and legible rather than washing out against the scene

### Requirement: Return to the gallery
A project detail page SHALL provide a clear affordance to return to the homepage Projects
gallery, and browser back navigation SHALL return the recruiter to the gallery.

#### Scenario: Going back to projects
- **WHEN** the recruiter activates the back affordance or the browser back button on a detail page
- **THEN** they return to the homepage Projects gallery

### Requirement: Detail page fallbacks and overflow
Project detail pages SHALL be fully usable under reduced motion, without JavaScript, and on
mobile: all content lives in real HTML, transitions degrade to ordinary navigation, text over
the scene meets at least 4.5:1 contrast, and the page SHALL NOT produce page-level horizontal
overflow at any viewport.

#### Scenario: Reduced motion or no JavaScript
- **WHEN** the page is viewed with `prefers-reduced-motion: reduce` or with JavaScript disabled
- **THEN** all content is present and readable, and navigation to and from the page works as ordinary links without animated transitions

#### Scenario: Mobile width
- **WHEN** the page is viewed at a 390px viewport
- **THEN** content reflows to a single readable column with no page-level horizontal scrolling
