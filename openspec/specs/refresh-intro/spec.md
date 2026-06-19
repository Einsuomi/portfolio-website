# Refresh Intro

## Purpose

The first beat a visitor sees on a fresh load: a percentage preloader that lifts away to reveal the
cinematic hero, whose copy then animates in. It sets the "attention is the mechanism" tone from the very
first frame, while never trapping or delaying visitors who can't or don't want the motion — for them the
hero is simply there. Placement and motion only; it gates entirely on JS + motion preference.

## Requirements

### Requirement: Refresh preloader
On a fresh page load, when JavaScript is present and motion is allowed, the site SHALL present a
full-screen preloader over the warm near-black backdrop that counts a percentage from 0 to 100 with a gold
fill bar, then lifts away to reveal the hero. The preloader SHALL hand off to the hero entrance as it starts
to lift, so the entrance overlaps the reveal. Once dismissed it SHALL remove itself from the layout so it
can never intercept clicks or scrolling afterwards.

#### Scenario: Fresh load with motion allowed
- **WHEN** the page is loaded with JavaScript present and `prefers-reduced-motion: no-preference`
- **THEN** a full-screen percentage preloader counts 0→100 with a gold fill bar, then lifts away to reveal the hero

#### Scenario: Preloader does not linger
- **WHEN** the preloader has finished and lifted away
- **THEN** it is removed from the layout and does not intercept clicks, scrolling, or other input

### Requirement: Hero entrance
When the hero is revealed with JavaScript present and motion allowed, its copy SHALL animate in rather than
appear statically: the name SHALL reveal with a left-to-right wipe while sliding in from the left, and the
tagline SHALL rise line by line. The entrance SHALL begin as the preloader lifts, and SHALL still play if no
preloader is present.

#### Scenario: Hero copy animates in
- **WHEN** the hero is revealed with motion allowed
- **THEN** the name wipes in left-to-right while sliding from the left and the tagline lines rise in, staggered

#### Scenario: Entrance without a preloader
- **WHEN** motion is allowed but no preloader hands off within a short fallback window
- **THEN** the hero entrance still plays so the hero copy always appears

### Requirement: Intro fallback contract
The intro SHALL never block or delay access to content. When the user prefers reduced motion, the preloader
SHALL NOT appear and the hero entrance SHALL NOT animate — the hero copy SHALL be immediately visible. When
JavaScript is unavailable, the preloader SHALL NOT render at all and SHALL NOT leave any overlay covering the
page; the hero copy SHALL be present in real HTML and immediately readable.

#### Scenario: User prefers reduced motion
- **WHEN** the browser reports `prefers-reduced-motion: reduce`
- **THEN** the preloader does not appear, the hero entrance does not animate, and the hero copy is immediately visible

#### Scenario: JavaScript disabled
- **WHEN** the page is rendered with JavaScript disabled
- **THEN** no preloader overlay renders and the hero copy is present in real HTML and immediately readable
