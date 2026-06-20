## ADDED Requirements

### Requirement: Breathable cards with ghosted index
Project cards SHALL be transparent (frosted blur + thin edge, no dark fill) with the gold-flow ring, sized for a gallery-like, premium feel with negative space around them. Each card SHALL carry a ghosted index number (01, 02, …) as a structural motif — given the same faint fill + thin gold outline stroke as the Experience year, and sized so it sits behind the content. Card titles SHALL use the condensed Anton product voice. Skill tags SHALL sit on a single left-aligned row (cards sized so even the longest tag set fits without clipping). The ghosted index treatment SHALL remain visually distinct from the Experience year numerals so a sequence index never reads as a date.

#### Scenario: Gallery breathing room
- **WHEN** the Projects gallery is rendered
- **THEN** the cards are compact with generous dark space around them, each showing a large semi-opaque ghosted index number

#### Scenario: Index distinct from year
- **WHEN** a project card's index number and an Experience year numeral are compared
- **THEN** their treatments are visibly distinct so the index is not mistaken for a date
