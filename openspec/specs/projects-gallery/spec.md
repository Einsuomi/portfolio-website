# Projects Gallery

## Purpose

The Projects section — four curated project cards in a touch-friendly horizontal-scroll gallery,
deliberately distinct from the vertical Writes list so the two sections never read as redundant.

## Requirements

### Requirement: Curated horizontal gallery
The Projects section SHALL present exactly four curated project cards in a horizontal-scroll gallery:
Fingrid Data Engineering Platform, AWS DLT Pipeline, J&D CI/CD Power BI Report, and Heureka Science
Centre BI. Each card SHALL carry the project name, a one-line summary, its tech stack, and a link to its
detail or repo where one exists.

#### Scenario: Viewing the gallery
- **WHEN** the Projects section is rendered
- **THEN** exactly four cards are shown in a horizontally scrollable strip, each with name, summary, stack, and a link where available

#### Scenario: Quality over quantity
- **WHEN** the gallery is composed
- **THEN** only the four curated projects appear and the remaining portfolio projects are not listed here

### Requirement: Touch-friendly horizontal scroll
The gallery SHALL scroll horizontally within its own bounds via touch, trackpad, and drag, and SHALL NOT
cause the page body to scroll horizontally.

#### Scenario: Swiping on a phone
- **WHEN** the recruiter swipes horizontally inside the gallery on a touch device
- **THEN** the cards scroll within the gallery and the page body does not scroll horizontally

### Requirement: Distinct from Writes
The Projects gallery SHALL use the horizontal, image-forward treatment and SHALL NOT reuse the vertical
editorial layout of the Writes section, so the two sections read as deliberately different.

#### Scenario: Projects versus Writes
- **WHEN** a recruiter views Projects and then Writes
- **THEN** Projects reads as a horizontal visual gallery while Writes reads as a vertical text list, with no redundant repetition of the same layout
