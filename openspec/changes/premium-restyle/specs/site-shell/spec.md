## ADDED Requirements

### Requirement: Typeface loading and tokens
The shell SHALL load the site's typeface families and expose them as design tokens, including a Fraunces (high-contrast serif) family added for the identity voice alongside the existing Anton, Instrument Serif, Inter, and JetBrains Mono families. Adding the family SHALL be token-only and SHALL NOT alter the fixed-scene backdrop, the section order, or the scroll/transition engine.

#### Scenario: Fraunces token available
- **WHEN** a component references the serif identity token
- **THEN** it resolves to the loaded Fraunces family, with the existing serif as a fallback

#### Scenario: Architecture unchanged by the token addition
- **WHEN** the typeface token is added
- **THEN** the continuous scene backdrop, the fixed section order, and the scroll engine behave exactly as before

## MODIFIED Requirements

### Requirement: Hero-to-body boundary marquee
Between the video hero and the still-backdrop body the page SHALL present a slim horizontal marquee strip that marks the seam, carrying Tong's certifications by name (not exam code) and drifting slowly from right to left. Each cycle SHALL be led by a gold "CERTIFIED —" token so the strip reads explicitly as certifications. The strip SHALL loop seamlessly. Behind the names the strip SHALL carry a slowly drifting gold gradient glow — a flowing accent in the site's warm gold theme (not a rainbow) — that reinforces the seam as an intentional moment rather than a brightness jump. The strip SHALL remain a presentational seam: it carries no dismissible control and no new copy beyond the "CERTIFIED" lead label. Under reduced motion both the drift and the gradient glow SHALL stop and the strip SHALL remain readable.

#### Scenario: Crossing from hero into the body
- **WHEN** the recruiter scrolls past the video hero
- **THEN** a marquee strip drifting right→left appears as the boundary, each cycle led by a gold "CERTIFIED —" token followed by the certification names

#### Scenario: Gold flow behind the names
- **WHEN** the boundary strip is shown
- **THEN** a slowly drifting gold gradient glow plays behind the certification names, in the site's gold theme

#### Scenario: Reduced motion
- **WHEN** the browser reports `prefers-reduced-motion: reduce`
- **THEN** neither the marquee nor the gradient glow auto-animates and the certification names stay readable
