## ADDED Requirements

### Requirement: Per-write detail route
Each write SHALL have a real, server-rendered page at a stable, shareable URL `/writes/<slug>`.
The page SHALL be deep-linkable and indexable (present in static HTML, not injected by client
JavaScript) and SHALL be reachable directly without first visiting the homepage.

#### Scenario: Opening a write URL directly
- **WHEN** a recruiter loads a write's `/writes/<slug>` URL directly
- **THEN** the full piece renders from server HTML with its title and body present without requiring client JavaScript

#### Scenario: Sharing a single write
- **WHEN** the URL of one write's page is copied and opened elsewhere
- **THEN** it resolves to that same write's detail page

### Requirement: Bespoke per-topic content with a thin shared layout
Per-write detail pages SHALL NOT be produced from a single fixed-anatomy template. Each write's
body SHALL be authored as freeform, in-repo HTML specific to its own topic (interactive and
clickable content welcome). A thin shared layout SHALL wrap every write to provide the common
shell only — back navigation to the homepage Writes section, the site fonts and premium visual
language (serif/Anton type duality, gold scarcity, glass-over-scene), the shared scroll engine
and page transitions, a constrained reading width, and page metadata (title/description). The
shared layout SHALL NOT impose a fixed section order on the body.

#### Scenario: Two writes read differently
- **WHEN** two different writes are rendered
- **THEN** each shows its own bespoke body structure for its topic, while both share the same page shell (back link, fonts, reading width, transitions, meta)

#### Scenario: Shell is consistent
- **WHEN** any write detail page is rendered
- **THEN** it uses the site's type duality and gold-scarcity rules, rides the same continuous scene as the rest of the site, and offers a way back to the homepage Writes section

### Requirement: Morph from card to detail
A write card on the homepage SHALL navigate to its detail page using the same Astro View
Transitions morph used by the Projects cards, sharing a transition name between the card and the
detail page's hero so the transition is continuous. Where View Transitions are unsupported, the
navigation SHALL still resolve correctly as a normal page load.

#### Scenario: Navigating from a card
- **WHEN** a recruiter clicks a write card in a browser that supports View Transitions
- **THEN** the card morphs into its detail page

#### Scenario: Fallback navigation
- **WHEN** the browser does not support View Transitions
- **THEN** clicking the card still loads the correct detail page as a normal navigation
