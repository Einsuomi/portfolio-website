# Hero

## Purpose

The homepage hero — Tong's name, role, and "by day / by night" value line over a cinematic
looping video background, with text legibility guaranteed over any frame and a clean
reduced-motion / autoplay-fail fallback. It is the recruiter-critical first impression and the
only fully decided beat of the site rebuild.

## Requirements

### Requirement: Hero identity content
The hero SHALL present Tong's name, role, and a single "by day / by night" value line within the
first viewport, landing name + role + value within roughly 5 seconds of load. The name and role text
SHALL exist in the rendered HTML (not injected by JavaScript) so it is present without and before JS.

#### Scenario: Recruiter lands on the page
- **WHEN** the homepage finishes its first paint
- **THEN** the name "Tong Nie", the role eyebrow, and the day/night line are all visible in the first viewport

#### Scenario: JavaScript disabled or not yet loaded
- **WHEN** the page is rendered with JavaScript disabled
- **THEN** the name, role, and day/night line are still present and readable in the HTML

### Requirement: Cinematic video background
The hero SHALL display a full-viewport looping background video that autoplays muted and inline, with
the matching still image set as its poster. The active video/still pair SHALL be selectable via a single
configuration value, defaulting to Pair B (graded).

#### Scenario: Video autoplays on a capable browser
- **WHEN** the page loads on a browser that permits muted inline autoplay
- **THEN** the graded hero video plays, loops seamlessly, and has no audio track or controls

#### Scenario: Switching the active pair
- **WHEN** the single pair-selection config value is changed from B to A
- **THEN** the hero serves the natural-grade video and its matching still without other code changes

### Requirement: Text legibility over the video
Hero text SHALL remain readable over any frame of the background video, including the bright bloom peak,
meeting a contrast ratio of at least 4.5:1 against the frames behind it.

#### Scenario: Text over the brightest frame
- **WHEN** the video reaches its brightest bloom frame behind the text
- **THEN** the hero text still meets at least 4.5:1 contrast against that frame

### Requirement: Reduced-motion and autoplay-fail fallback
When the user prefers reduced motion, or the browser blocks autoplay, the hero SHALL show the matching
still image in place of the playing video while keeping all hero text identical and fully usable.

#### Scenario: User prefers reduced motion
- **WHEN** the browser reports `prefers-reduced-motion: reduce`
- **THEN** the hero shows the static still instead of a playing video, with identical text and layout

#### Scenario: Autoplay is blocked
- **WHEN** the browser blocks muted inline autoplay
- **THEN** the hero falls back to the still poster and remains fully readable

### Requirement: Top-right menu affordance
The hero SHALL present a single clickable menu icon fixed in the top-right corner, with no top
navigation bar. The icon SHALL be focusable and clickable but is not required to open any menu (a
menu panel and its animation are handled by a later change).

#### Scenario: Menu icon is present and reachable
- **WHEN** the hero is viewed on any supported viewport
- **THEN** a menu icon is visible in the top-right corner, is keyboard-focusable, and shows no top nav bar

### Requirement: Mobile and overflow safety
The hero SHALL be fully usable on a phone viewport and SHALL NOT cause page-level horizontal overflow.

#### Scenario: Phone viewport
- **WHEN** the hero is viewed at a 390px-wide viewport
- **THEN** all hero text fits, remains legible, and the page does not scroll horizontally

### Requirement: Luxury serif wordmark
The hero name "TONG NIE" SHALL be set as a luxury spaced-caps wordmark in the Fraunces high-contrast serif (the identity voice), not the condensed Anton previously used. On a wide viewport it SHALL be sized and tracked so it stays on a single line within the left region and does NOT overlap the central doorway focal subject of the scene. On narrow viewports the wordmark SHALL reflow deliberately — reducing letter-spacing and/or size step — so the spaced caps never break awkwardly, wrap mid-word, or trigger page-level horizontal overflow, and the name stays legible.

#### Scenario: Wordmark on desktop
- **WHEN** the hero is viewed on a wide viewport
- **THEN** "TONG NIE" renders in the Fraunces serif as spaced luxury caps on one line, clear of the central doorway

#### Scenario: Wordmark on a phone
- **WHEN** the hero is viewed at a 390px-wide viewport
- **THEN** the wordmark reflows with reduced tracking/size so it stays on legible lines and the page does not scroll horizontally

### Requirement: Hero copy placement
The hero eyebrow ("Building in public — Western Europe") SHALL be pinned at the top-left as a standing label, while the name and the day/night value line ride together higher in the frame — the name lifted to roughly the top of the central doorway — rather than anchored at the bottom.

#### Scenario: Hero composition
- **WHEN** the hero is viewed on a wide viewport
- **THEN** the eyebrow sits at the top-left, the name sits around the top of the doorway, and the value line sits just below the name
