## ADDED Requirements

### Requirement: Vertical editorial list
The Writes section SHALL present Tong's writing as a vertical, text-forward editorial list. It SHALL
include the two case-study pieces "Deleting a Dependency Instead of Duplicating It" and "Dropping
Security Code Because the Threat Didn't Exist", each with its title and a one-line summary, and a link
to read the full piece.

#### Scenario: Viewing the writing list
- **WHEN** the Writes section is rendered
- **THEN** the two case-study pieces are listed vertically, each with title, a one-line summary, and a link to the full piece

### Requirement: Distinct from Projects
The Writes section SHALL use a vertical editorial layout and SHALL NOT reuse the horizontal gallery
treatment of the Projects section.

#### Scenario: Writes versus Projects
- **WHEN** a recruiter views Writes after Projects
- **THEN** Writes reads as a vertical text list rather than a horizontal gallery

### Requirement: Extensible list
The Writes list SHALL accommodate additional pieces added later without a layout change, rendering any
number of entries in the same vertical editorial format.

#### Scenario: Adding a third piece
- **WHEN** a new writing entry is added to the content source
- **THEN** it appears in the vertical list in the same format with no change to the section's layout
