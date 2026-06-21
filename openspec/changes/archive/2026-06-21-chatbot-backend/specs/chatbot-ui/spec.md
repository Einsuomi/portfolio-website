## ADDED Requirements

### Requirement: Floating chat panel
The site SHALL present a single floating chat panel that overlays the page and is reachable from anywhere. It SHALL have two presentations of the same panel: a compact corner mode and a full-window mode (a centred modal over a dim backdrop). The persistent "Talk" launcher SHALL open the panel in compact mode; the chatbot climax section's input SHALL open the same panel directly in full-window mode; and sending a message while in compact mode SHALL expand the panel into full-window mode. The panel SHALL let the recruiter type a message, send it, and read the streamed reply, and SHALL support a multi-turn conversation within a single visit. The panel SHALL be usable on a phone.

#### Scenario: Section input opens the full window
- **WHEN** the recruiter activates the chatbot section's input
- **THEN** the chat opens directly in full-window mode (centred modal with a backdrop)

#### Scenario: Compact panel grows on send
- **WHEN** the recruiter opens the compact corner panel from the launcher and sends a message
- **THEN** the panel expands into the full-window mode and continues the conversation there

#### Scenario: Backdrop closes the full window
- **WHEN** the recruiter clicks the dimmed backdrop behind the full-window chat
- **THEN** the chat closes and the page remains fully usable

#### Scenario: Opening from the launcher
- **WHEN** the recruiter clicks the "Talk" launcher anywhere on the page
- **THEN** the floating chat panel opens, ready for input

#### Scenario: Opening from the section input
- **WHEN** the recruiter activates the chatbot section's input
- **THEN** the same floating chat panel opens and receives focus

#### Scenario: Holding a conversation
- **WHEN** the recruiter sends a message and then a follow-up
- **THEN** both turns and their replies are visible in the panel in order

#### Scenario: Closing the panel
- **WHEN** the recruiter dismisses the panel
- **THEN** it closes and the underlying page remains fully usable

### Requirement: In-chat privacy notice
The chat panel SHALL display a concise acceptance-by-use notice stating that, by chatting, the recruiter agrees the conversation may be saved to improve the assistant, advising against sharing sensitive personal information, and linking to the `/privacy` page. The notice SHALL be visible before or at the point of first input and SHALL NOT block use of the chat (notice, not a consent gate). Objection to logging is exercised via the `/privacy` contact (see `privacy-disclosure`), not an in-chat toggle.

#### Scenario: Notice shown before chatting
- **WHEN** the chat panel is opened
- **THEN** the acceptance-by-use notice with a link to `/privacy` is visible without the recruiter having to act first

#### Scenario: Notice does not gate use
- **WHEN** the recruiter begins typing
- **THEN** they can send messages without first clicking an accept button or consent dialog

### Requirement: Download transcript
The chat panel SHALL let the recruiter download the current conversation in two formats: PDF and Markdown. The library used to generate the PDF SHALL be loaded only when the recruiter initiates a download, so it does not affect initial page load. The downloaded transcript SHALL contain the conversation's messages in order.

#### Scenario: Markdown download
- **WHEN** the recruiter chooses to download the transcript as Markdown
- **THEN** a Markdown file containing the conversation is downloaded

#### Scenario: PDF download with lazy load
- **WHEN** the recruiter chooses to download the transcript as PDF
- **THEN** the PDF library loads on demand and a PDF of the conversation is downloaded, with no PDF code loaded before this point

### Requirement: Resilient fallbacks
The chat UI SHALL respect `prefers-reduced-motion` (no gratuitous animation) and SHALL degrade gracefully when JavaScript is unavailable — without JS the launcher and section SHALL behave as the existing non-deceptive controls (no dead control that appears interactive but does nothing).

#### Scenario: Reduced motion
- **WHEN** the browser reports `prefers-reduced-motion: reduce`
- **THEN** the panel opens and operates without motion effects

#### Scenario: JavaScript disabled
- **WHEN** the page is rendered with JavaScript disabled
- **THEN** the chat panel is not offered as a working control, and the launcher/section remain non-deceptive and the page stays fully usable
