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
The page SHALL include a dedicated chatbot section placed at the end of the page, framed as the payoff
that the persistent launcher has been inviting. This section SHALL invite the recruiter to ask the
assistant about Tong.

#### Scenario: Reaching the chatbot section
- **WHEN** the recruiter reaches the chatbot section at the end of the page
- **THEN** it presents a clear invitation to ask the assistant about Tong as a featured moment

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
