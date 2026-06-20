## ADDED Requirements

### Requirement: Crystal-glass rungs with legible contrast
Experience rungs SHALL be presented as transparent cards (frosted blur + thin edge, no dark fill) carrying the site's gold-flow accent ring. The keyword SHALL be the bold foreground title of each card in the condensed Anton voice, while the year SHALL drop to a ghosted watermark behind the content — set in the Fraunces serif voice, given a thin gold outline stroke so it reads crisp rather than blurry, sized so it sits behind the keyword without competing. The two ladder columns SHALL be EQUAL width (and narrower than before), and the intro SHALL have enough room to read in fewer lines. Cards SHALL be compact (reduced height). Skill tags SHALL sit on a single left-aligned row. Foreground text SHALL stay readable over any patch of the scene, carried by the section scrim, text-shadow, and blur.

#### Scenario: Reading a glass rung over a bright scene area
- **WHEN** a rung card overlaps a bright region of the scene backdrop
- **THEN** the card reads as clear bright glass yet its keyword and detail text remain at least 4.5:1 legible

#### Scenario: Keyword leads, year ghosts behind
- **WHEN** a rung is rendered
- **THEN** the keyword is the bold foreground title and the year appears as a large semi-opaque ghosted serif watermark behind it
