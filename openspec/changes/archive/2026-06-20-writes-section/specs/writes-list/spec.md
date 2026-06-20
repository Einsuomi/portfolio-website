## MODIFIED Requirements

### Requirement: Single-card numbered list
The Writes section SHALL present Tong's writing as ONE card containing a numbered list (01, 02,
03 …) of all writes. It SHALL include the two case-study pieces "Deleting a Dependency Instead of
Duplicating It" and "Dropping Security Code Because the Threat Didn't Exist", each rendered as a
numbered row showing its index, title, and a one-line summary. Each row SHALL be a single
clickable link to that piece's on-site detail page (see the `write-detail` capability) rather than
to an external URL or a "soon" label.

#### Scenario: Viewing the writing list
- **WHEN** the Writes section is rendered
- **THEN** a single card shows the case-study pieces as a numbered list, each row showing its index, title, and one-line summary, and each row is a single link to that piece's detail page

#### Scenario: Opening a write
- **WHEN** a recruiter clicks anywhere on a write row
- **THEN** they navigate to that write's `/writes/<slug>` detail page

### Requirement: Distinct from Projects
The Writes section SHALL remain a single vertical card and SHALL NOT reuse the horizontal gallery
treatment of the Projects section. The card MAY reuse the shared card micro-interaction (the
`[data-spotlight]` gold-flow ring, hover lift, and one-shot wiggle) and the transparent
glass-over-scene styling, so the two sections feel of one family while their layouts stay distinct
(a single numbered-list card versus a horizontal strip of cards).

#### Scenario: Writes versus Projects
- **WHEN** a recruiter views Writes after Projects
- **THEN** Writes reads as one numbered-list card rather than a horizontal gallery, while sharing the gold-flow hover treatment

### Requirement: Extensible list with internal scroll
The Writes list SHALL accommodate additional pieces added later without a layout change. The
single card SHALL cap at a fixed maximum height, and the numbered list inside it SHALL scroll
internally (vertical scroll contained within the card) when the entries exceed that height, so the
section's overall footprint stays fixed regardless of the number of entries. The internal scroll
SHALL be contained so that scrolling through the list does not scroll the Writes section itself.

#### Scenario: Adding more pieces
- **WHEN** enough writing entries are added to exceed the card's height
- **THEN** the card's footprint is unchanged and the numbered list scrolls internally to reach the additional entries

#### Scenario: Scroll stays inside the card
- **WHEN** a recruiter scrolls within the writes list
- **THEN** the list scrolls inside the card without scrolling the Writes section out of view

## ADDED Requirements

### Requirement: Glass spotlight card
The Writes section's single card SHALL render as a transparent glass card consistent with the
Projects card styling — frosted blur over the continuous scene with a glass edge — and SHALL carry
the shared `[data-spotlight]` treatment so that, on a fine pointer with motion allowed, hovering
the card shows the gold-flow ring, lifts the card, and plays a one-shot wiggle. Touch and
reduced-motion users SHALL get the plain resting card.

#### Scenario: Hovering the card
- **WHEN** a fine-pointer, motion-allowed user hovers the writes card
- **THEN** the gold-flow ring rides its border, the card lifts, and a single wiggle plays once on enter

#### Scenario: Reduced motion or touch
- **WHEN** a reduced-motion or touch user views the card
- **THEN** the card renders in its plain resting state with no spotlight, lift, or wiggle

### Requirement: Width aligned with the chatbot composer
The Writes card SHALL be constrained to the same width as the chatbot section's input composer,
so the two late-page sections present as a deliberately aligned pair.

#### Scenario: Aligned widths
- **WHEN** the Writes section and the chatbot section are viewed on the same screen width
- **THEN** the Writes card and the chatbot composer share the same maximum width
