## ADDED Requirements

### Requirement: Cross-page view transitions with a persistent hero
The shell SHALL enable client-side View Transitions for same-origin navigation between the
homepage and project detail pages, so navigation is a seamless animated transition rather than
a full page reload. During such navigation the hero scene SHALL persist (not be torn down and
re-created), so there is no white flash and the scene does not re-initialize. The scroll and
transition engine (Lenis + ScrollTrigger) SHALL re-initialize correctly after a client-side
navigation without duplicating or leaking listeners.

#### Scenario: Navigating between homepage and a detail page
- **WHEN** the recruiter moves from the homepage to a project detail page (or back)
- **THEN** the transition is animated with no white-flash reload and the hero scene stays alive rather than re-initializing

#### Scenario: Scroll engine after navigation
- **WHEN** a detail page is reached via client-side navigation
- **THEN** smooth scroll and reveal animations work on the new page without duplicated or broken scroll behavior

#### Scenario: Transitions are enhancement only
- **WHEN** the browser does not support view transitions, JavaScript is disabled, or `prefers-reduced-motion: reduce` is set
- **THEN** navigation falls back to ordinary instant page loads and every page remains fully usable
