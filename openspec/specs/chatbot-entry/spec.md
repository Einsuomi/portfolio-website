# Chatbot Entry

## Purpose

The chatbot's presence — a persistent floating launcher from the hero down plus a dedicated climax
section at the end of the page. Placement and shell only; the conversational backend is a future change,
so the launcher and section show a non-deceptive placeholder until it lands.

## Requirements

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

### Requirement: Dedicated climax section
The page SHALL include a dedicated chatbot section placed at the end of the page, framed as the payoff that the persistent launcher has been inviting. This section SHALL invite the recruiter to ask the assistant about Tong. Its kicker SHALL read "BEYOND THE CV". Its headline SHALL read "DON'T JUST READ — TALK." on a single line, with the word "TALK." carrying the gold accent (tying it to the Talk launcher). The section's content block SHALL be generously wide so the differentiator line reads in roughly two lines rather than a cramped column; the scene may sit behind the text. The section SHALL present a glass input bar as the invitation, over a deepened moody backdrop with the input pill carrying a gold glow. It SHALL carry a differentiator line stating that the assistant knows the reasoning behind Tong's work — its exact words: "An assistant that knows the reasoning, not just the résumé — my pipelines, my architecture, the trade-offs behind each decision. Ask it what a CV can't tell you." The gold accents in this section SHALL be the headline word "TALK." and the input glow; the coming-soon badge stays a quiet, non-gold chip.

#### Scenario: Reaching the chatbot section
- **WHEN** the recruiter reaches the chatbot section at the end of the page
- **THEN** it shows the "BEYOND THE CV" kicker, the one-line "DON'T JUST READ — TALK." headline with gold "TALK.", the two-line differentiator line, and a gold-glow glass input bar

#### Scenario: Gold stays scarce in the section
- **WHEN** the chatbot section is in view
- **THEN** at most one element (the input glow) carries the gold accent, while the headline emphasis and coming-soon badge are quieter

### Requirement: Backend out of scope
This capability SHALL define only the launcher and the section shell — placement, affordance, and layout.
The conversational AI backend SHALL NOT be implemented here; the launcher and section MAY present a
placeholder or "coming soon" state without a working conversation.

#### Scenario: Interacting before the backend exists
- **WHEN** the recruiter opens the launcher or reaches the section before the chatbot backend is built
- **THEN** a placeholder state is shown and no broken or erroring conversation UI is presented

### Requirement: Launcher fallback
When JavaScript is unavailable, the persistent launcher SHALL degrade gracefully — it SHALL NOT leave a
dead control that appears interactive but does nothing.

#### Scenario: JavaScript disabled
- **WHEN** the page is rendered with JavaScript disabled
- **THEN** the launcher is either hidden or rendered as a plain non-deceptive element, and the rest of the page remains fully usable
