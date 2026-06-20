# Site Shell

## Purpose

The structure and motion below the hero: the continuous graded scene backdrop the whole body rides, the
hero-to-body boundary marquee, the fixed section order, the Lenis + ScrollTrigger scroll/transition
engine (reveal-on-enter plus section-level sticky-stack), and the reduced-motion / no-JS fallback that
every section inherits. It makes the body read as the same world as the hero rather than a page stapled
beneath it.

## Requirements

### Requirement: Continuous graded scene backdrop
The site below the hero SHALL ride the same hero still as a continuous, viewport-fixed backdrop, so the
body reads as the same world as the hero rather than a separate page. The backdrop SHALL be graded
progressively darker section by section — lightest at Experience, near-black by the Chatbot — so that a
section visibly occludes a darker one as it slides over it, and so legibility improves toward the end.
Text SHALL remain readable over the backdrop, carried by translucent panels and text shadow rather than
a single heavy overlay.

#### Scenario: Recruiter scrolls through the body
- **WHEN** the recruiter scrolls from Experience down to the Chatbot
- **THEN** the same scene stays behind every section and each section's backdrop is darker than the one above it

#### Scenario: Text contrast over the backdrop
- **WHEN** any section's text is rendered over the backdrop
- **THEN** the text meets a contrast ratio of at least 4.5:1 against the backdrop behind it

#### Scenario: Small screens
- **WHEN** the page is viewed at a small/touch viewport
- **THEN** the backdrop attachment falls back to normal scrolling so the page stays smooth and usable

### Requirement: Hero-to-body boundary marquee
Between the video hero and the still-backdrop body the page SHALL present a slim horizontal marquee strip
that marks the seam, carrying Tong's certifications by name (not exam code) and drifting slowly from right
to left. Each cycle SHALL be led by a gold "CERTIFIED —" token so the strip reads explicitly as
certifications. The strip SHALL loop seamlessly. Behind the names the strip SHALL carry a slowly drifting
gold gradient glow — a flowing accent in the site's warm gold theme (not a rainbow) — that reinforces the
seam as an intentional moment rather than a brightness jump. The strip SHALL remain a presentational seam:
it carries no dismissible control and no new copy beyond the "CERTIFIED" lead label. Under reduced motion
both the drift and the gradient glow SHALL stop and the strip SHALL remain readable.

#### Scenario: Crossing from hero into the body
- **WHEN** the recruiter scrolls past the video hero
- **THEN** a marquee strip drifting right→left appears as the boundary, each cycle led by a gold "CERTIFIED —" token followed by the certification names

#### Scenario: Gold flow behind the names
- **WHEN** the boundary strip is shown
- **THEN** a slowly drifting gold gradient glow plays behind the certification names, in the site's gold theme

#### Scenario: Reduced motion
- **WHEN** the browser reports `prefers-reduced-motion: reduce`
- **THEN** neither the marquee nor the gradient glow auto-animates and the certification names stay readable

### Requirement: Section order
The page SHALL present its sections below the hero in this fixed order: a boundary marquee, then
Experience, Projects, Writes, and the Chatbot climax. There SHALL be no separate Contact section.

#### Scenario: Default page composition
- **WHEN** the homepage is rendered
- **THEN** the sections appear in the order Hero → marquee → Experience → Projects → Writes → Chatbot

### Requirement: Scroll and transition engine
The site SHALL use Lenis smooth scrolling with GSAP ScrollTrigger to drive section motion. Every section
SHALL reveal its content on enter (a slide-up plus fade). The body sections SHALL slide over one another
as a section-level sticky-stack: each of Projects, Writes and Chatbot holds in the viewport while the
next section slides up over it, over the fixed graded scene.

#### Scenario: A section enters the viewport
- **WHEN** a section scrolls into view
- **THEN** its content reveals with a slide-up and fade-in rather than appearing statically

#### Scenario: Section slide-over
- **WHEN** the recruiter scrolls from one body section to the next
- **THEN** the current section holds while the next slides up over it against the deepening backdrop

### Requirement: Reduced-motion and content fallback
When the user prefers reduced motion, or JavaScript or WebGL is unavailable, the site SHALL present a
static, fully usable page: all section content lives in real rendered HTML, smooth scroll and
reveal/sticky-stack animations are disabled, and native vertical scrolling reaches every section.

#### Scenario: User prefers reduced motion
- **WHEN** the browser reports `prefers-reduced-motion: reduce`
- **THEN** Lenis smooth scroll and all reveal/sticky-stack animations are disabled and every section is immediately visible and readable

#### Scenario: JavaScript disabled
- **WHEN** the page is rendered with JavaScript disabled
- **THEN** all section text content is present in the HTML and reachable by native scrolling

### Requirement: No accidental horizontal overflow
The page SHALL NOT produce accidental page-level horizontal scrolling on any viewport. Intentional
horizontal-scroll sections SHALL be self-contained and touch-friendly and SHALL NOT cause the page body
to scroll horizontally.

#### Scenario: Viewing on a phone
- **WHEN** the page is viewed at a mobile viewport width
- **THEN** the page body does not scroll horizontally, while any intentional horizontal section scrolls only within its own bounds

### Requirement: Typeface loading and tokens
The shell SHALL load the site's typeface families and expose them as design tokens, including a Fraunces (high-contrast serif) family added for the identity voice alongside the existing Anton, Instrument Serif, Inter, and JetBrains Mono families. Adding the family SHALL be token-only and SHALL NOT alter the fixed-scene backdrop, the section order, or the scroll/transition engine.

#### Scenario: Fraunces token available
- **WHEN** a component references the serif identity token
- **THEN** it resolves to the loaded Fraunces family, with the existing serif as a fallback

#### Scenario: Architecture unchanged by the token addition
- **WHEN** the typeface token is added
- **THEN** the continuous scene backdrop, the fixed section order, and the scroll engine behave exactly as before

### Requirement: Cross-page view transitions
The shell SHALL enable client-side View Transitions for same-origin navigation between the
homepage and project detail pages, so navigation is a seamless animated transition rather than a
full page reload with a white flash. The continuous scene backdrop SHALL stay visually continuous
across navigation (it SHALL NOT re-initialize). The scroll/transition engine SHALL re-initialize
cleanly after a client-side navigation without duplicating or leaking listeners. The refresh intro
(preloader curtain + hero entrance) SHALL play only on a true page load and SHALL NOT re-trigger on
in-site navigation, so it can never re-appear and trap the visitor.

#### Scenario: Navigating between homepage and a detail page
- **WHEN** the recruiter moves from the homepage to a project detail page (or back)
- **THEN** the transition is animated with no white-flash reload and the scene stays continuous rather than re-initializing

#### Scenario: Scroll engine after navigation
- **WHEN** a detail page is reached via client-side navigation
- **THEN** smooth scroll and reveal animations work on the new page without duplicated or broken scroll behavior

#### Scenario: Refresh intro does not re-trap
- **WHEN** the recruiter navigates back to the homepage from a detail page
- **THEN** the preloader curtain does not re-appear and the hero copy is visible, with no refresh required

#### Scenario: Transitions are enhancement only
- **WHEN** the browser does not support view transitions, JavaScript is disabled, or `prefers-reduced-motion: reduce` is set
- **THEN** navigation falls back to ordinary instant page loads and every page remains fully usable
