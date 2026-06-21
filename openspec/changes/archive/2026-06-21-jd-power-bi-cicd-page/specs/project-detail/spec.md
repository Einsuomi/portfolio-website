## ADDED Requirements

### Requirement: J&D Power BI CI/CD page
There SHALL be a project detail page at `/projects/jd-power-bi-cicd` for the "J&D Report With
CI/CD" build, authored from the real repository source (the `powerbi-CI-pipelines.yml` Azure
DevOps pipeline, the `.pbip` project, and the Best Practice Analyzer / PBI Inspector rule files)
rather than carried over from the thin Wix copy. It SHALL describe the actual build the repo
depicts: a Power BI report authored in Power BI Desktop and version-controlled as `.pbip` in an
Azure DevOps Git repository; an automated validation pipeline triggered on commit to `dev` that
gates two checks — dataset/model rules via Tabular Editor Best Practice Analyzer and report rules
via PBI Inspector — before a pull request may merge to `main`; and a release pipeline that, after
a Release Manager approval, promotes the report through Power BI Deployment Pipelines across
isolated Development, Test, and Production workspaces.

The page's architecture SHALL be carried by two native, on-brand diagrams (built per the
existing native-diagram requirement — inline SVG/HTML/CSS, real text, no runtime JavaScript,
crisp at any zoom, legible with JS disabled and under reduced motion, no horizontal overflow at
a 390px viewport): a CI **validation gate** diagram and a CD **release rail** diagram. The
original white-background drawio image SHALL NOT be used. The two Power BI dashboard screenshots
(Overview and Customer Details) SHALL appear as proof figures after the diagrams. The page SHALL
surface the project name and one-line value within the first viewport, and SHALL link to the
GitHub repository.

#### Scenario: J&D page is grounded and refined
- **WHEN** the J&D Power BI CI/CD page is rendered
- **THEN** it shows the native validation-gate diagram, the native release-rail diagram, the two Power BI dashboard screenshots as proof, and refined prose describing PBIP version control → automated validation → approval → multi-stage deployment

#### Scenario: Validation gate reflects the shipped pipeline
- **WHEN** the validation-gate diagram is rendered
- **THEN** it shows authoring (Power BI Desktop → PBIP in Azure DevOps Git), a commit to `dev` triggering validation, exactly two real gates (dataset rules via Tabular Editor BPA and report rules via PBI Inspector), and a merge to `main` once they pass — and it does not invent a DAX-query gate absent from the shipped pipeline

#### Scenario: Release rail shows promotion with approval
- **WHEN** the release-rail diagram is rendered
- **THEN** it shows `main` feeding a release pipeline gated by a Release Manager approval, then promotion across isolated Development → Test → Production Power BI workspaces

#### Scenario: Name and value land fast
- **WHEN** the J&D page first paints
- **THEN** the project name and its one-line value are visible in the first viewport

#### Scenario: Reachable from the gallery
- **WHEN** a recruiter activates the J&D project's card in the homepage Projects gallery
- **THEN** they navigate to `/projects/jd-power-bi-cicd` (not an external GitHub link), and the back affordance returns them to the gallery
