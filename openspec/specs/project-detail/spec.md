# Project Detail

## Purpose

Per-project detail pages — shareable `/projects/<slug>` case-study routes rendered from one
reusable premium template, so an interested recruiter can go deep on a project on-site rather
than dead-ending at an external repo.

## Requirements

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
glass-over-scene treatment — consistent with the existing design tokens. The hero band SHALL
ride the same continuous scene as the rest of the site (no project-specific backdrop image),
for one consistent world.

#### Scenario: Template anatomy is consistent
- **WHEN** a project detail page is rendered from the template
- **THEN** its sections appear in the order hero → context → architecture → how it works → gallery → outcome, using the site's type duality and gold-scarcity rules

#### Scenario: Model & Results block is optional
- **WHEN** a project provides Model & Results data
- **THEN** the page renders that block; **WHEN** a project omits it, the block does not appear and the layout still reads cleanly

### Requirement: Fingrid flagship page
The Fingrid detail page SHALL be authored from the real in-repo assets (the two architecture
diagrams and the two ADF pipeline screenshots) with prose rewritten for clarity and impact
rather than carried over verbatim from the prior site. It SHALL describe the actual Azure build
the assets depict — Azure Data Factory ingestion with a control table and incremental load,
ADLS Gen2 landing, a Databricks Medallion lakehouse with a gold star schema, Power BI reporting,
and Azure DevOps CI/CD across Dev/Test/Prod — and SHALL surface the project name and one-line
value within the first viewport.

#### Scenario: Flagship content is grounded and refined
- **WHEN** the Fingrid page is rendered
- **THEN** it shows the architecture diagrams, the ADF pipeline screenshots, and refined prose describing the Azure ingestion → Medallion → Power BI pipeline with its CI/CD flow

#### Scenario: Name and value land fast
- **WHEN** the Fingrid page first paints
- **THEN** the project name and its one-line value are visible in the first viewport

### Requirement: Diagrams and screenshots stay legible
Supplied diagrams and screenshots SHALL be presented in a framed panel rather than dropped raw
onto the dark scene (they carry solid light backgrounds with dark text baked in), so they stay
crisp and legible as contained screens; their captions SHALL be presented as editorial figure
notes on the scene — a mono figure label plus a serif description — not as plain UI body text.
Images SHALL be optimized and lazy-loaded below the fold.

#### Scenario: A light diagram on the dark page
- **WHEN** an architecture diagram is shown on the dark page
- **THEN** it sits in a framed panel that keeps it crisp and legible rather than washing into the scene, with its caption as a figure note below

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

### Requirement: Native architecture diagram
The detail template SHALL support rendering a project's architecture as one or more native,
on-brand diagrams built from inline SVG/HTML/CSS (real selectable text, no runtime JavaScript)
in place of, or alongside, supplied diagram images. Native diagrams SHALL render in order before
any image figures, each SHALL sit in the same framed plate treatment as image figures, SHALL
carry an editorial figure note (mono label + serif description) like other figures, SHALL stay
crisp at any zoom, and SHALL remain present and legible with JavaScript disabled and under
reduced motion. Projects that supply only image figures (e.g. Fingrid) SHALL be unaffected and
continue to render those images.

#### Scenario: A project renders a native diagram
- **WHEN** a project's detail page supplies a native architecture diagram
- **THEN** the architecture section renders it as crisp inline HTML/SVG in a framed plate with a figure note, present without client JavaScript

#### Scenario: Existing image-figure pages unchanged
- **WHEN** a project (e.g. Fingrid) supplies only architecture images
- **THEN** the page still renders those images in framed plates exactly as before, with no native diagram

#### Scenario: Native diagram under reduced motion or no JS
- **WHEN** the page is viewed with `prefers-reduced-motion: reduce` or JavaScript disabled
- **THEN** the native diagram is fully present and legible as static HTML/SVG with no horizontal overflow at a 390px viewport

### Requirement: AWS DLT pipeline page
There SHALL be a project detail page at `/projects/aws-dlt-pipeline` for the AWS Databricks DLT
lakehouse build, authored from the real in-repo assets and the actual repository/notebook
source rather than carried over verbatim. It SHALL describe the actual build the assets and code
depict — metadata-driven incremental ingestion from Fingrid's open API (a control table driving
a per-dataset loop) into an S3 landing zone, a Databricks Delta Live Tables medallion pipeline
(bronze → silver → gold) using Auto Loader and Auto CDC into a gold star schema, governed by
Unity Catalog, provisioned with Terraform and shipped via Databricks Asset Bundles and GitHub
Actions across dev/test/prod, to Power BI. The page's architecture SHALL be carried by two native
diagrams: a data-flow diagram (the end-to-end medallion pipeline) and a CI/CD delivery diagram
(a promotion rail showing the trigger, GitHub Actions building the Asset Bundle, and promotion
across isolated dev/test/prod environments — each Terraform-provisioned, with a manual approval
gate before production). The two real Databricks UI screenshots (the DLT lineage graph and the
job task DAG) SHALL appear as proof figures after them. The page SHALL surface the project name
and one-line value within the first viewport, and SHALL link to the GitHub repo.

#### Scenario: AWS DLT page is grounded and refined
- **WHEN** the AWS DLT pipeline page is rendered
- **THEN** it shows the native data-flow diagram, the native CI/CD delivery (promotion-rail) diagram, the two Databricks screenshots as proof, and refined prose describing the metadata-driven ingestion → DLT medallion → star schema → Power BI pipeline with its Terraform/Asset-Bundles/GitHub-Actions CI/CD across environments

#### Scenario: CI/CD delivery is shown as a process
- **WHEN** the CI/CD delivery diagram is rendered
- **THEN** it shows the trigger (push / PR merge), GitHub Actions building the Asset Bundle, and the bundle promoted across dev → test → prod — each an isolated environment (its own Terraform-provisioned S3, Unity Catalog, and workspace) — with a manual approval gate before production

#### Scenario: Name and value land fast
- **WHEN** the AWS DLT page first paints
- **THEN** the project name and its one-line value are visible in the first viewport

#### Scenario: Reachable from the gallery
- **WHEN** a recruiter activates the AWS DLT project's card in the homepage Projects gallery
- **THEN** they navigate to `/projects/aws-dlt-pipeline`, and the back affordance returns them to the gallery
