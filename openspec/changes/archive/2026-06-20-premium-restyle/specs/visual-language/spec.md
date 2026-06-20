## ADDED Requirements

### Requirement: Typographic duality
The site SHALL use a two-voice typographic system in which a serif voice carries identity beats and a condensed grotesque voice carries machine/product beats, applied consistently so the contrast reads as authored rather than accidental. Identity beats (the hero wordmark and the Experience section) SHALL use the serif voice; product beats (the Projects gallery and the Chatbot/Ask section) SHALL use the condensed Anton voice. Body copy SHALL use the neutral sans, and labels/tags SHALL use the mono voice.

#### Scenario: Identity beats use the serif voice
- **WHEN** the hero wordmark or an Experience year numeral/title is rendered
- **THEN** it is set in the serif identity voice, not the condensed voice

#### Scenario: Product beats use the condensed voice
- **WHEN** a Projects card title or the Chatbot headline is rendered
- **THEN** it is set in the condensed Anton voice, not the serif voice

### Requirement: Gold accent scarcity
Gold SHALL remain a scarce accent. No more than one gold emphasis SHALL appear within a single viewport of a section, so the accent stays premium and is not diluted by repetition.

#### Scenario: Chatbot viewport gold count
- **WHEN** the Chatbot/Ask section is in view
- **THEN** at most one element carries the gold accent (the input glow), while the headline emphasis and the coming-soon badge use a quieter, non-gold treatment

### Requirement: Transparent cards over the scene
Cards over the photographic scene SHALL be transparent — a frosted blur and a thin bright edge, with no dark fill — so the scene reads through them. The gold-flow ring SHALL remain. Card text legibility SHALL be carried by the section scrim, text-shadow, and the backdrop blur together (not a dim fill); foreground text SHALL remain readable over any patch of the scene.

#### Scenario: Text on a transparent card
- **WHEN** a transparent card renders text over the scene backdrop
- **THEN** the scene shows through the card and the card's text stays readable, carried by the scrim, text-shadow, and blur
