## 1. Content model & shared width token

- [x] 1.1 Add `slug: string` to the `Write` interface in `src/lib/timeline.ts` and give the two
  entries slugs (`deleting-a-dependency`, `dropping-security-code`); drop reliance on `url`/"soon"
  for the homepage link.
- [x] 1.2 Add a shared `--composer-width: 54.5rem` custom property in `src/styles/backbone.css`
  and switch the chatbot composer's `max-width` to reference it (no visual change).

## 2. Homepage Writes card

- [x] 2.1 Rebuild `src/components/Writes.astro` as ONE glass card containing a numbered list
  (01, 02, 03 …); each row is an anchor to `/writes/<slug>` with a `transition:name` of
  `write-<slug>`, showing index + title + one-line summary; the whole row is the clickable link.
- [x] 2.2 Style the single card as transparent glass consistent with `Projects.astro` and put
  `data-spotlight` on it so the shared gold-flow ring, lift, and wiggle apply on hover; give each
  row a hover affordance (gold title + advancing arrow).
- [x] 2.3 Constrain the card to `var(--composer-width)` so it aligns with the chatbot composer;
  keep it a single vertical card (distinct from the horizontal Projects strip).
- [x] 2.4 Make the list internally scrollable: card `overflow: hidden` + capped `max-height`,
  inner `<ol>` `overflow-y: auto`, `overscroll-behavior: contain`, thin styled scrollbar; the
  scroll stays inside the card and the footprint is fixed.
- [x] 2.5 Verify reduced-motion and touch render the plain resting card (no spotlight/lift/wiggle).

## 3. Write detail shell & pages

- [x] 3.1 Create `src/layouts/WriteLayout.astro` wrapping `Base.astro`: hero band on the
  continuous scene, back-link to `/#writes`, constrained reading width, `title`/`dek`/`description`
  props, scroll + pointer + View Transitions wiring (as `pages/projects/[slug].astro` does), and a
  `<slot/>` for the bespoke body; share `transition:name` `write-<slug>` on the hero.
- [x] 3.2 Create one bespoke page per write under `src/pages/writes/` (one `.astro` file per slug),
  each wrapping its freeform per-topic HTML body in `<WriteLayout>`; wire the morph name to match
  the homepage row.
- [x] 3.3 (No images used in the two pieces — `src/assets/writes/<slug>/` convention reserved.)

## 4. Verify

- [x] 4.1 `astro check` + `npm run build` pass; `/writes/<slug>` pages render from static HTML.
- [x] 4.2 Row → detail navigation works; direct-loading and sharing a `/writes/<slug>` URL resolves
  correctly; back-link returns to `/#writes`.
- [x] 4.3 Injected extra rows confirm the list scrolls internally (card caps at ~62vh) with no
  change to the section footprint.
- [x] 4.4 Checked on a 390px phone viewport: card fits, list is touch-scrollable, text legible over
  the scene, no page-level horizontal overflow.
