# Pointer Interactions

## Purpose

The site's cursor-responsive behavior system — the pointer-tracked gold spotlight and hover
wiggle+lift on the Experience and Project cards, and the shared reduced-motion / no-JS / touch
fallback contract that governs all cursor-driven motion. It makes the surfaces a recruiter is already
looking at feel alive under the cursor without compromising the phone-first, no-JS, reduced-motion
guarantees the rest of the site holds.

## Requirements

### Requirement: Card pointer spotlight
Cards in the Experience ladder and the Projects gallery SHALL carry a pointer-tracked gold spotlight on
their border that follows the cursor's position, so the surface a recruiter is pointing at lights up under
the cursor. The spotlight hue and accent SHALL draw from the site's gold accent rather than the reference
component's blue/rainbow palette. The effect SHALL be driven by CSS custom properties updated from a single
shared pointer listener — no per-card listeners and no added UI framework.

#### Scenario: Cursor moves over a card
- **WHEN** a pointer hovers a card in the Experience ladder or the Projects gallery
- **THEN** a gold spotlight on the card's border tracks the cursor position

#### Scenario: Gold theme, not the reference palette
- **WHEN** the spotlight renders
- **THEN** its color is the site's warm gold accent, consistent with the hero and backbone theme

### Requirement: Card hover micro-interaction
On hover-enter, an Experience or Project card SHALL play a one-shot left-right wiggle and settle, and SHALL
lift slightly with a soft shadow while hovered, then return to rest on hover-leave. The motion SHALL be
restrained enough to stay consistent with the site's cinematic taste — a small accent, not a bounce. The
motion SHALL use GPU-friendly transforms only.

#### Scenario: Pointer enters a card
- **WHEN** a pointer enters a card
- **THEN** the card plays a single brief left-right wiggle and lifts a few pixels with a soft shadow

#### Scenario: Pointer leaves a card
- **WHEN** the pointer leaves the card
- **THEN** the card returns to its resting position without lingering motion

### Requirement: Cursor-motion fallback contract
All cursor-driven motion added by this capability SHALL degrade safely — the card spotlight, the card
wiggle and lift, and any related accent motion. Under `prefers-reduced-motion: reduce` the wiggle and lift
SHALL NOT play and the spotlight SHALL NOT animate. With JavaScript unavailable the cards SHALL remain fully
styled and readable with no broken state. On touch / no-hover devices the hover-only effects SHALL simply
not engage and SHALL NOT block tapping, scrolling, or the gallery's horizontal drag.

#### Scenario: User prefers reduced motion
- **WHEN** the browser reports `prefers-reduced-motion: reduce`
- **THEN** the card wiggle and lift do not play and the spotlight does not animate, while the cards stay fully readable

#### Scenario: JavaScript disabled
- **WHEN** the page is rendered with JavaScript disabled
- **THEN** the cards render in their normal resting style with no missing content or broken visuals

#### Scenario: Touch device
- **WHEN** the page is viewed on a touch / no-hover device
- **THEN** the hover effects do not engage and tapping, scrolling, and the Projects horizontal drag remain unobstructed
