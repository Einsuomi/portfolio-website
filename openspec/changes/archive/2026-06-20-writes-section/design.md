## Context

The homepage Writes section (`src/components/Writes.astro`) renders `WRITES` (from
`src/lib/timeline.ts`) as flat bordered `<li>` rows with a "Read →" or "Publishing soon" label.
Projects, by contrast, ships glass spotlight cards (`src/components/Projects.astro`) that morph
into per-project detail pages (`/projects/<slug>`, one reusable `ProjectDetail.astro` template
fed by structured `PROJECT_DETAILS` data). The shared card hover treatment lives in
`backbone.css` (`[data-spotlight]`) and `src/scripts/pointer.ts`; View Transitions are already
wired site-wide.

This change brings Writes into that family — clickable glass spotlight cards that morph to
on-site detail pages — but, per Tong's decision, the detail pages are **bespoke HTML per topic**
rather than one fixed template, because each write is a genuinely different subject.

## Goals / Non-Goals

**Goals:**
- Writes entries render as transparent glass spotlight cards reusing `[data-spotlight]`.
- The card stack width matches the chatbot composer width so the two sections align.
- The stack shows ~2 cards and scrolls internally beyond that; the section footprint is fixed.
- Each card morphs (View Transitions) to a real, shareable `/writes/<slug>` page.
- Each detail page is freeform per-topic HTML wrapped by a thin shared `WriteLayout`.

**Non-Goals:**
- No fixed section-anatomy template for write bodies (that is Projects' model, rejected here).
- No CMS / markdown content collection; bodies are hardcoded in-repo like project details.
- No changes to the `[data-spotlight]`, pointer.ts, or View Transitions engines themselves.
- No new write content authored beyond wiring the two existing pieces (real bodies can follow).

## Decisions

### One single card with a numbered list (not a stack of per-write cards)
The whole Writes section is ONE `[data-spotlight]` transparent-glass card; every write is a
numbered row (01, 02, 03 …) inside it, not its own card. Tong clarified this directly: the "card
animation + transparent background" applies to the single card, and "scrollable inside the card"
means the list scrolls within that one card while the section stays put. The card reuses the
Projects glass styling and `[data-spotlight]` so the gold-flow ring, lift, and wiggle ride the
single card — keeping the two sections one family while the layouts stay distinct (one
numbered-list card vs. a horizontal strip of cards). Each numbered row is still a single anchor to
its `/writes/<slug>` detail page with a per-row hover affordance (gold title + advancing arrow).
Alternative — a vertical stack of per-write cards (an earlier interpretation) — was rejected by
Tong.

### Internal scroll via a capped card + an inner scroll surface
The card `overflow: hidden` keeps the spotlight ring on its own border; the inner `<ol>` is the
scroll surface (`overflow-y: auto`, `overscroll-behavior: contain`, `-webkit-overflow-scrolling:
touch`, thin styled scrollbar). The card caps at `max-height: min(62vh, 36rem)`; below that it
hugs its content (so two writes don't make an artificially tall empty card), and once entries
exceed the cap the list scrolls inside while the card's footprint stays fixed. `overscroll-behavior:
contain` keeps that scroll from bubbling to the page / sticky section. The scroll lives on the
inner list (not the card) specifically so the absolutely-positioned spotlight ring does not stretch
over the full scroll height.

### Width token shared with the chatbot composer
The chatbot composer is `max-width: 54.5rem` (`Chatbot.astro`). To keep the two aligned as the
spec requires, the Writes column uses the same value. To avoid a magic number drifting in two
files, prefer a shared CSS custom property (e.g. `--composer-width: 54.5rem` in `backbone.css`)
referenced by both. Alternative — duplicate the literal — was rejected as fragile.

### Detail pages: bespoke HTML body + thin `WriteLayout`
New `src/layouts/WriteLayout.astro` wraps `Base.astro` and provides only the shared shell:
back-link to `/#writes`, the constrained reading width, the hero band that rides the continuous
scene, scroll engine + pointer + View Transitions wiring (as the project route does), and
`title`/`description` slots. The body is a `<slot/>` — each write authors its own HTML.

Routing options considered:
- **A) One bespoke `.astro` file per write** under `src/pages/writes/` (e.g.
  `deleting-a-dependency.astro`), each `<WriteLayout>`-wrapped with its hand-written body.
  Simplest mental model, maximum per-topic freedom, no indirection.
- **B) A `[slug].astro` dynamic route** that switches on slug to render the right body
  component. Centralizes `getStaticPaths` but adds a dispatch layer over what is still bespoke
  content.

**Decision: A (one file per write).** It most directly matches "just write HTML for this topic"
and avoids a dispatcher that earns nothing while bodies are bespoke. The homepage card links are
built from each write's `slug`. (If the count ever grows large, B remains a clean refactor.)

### `Write` type gains `slug`
`Write` in `timeline.ts` adds `slug: string`; the two entries get slugs
(`deleting-a-dependency`, `dropping-security-code`). The homepage card link is `/writes/<slug>`
and the shared `transition:name` is derived from the slug (e.g. `write-<slug>`) so the card and
the detail hero morph, exactly as Projects do. The `url`/"soon" fields are dropped from the
homepage rendering (every write now points to its on-site page).

### Assets
Per-write images, if any, live under `src/assets/writes/<slug>/` and are imported so
`astro:assets` can optimize them — same convention as `src/assets/projects/<slug>/`.

## Risks / Trade-offs

- **Per-file pages duplicate shell boilerplate** → mitigated by `WriteLayout` carrying all the
  shell; each page file is just `<WriteLayout …>` + body, a few lines of wrapper.
- **Internal scroll can hide entries on small screens** → a styled scrollbar plus showing a
  partial third card hints at more; verify on a phone that the scroll is discoverable and
  touch-friendly (project rule: must work for a recruiter on a phone).
- **Two existing writes don't trigger the scroll** → acceptable; the scroll is a forward-looking
  affordance. Verify behavior by temporarily adding a third entry during implementation.
- **"Distinct from Projects" spec tension** → resolved by keeping Writes a *vertical* stack;
  sharing only the hover treatment and glass styling, not the horizontal gallery layout.
- **Width literal drift** → mitigated by the shared `--composer-width` custom property.

## Migration Plan

Additive and reversible. New layout + page files and a `slug` field; the homepage section
restyles in place. Rollback is reverting the change; no data migration, no external surface.

## Open Questions

- Final reading-width for write bodies (the chatbot-width constraint applies to the homepage
  card stack; the detail-page body may want its own comfortable measure) — settle during build.
- Whether the two existing summaries get full bespoke bodies now or ship as short stubs that the
  real essays fill later — content decision for Tong.
