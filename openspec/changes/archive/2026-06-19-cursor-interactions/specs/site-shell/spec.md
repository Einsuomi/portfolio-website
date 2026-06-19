## MODIFIED Requirements

### Requirement: Hero-to-body boundary marquee
Between the video hero and the still-backdrop body the page SHALL present a slim horizontal marquee strip
that marks the seam, carrying Tong's certifications by name (not exam code) and drifting slowly. The strip
SHALL loop seamlessly. Behind the cert names the strip SHALL carry a slowly drifting gold gradient glow —
a flowing accent in the site's warm gold theme (not a rainbow) — that reinforces the seam as an
intentional moment rather than a brightness jump. The strip SHALL remain a presentational seam: it carries
no dismissible control and no new copy. Under reduced motion both the cert drift and the gradient glow
SHALL stop and the strip SHALL remain readable.

#### Scenario: Crossing from hero into the body
- **WHEN** the recruiter scrolls past the video hero
- **THEN** a marquee strip of certification names appears as the boundary before the first body section

#### Scenario: Gold flow behind the names
- **WHEN** the boundary strip is shown
- **THEN** a slowly drifting gold gradient glow plays behind the certification names, in the site's gold theme

#### Scenario: Reduced motion
- **WHEN** the browser reports `prefers-reduced-motion: reduce`
- **THEN** neither the marquee nor the gradient glow auto-animates and the certification names stay readable
