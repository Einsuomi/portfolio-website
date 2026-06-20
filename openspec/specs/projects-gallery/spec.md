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

### Requirement: Breathable cards with ghosted index
Project cards SHALL be transparent (frosted blur + thin edge, no dark fill) with the gold-flow ring, sized for a gallery-like, premium feel with negative space around them. Each card SHALL carry a ghosted index number (01, 02, …) as a structural motif — given the same faint fill + thin gold outline stroke as the Experience year, and sized so it sits behind the content. Card titles SHALL use the condensed Anton product voice. Skill tags SHALL sit on a single left-aligned row flush with the card text (cards sized so even the longest tag set fits without clipping). The ghosted index treatment SHALL remain visually distinct from the Experience year numerals so a sequence index never reads as a date.

#### Scenario: Gallery breathing room
- **WHEN** the Projects gallery is rendered
- **THEN** the cards are compact with generous dark space around them, each showing a large semi-opaque ghosted index number

#### Scenario: Index distinct from year
- **WHEN** a project card's index number and an Experience year numeral are compared
- **THEN** their treatments are visibly distinct so the index is not mistaken for a date
