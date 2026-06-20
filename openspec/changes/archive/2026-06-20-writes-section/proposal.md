## Why

The Writes section currently reads as a plain vertical text list whose entries link to a "soon"
label or an external URL, visually disconnected from the premium glass card language used in
Projects. With per-project detail pages now shipped, Writes should match: each piece is a
clickable on-site essay with the same magnetic card treatment, sized and placed to feel
intentional, and the homepage list should stay compact as more pieces are added.

## What Changes

- **Writes cards adopt the Projects card treatment** — each write becomes a transparent
  glass card with the shared `[data-spotlight]` gold-flow ring, hover lift, and one-shot
  wiggle, instead of the flat bordered text rows.
- **Section width matches the chatbot composer** — the Writes column is constrained to the
  same width as the chatbot input bar so the two late-page sections align as a deliberate pair.
- **Internal vertical scroll for overflow** — the card stack shows ~2 writes at rest and
  scrolls internally when there are more, so the section's footprint stays fixed no matter how
  many pieces exist.
- **Each write is clickable to its own detail page** — like Projects, a write card navigates
  (with the View Transitions morph) to a real, shareable `/writes/<slug>` route.
- **Per-write detail pages are bespoke HTML, not a fixed template** — unlike the single
  reusable Projects template, each write authors a freeform HTML body for its own topic,
  wrapped by a thin shared `WriteLayout` that provides the page shell (back link, fonts,
  scroll engine, transitions, reading width, meta).

## Capabilities

### New Capabilities
- `write-detail`: Per-write detail pages — shareable `/writes/<slug>` routes where each piece
  is authored as bespoke HTML for its own topic, wrapped by a thin shared layout that carries
  the site's shell and premium visual language.

### Modified Capabilities
- `writes-list`: The homepage Writes section's entries change from flat text rows to clickable
  glass spotlight cards; the section gains a chatbot-width constraint and internal scroll; each
  entry now links to an on-site detail page rather than an external/"soon" link.

## Impact

- **Components**: `src/components/Writes.astro` (card markup + styles, width, internal scroll,
  links). New `src/layouts/WriteLayout.astro` (thin shell). New per-write page(s) under
  `src/pages/writes/`.
- **Content/types**: `Write` type in `src/lib/timeline.ts` gains a `slug` (and the entries get
  slugs); write bodies authored in-repo, hardcoded like the project detail content.
- **Shared systems**: reuses `[data-spotlight]` (pointer.ts + backbone.css) and Astro View
  Transitions already in place for Projects; no changes to those engines.
- **Assets**: any per-write images live under `src/assets/writes/<slug>/`.
