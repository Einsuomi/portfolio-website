## ADDED Requirements

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
