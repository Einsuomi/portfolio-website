## MODIFIED Requirements

### Requirement: Persistent floating launcher
A floating chatbot launcher SHALL be present and reachable from the hero down through the entire page,
docked in a fixed position (conventional bottom corner). It SHALL be visible enough never to be missed yet
quiet enough not to obscure section content. Its label SHALL read "Talk" (inviting conversation rather than
a one-shot question), and it SHALL carry a subtle gold shimmer / attention pulse that draws the eye without
becoming distracting. The shimmer SHALL respect `prefers-reduced-motion` and SHALL NOT play when reduced
motion is requested.

#### Scenario: Launcher visible while scrolling
- **WHEN** the recruiter scrolls anywhere from the hero to the end of the page
- **THEN** the floating chatbot launcher labelled "Talk" remains visible and tappable in a fixed corner

#### Scenario: Launcher draws the eye
- **WHEN** the launcher is at rest and motion is allowed
- **THEN** a subtle gold shimmer / pulse plays on it to invite attention without obscuring content

#### Scenario: Launcher does not block content
- **WHEN** the launcher is shown over any section
- **THEN** it does not cover primary text or controls of that section

#### Scenario: Reduced motion
- **WHEN** the browser reports `prefers-reduced-motion: reduce`
- **THEN** the launcher's shimmer / pulse does not play and the launcher stays a plain readable control
