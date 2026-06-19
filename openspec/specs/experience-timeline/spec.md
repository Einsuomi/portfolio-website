# Experience Timeline

## Purpose

The Experience section — Tong's career as keyword-per-year rungs, presented as a held intro beside a
staggered alternating "ladder" so several years read at once and the section scales as years are added.
Signal-only, not a CV replica.

## Requirements

### Requirement: Keyword-per-year content
The Experience section SHALL present Tong's career as a set of year rungs, each anchored by a single
keyword naming that year's growth, with supporting detail (role, employer, stack, and one outcome) shown
on each rung. The rungs SHALL be, in order: 2021 FOUNDATIONS, 2023 LIFTOFF, 2024 "0 → 1", 2025 SCALE,
2026 GOVERNANCE AT SCALE. No year before 2021 SHALL appear. Each rung SHALL carry only the signal for
that year and SHALL NOT reproduce the full CV bullet list.

#### Scenario: Reading a year rung
- **WHEN** a year rung is in view
- **THEN** its keyword is prominent and the supporting role, employer, stack, and one outcome are visible on the rung without requiring a click

#### Scenario: Timeline boundaries
- **WHEN** the Experience section is rendered
- **THEN** the first rung is 2021 and no entry earlier than 2021 is shown

### Requirement: Held intro with staggered ladder
The Experience section SHALL hold a short intro at the left while the year rungs cascade as a staggered
two-column "ladder" on the right — the second column dropped so rungs alternate upper-left / lower-right.
The layout SHALL accommodate additional years without a layout change. Rungs SHALL reveal on scroll and
SHALL NOT hide detail behind a flip or other hidden affordance.

#### Scenario: Scrolling through Experience
- **WHEN** the recruiter scrolls through the Experience section
- **THEN** the intro stays held at the left while the rungs cascade past in an alternating staggered ladder, each rung's detail already visible

#### Scenario: Adding a year
- **WHEN** a new year is added to the content source
- **THEN** it appears as another rung in the alternating ladder with no change to the section's layout

### Requirement: Mobile and reduced-motion fallback
On touch devices and under reduced motion, the section SHALL flatten to a single readable column — intro
first, then the rungs in order, all detail visible — without depending on the held-intro or the staggered
ladder offsets.

#### Scenario: Reduced motion on a phone
- **WHEN** the section is viewed under `prefers-reduced-motion: reduce` or at a small viewport
- **THEN** the intro and rungs render as one plain vertical column with every keyword and its detail visible and scrollable
