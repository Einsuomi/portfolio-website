## ADDED Requirements

### Requirement: Privacy page
The site SHALL provide a `/privacy` page that discloses what is collected (anonymous analytics and chat logs), why it is collected, the retention period, and a contact method for requesting deletion of one's data. The page SHALL be readable on a phone and consistent with the site's styling.

#### Scenario: Reaching the privacy page
- **WHEN** a visitor navigates to `/privacy`
- **THEN** the page describes the collected data, purpose, retention, and a deletion-request contact

#### Scenario: Linked from the chat notice
- **WHEN** a recruiter follows the privacy link shown in the chat notice
- **THEN** they arrive at the `/privacy` page

### Requirement: Processors and transfers disclosure
The `/privacy` page SHALL name the third-party processors involved (the AI provider, the database, and the host) and SHALL state that data may be processed outside the EU under appropriate safeguards (e.g. standard contractual clauses), and that data-processing agreements apply. It SHALL identify the data controller and a contact, and SHALL state the recruiter's rights including access, deletion, and objection (opt-out of logging).

#### Scenario: Processors named
- **WHEN** a visitor reads `/privacy`
- **THEN** the page names the AI provider, database, and host as processors and notes that DPAs and transfer safeguards apply

#### Scenario: Rights stated
- **WHEN** a visitor reads `/privacy`
- **THEN** it states the controller, a contact, and the rights to access, deletion, and objection (opt-out of logging)

### Requirement: Truthful disclosure scope
The `/privacy` page's described collection SHALL match what the system actually does — at minimum the hashed-IP analytics (`/api/track`) and the chat logging (sessions and messages) — and SHALL NOT claim collection the site does not perform.

#### Scenario: Disclosure matches behavior
- **WHEN** the privacy page is reviewed against the implemented logging
- **THEN** every category it lists corresponds to data the site actually stores, and no stored category is omitted
