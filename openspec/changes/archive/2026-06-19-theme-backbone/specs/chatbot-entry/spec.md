## ADDED Requirements

### Requirement: Persistent floating launcher
A floating chatbot launcher SHALL be present and reachable from the hero down through the entire page,
docked in a fixed position (conventional bottom corner). It SHALL be visible enough never to be missed
yet quiet enough not to obscure section content.

#### Scenario: Launcher visible while scrolling
- **WHEN** the recruiter scrolls anywhere from the hero to the end of the page
- **THEN** the floating chatbot launcher remains visible and tappable in a fixed corner

#### Scenario: Launcher does not block content
- **WHEN** the launcher is shown over any section
- **THEN** it does not cover primary text or controls of that section

### Requirement: Dedicated climax section
The page SHALL include a dedicated chatbot section placed at the end of the page, framed as the payoff
that the persistent launcher has been inviting. This section SHALL invite the recruiter to ask the
assistant about Tong.

#### Scenario: Reaching the chatbot section
- **WHEN** the recruiter reaches the chatbot section near the end of the page
- **THEN** it presents a clear invitation to ask the assistant about Tong as a featured moment

### Requirement: Backend out of scope
This change SHALL define only the launcher and the section shell — placement, affordance, and layout.
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
