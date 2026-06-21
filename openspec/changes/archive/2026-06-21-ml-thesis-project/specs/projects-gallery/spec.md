## MODIFIED Requirements

### Requirement: Curated horizontal gallery
The Projects section SHALL present exactly four curated project cards in a horizontal-scroll
gallery, ordered strongest-signal-first: AWS DLT Pipeline, Fingrid Data Engineering Platform,
J&D CI/CD Power BI Report, and the machine-learning thesis case study (Hotel Rating
Forecasting). The two grid-API pipelines (AWS DLT and Fingrid) SHALL be differentiated in their
summaries — AWS DLT vs Azure / ADF — so they read as multi-cloud breadth rather than the same
project twice. The gallery SHALL NOT carry a second Power BI project card without a detail page
(the Heureka Science Centre BI card is removed). Each card SHALL carry the project name, a
one-line summary, and its tech stack. A card whose project has an on-site detail page SHALL be a
single link to that page's `/projects/<slug>` route as its primary affordance (the whole card
clickable), navigating via a shared-element transition into the page; the external repo link
SHALL live on the detail page rather than on the card. A card whose project has no detail page
yet MAY link to its repo where one exists.

#### Scenario: Viewing the gallery
- **WHEN** the Projects section is rendered
- **THEN** exactly four cards are shown in a horizontally scrollable strip — AWS DLT Pipeline, Fingrid Data Engineering Platform, J&D CI/CD Power BI Report, and the ML thesis case study, in that order — each with name, summary, and stack, and no Heureka card

#### Scenario: Grid pipelines are differentiated
- **WHEN** the AWS DLT and Fingrid cards are read together
- **THEN** their summaries make the different cloud and approach clear (AWS DLT vs Azure / ADF), so they do not read as the same project twice

#### Scenario: Opening a project's detail page
- **WHEN** a recruiter activates a card whose project has a detail page (clicking anywhere on the card)
- **THEN** they navigate to that project's `/projects/<slug>` page via a shared-element transition rather than to an external repo

#### Scenario: Quality over quantity
- **WHEN** the gallery is composed
- **THEN** only the four curated projects appear and the remaining portfolio projects are not listed here
