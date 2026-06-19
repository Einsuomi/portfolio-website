## ADDED Requirements

### Requirement: Continuous graded scene backdrop
The site below the hero SHALL ride the same hero still as a continuous, viewport-fixed backdrop, so
the body reads as the same world as the hero rather than a separate page. The backdrop SHALL be graded
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
Between the video hero and the still-backdrop body the page SHALL present a slim horizontal marquee
strip that marks the seam, carrying Tong's certifications by name (not exam code) and drifting slowly.
The strip SHALL loop seamlessly. Under reduced motion the drift SHALL stop and the strip SHALL remain
readable.

#### Scenario: Crossing from hero into the body
- **WHEN** the recruiter scrolls past the video hero
- **THEN** a marquee strip of certification names appears as the boundary before the first body section

#### Scenario: Reduced motion
- **WHEN** the browser reports `prefers-reduced-motion: reduce`
- **THEN** the marquee does not auto-scroll and its certification names stay readable

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
