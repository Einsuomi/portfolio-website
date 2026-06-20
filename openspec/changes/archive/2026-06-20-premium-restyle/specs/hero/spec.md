## ADDED Requirements

### Requirement: Luxury serif wordmark
The hero name "TONG NIE" SHALL be set as a luxury spaced-caps wordmark in the Fraunces high-contrast serif (the identity voice), not the condensed Anton previously used. On a wide viewport it SHALL be sized and tracked so it stays on a single line within the left region and does NOT overlap the central doorway focal subject of the scene. On narrow viewports the wordmark SHALL reflow deliberately — reducing letter-spacing and/or size step — so the spaced caps never break awkwardly, wrap mid-word, or trigger page-level horizontal overflow, and the name stays legible.

#### Scenario: Wordmark on desktop
- **WHEN** the hero is viewed on a wide viewport
- **THEN** "TONG NIE" renders in the Fraunces serif as spaced luxury caps on one line, clear of the central doorway

### Requirement: Hero copy placement
The hero eyebrow ("Building in public — Western Europe") SHALL be pinned at the top-left as a standing label, while the name and the day/night value line ride together higher in the frame — the name lifted to roughly the top of the central doorway — rather than anchored at the bottom.

#### Scenario: Hero composition
- **WHEN** the hero is viewed on a wide viewport
- **THEN** the eyebrow sits at the top-left, the name sits around the top of the doorway, and the value line sits just below the name

#### Scenario: Wordmark on a phone
- **WHEN** the hero is viewed at a 390px-wide viewport
- **THEN** the wordmark reflows with reduced tracking/size so it stays on legible lines and the page does not scroll horizontally
