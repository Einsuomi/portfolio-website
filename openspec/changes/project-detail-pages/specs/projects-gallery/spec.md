## MODIFIED Requirements

### Requirement: Curated horizontal gallery
The Projects section SHALL present exactly four curated project cards in a horizontal-scroll gallery:
Fingrid Data Engineering Platform, AWS DLT Pipeline, J&D CI/CD Power BI Report, and Heureka Science
Centre BI. Each card SHALL carry the project name, a one-line summary, and its tech stack. A card whose
project has an on-site detail page SHALL link to that page's `/projects/<slug>` route as its primary
affordance, navigating via a shared-element transition into the page; the external repo link SHALL live
on the detail page rather than on the card. A card whose project has no detail page yet MAY link to its
repo where one exists.

#### Scenario: Viewing the gallery
- **WHEN** the Projects section is rendered
- **THEN** exactly four cards are shown in a horizontally scrollable strip, each with name, summary, and stack, and a link to its detail page where one exists

#### Scenario: Opening a project's detail page
- **WHEN** a recruiter activates a card whose project has a detail page
- **THEN** they navigate to that project's `/projects/<slug>` page via a shared-element transition rather than to an external repo

#### Scenario: Quality over quantity
- **WHEN** the gallery is composed
- **THEN** only the four curated projects appear and the remaining portfolio projects are not listed here
