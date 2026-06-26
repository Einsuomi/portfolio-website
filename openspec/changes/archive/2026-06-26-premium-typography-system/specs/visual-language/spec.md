## MODIFIED Requirements

### Requirement: Typographic duality
The site SHALL use a disciplined three-voice typographic system in which a single expressive display family carries BOTH identity beats and machine/product beats — distinguished by weight and case rather than by a second font — a neutral sans carries all body, prose, UI, and short leads, and a monospace voice carries labels, meta, tags, and data. The display family SHALL be Bricolage Grotesque, the sans SHALL be Geist, and the mono SHALL be JetBrains Mono. Identity beats (the hero wordmark, Experience titles) SHALL use the display family at a light weight (~380, optionally italic for the human note); machine/product beats (Projects titles, the Chatbot headline, company names) SHALL use the SAME display family at a heavy uppercase weight (700–800). The site SHALL NOT use a serif voice, and SHALL NOT load or use Fraunces, Instrument Serif, Inter, or Anton.

#### Scenario: Identity beats use the light display voice
- **WHEN** the hero wordmark or an Experience title is rendered
- **THEN** it is set in Bricolage Grotesque at a light weight, not a serif and not a heavy condensed face

#### Scenario: Machine beats use the heavy display voice
- **WHEN** a Projects card title, the Chatbot headline, or an Experience company name is rendered
- **THEN** it is set in Bricolage Grotesque at a heavy uppercase weight (700–800)

#### Scenario: Body and UI use the neutral sans
- **WHEN** body copy, prose, a lead line, or a UI control is rendered
- **THEN** it is set in Geist, not in a serif and not in Inter

#### Scenario: Banned families are absent
- **WHEN** the production build's loaded fonts are inspected
- **THEN** Fraunces, Instrument Serif, Inter, Anton, Archivo, and Space Grotesk are not present

## ADDED Requirements

### Requirement: Modular type-size scale
The site SHALL define a single modular type-size scale of eight responsive tokens (`--t-micro` through `--t-xl`, ratio ≈1.25), each expressed via `clamp()`, with body anchored at a 16px minimum on mobile. All text SHALL reference a scale token rather than an ad-hoc `font-size` value; exactly one oversize display outlier (the preloader name) is permitted outside the scale.

#### Scenario: Text references a scale token
- **WHEN** any text element's size is set
- **THEN** it uses one of the eight `--t-*` tokens (or the single permitted display outlier), not a bespoke `font-size`

#### Scenario: Mobile body floor
- **WHEN** body text renders on a small (phone) viewport
- **THEN** its computed size is at least 16px

### Requirement: Fluid spacing scale
The site SHALL define a complementary fluid spacing scale as CSS variable tokens (`--space-*`, each via `clamp()`) and SHALL use those tokens for section padding, inter-element gaps, and vertical rhythm, so spacing scales with the type and the layout never reads as cramped.

#### Scenario: Section padding uses a spacing token
- **WHEN** a section's block padding or a layout gap is set
- **THEN** it references a `--space-*` token rather than a hard-coded one-off value

### Requirement: Micro-typography discipline
Display headings at heavy uppercase SHALL use slightly negative letter-spacing (≈ -0.02em to -0.04em) so they read as solid structural blocks; micro mono labels SHALL use slightly positive letter-spacing (≈ 0.05em or more) to stay legible at small sizes; the largest tokens (`--t-lg`, `--t-xl`) SHALL use a tight line-height (≈1.0–1.1) while body SHALL use a comfortable 1.5–1.6; and numerals in statistics, metrics, and data SHALL render with tabular figures (`font-variant-numeric: tabular-nums`).

#### Scenario: Machine heading tracking
- **WHEN** a heavy uppercase Bricolage heading is rendered
- **THEN** its letter-spacing is slightly negative (≈ -0.02em to -0.04em)

#### Scenario: Micro mono label tracking
- **WHEN** a micro mono label (`--t-micro`/`--t-label`) is rendered
- **THEN** its letter-spacing is slightly positive (≈ ≥0.05em)

#### Scenario: Large-token leading and body leading
- **WHEN** a `--t-xl`/`--t-lg` heading and a body paragraph are rendered
- **THEN** the heading line-height is ≈1.0–1.1 and the body line-height is ≈1.5–1.6

#### Scenario: Tabular figures on data
- **WHEN** a statistic, metric, or stacked numeric value is rendered
- **THEN** it uses tabular figures so digits align vertically

### Requirement: Text color system
The site SHALL use a locked text-color system: one warm off-white ink ramp in three tints (`--ink`, `--ink-dim`, `--ink-faint`) plus a single gold accent (`--gold`), using no pure black and no pure white. Gold SHALL be the only page-level accent; bronze and silver are permitted ONLY within the medallion architecture diagram as domain semantics. Text that carries reading content SHALL meet a 4.5:1 contrast floor against its actual background, and the 40%-opacity faint tint SHALL be reserved for decoration (such as watermarks) and SHALL NOT carry reading content where it fails that floor.

#### Scenario: Single page-level accent
- **WHEN** a section other than the medallion diagram is in view
- **THEN** gold is the only accent color present in its text and emphasis

#### Scenario: No pure black or white
- **WHEN** primary text and the page background are inspected
- **THEN** text is an off-white (not `#fff`) and the background is an off-black (not `#000`)

#### Scenario: Reading content meets the contrast floor
- **WHEN** text carrying reading content renders over its background
- **THEN** its contrast ratio is at least 4.5:1, with faint (40%) used only for non-reading decoration

## REMOVED Requirements

### Requirement: Gold accent scarcity
**Reason**: The per-viewport gold-count cap was dropped in practice on 2026-06-25 (card-glass-edge) and is superseded by the Text color system requirement, which governs gold as the single locked page-level accent.
**Migration**: Gold usage is now governed by the locked single-accent ink-plus-gold ramp (see Text color system); there is no per-viewport emphasis count to enforce.
