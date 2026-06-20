## Why

The backbone build works, but reads as one undifferentiated voice and risks looking templated rather than premium. Tong's overnight mockups point at a higher-end direction: extreme minimalism, luxury serif typography, crystal-clear glass, and more breathing room. The single biggest lever is typographic coherence — today the hero name is condensed Anton while sections mix serif and condensed without a rule, which reads as inconsistent instead of authored. This change converts that risk into the concept.

## What Changes

- **Typographic duality (the concept).** Establish an enforced two-voice system mapping to the hero line *"same machine, different rules"*: **serif = identity** beats (hero wordmark, Experience), **condensed Anton = machine/product** beats (Projects, the assistant). The mix becomes intentional, not accidental.
- **Hero.** Replace the Anton hero wordmark with a **Fraunces** high-contrast Didone for a luxury spaced-caps "TONG NIE", with a deliberate mobile reflow so spaced caps don't break. Push toward extreme minimalism; keep the ghost "Talk" launcher and the existing scene/scrim.
- **Experience.** Crystal-clear glass cards carrying the existing gold-flow seam; Fraunces year numerals/titles; fix the borderline low-contrast (e.g. "2021") by dimming the backdrop beneath each card so text stays legible.
- **Projects.** Smaller, more breathable cards with more dark negative space; Anton titles; large semi-opaque **ghosted index numbers (01, 02)** kept visually distinct from the Experience year numerals (index vs date, two deliberate systems).
- **Chatbot / Ask.** "DON'T JUST READ — ASK." in Anton over a glass input bar; **gold-scarcity rule** — keep the input glow as the single gold beat, quiet "ASK." and "COMING SOON". Restore and rephrase the differentiator line to: *"An assistant that knows the reasoning, not just the résumé — my pipelines, my architecture, the trade-offs behind each decision. Ask it what a CV can't tell you."*
- **Tokens & rules.** Add a Fraunces font token in `backbone.css` (font tokens only — no architectural change), and codify gold-scarcity and glass-contrast as enforced rules.

Out of scope: backbone structure, the fixed scene/backdrop system, section order, and cursor/preloader behavior — none change.

## Capabilities

### New Capabilities
- `visual-language`: the cross-cutting design-system rules that govern the whole site — the serif/condensed typographic duality and its beat-to-voice mapping, the gold-scarcity rule (gold stays a scarce accent, not repeated within a viewport), and the glass-contrast rule (glass over the photographic backdrop must dim the scene beneath enough for legible text). Durable, versioned, testable so these calls aren't re-litigated.

### Modified Capabilities
- `site-shell`: add the Fraunces font token and load the family; expose the typographic-duality token mapping. Font-token plumbing only — no change to the fixed-scene architecture or section order.
- `hero`: hero wordmark switches from condensed Anton to the Fraunces luxury serif (identity voice) with a mobile reflow for spaced caps; extreme-minimalism pass.
- `experience-timeline`: crystal-clear glass cards with gold-flow seam, Fraunces numerals/titles, and a backdrop-dim under each card to guarantee text contrast.
- `projects-gallery`: smaller, more breathable cards with greater negative space, Anton titles, and large semi-opaque ghosted index numbers distinct from year numerals.
- `chatbot-entry`: restored + rephrased differentiator line, glass input bar, and the gold-scarcity rule applied (single gold beat).

## Revisions (review 2026-06-20)

After the first implementation, Tong reviewed the live build and asked for these adjustments (folded into this same change):

- **Hero wordmark** — the Fraunces caps were too wide and overlapped the central doorway. Reduce scale/tracking so "TONG NIE" stays on one line within the left region, clear of the focal subject.
- **Boundary marquee** — lead each cycle with a gold `CERTIFIED —` token (so the list reads as certifications) and reverse drift to right→left.
- **Experience cards** — **reverse the year/keyword emphasis**: the keyword (FOUNDATIONS) becomes the bold front title; the year (2021) drops to a large semi-opaque ghosted watermark behind it — the same device as the Projects index, unifying the two card languages. Glass becomes clearer/brighter (lighter dim + luminous edge) per ref, cards shorter/smaller, livelier.
- **Projects** — move the "PROJECTS · BUILT" kicker up (top-align in the pinned panel); apply the same clearer crystal glass.
- **Chatbot/Ask** — replace the kicker "The differentiator" with "BEYOND THE CV"; set "DON'T JUST READ — ASK." on a single line; keep the block left-anchored (not full-width) so the man + doorway stay visible; deepen the moody backdrop and strengthen the gold glow on the input pill.
- **Scene watermark** — a 4-point AI-generation sparkle is baked into the hero scene asset (bottom-right) and shows across all sections via the shared fixed backdrop. Remove by retouching/cropping the assets (`graded-loop.jpg` still, `graded_loop.mp4`, poster, Pair A assets). Asset task, not code.

### Round 3 (further review)

- **Hero copy** — eyebrow pinned top-left again; name + value lifted up to the doorway level (not bottom-anchored).
- **Experience** — year numeral smaller with a thin gold outline stroke (ghost reads crisp, not blurry); same stroke on the Projects index numbers; skill tags forced onto one left-aligned row.
- **Chatbot** — block widened so the differentiator line is ~2 lines; headline bumped up a step; headline emphasis word changed from "ask" to a **gold "talk."** (reverses the earlier gold-scarcity call for this one word — Tong's choice, ties it to the Talk launcher).
- **Overflow guard** — `overflow-x: clip` on html/body removes a 1px sub-pixel page overflow introduced by the wider/realigned content, without breaking the sticky-stack.

### Round 4 (further review)

- **Transparent cards** — both Experience rungs and Project cards drop their dark fill entirely; they become a frosted blur + thin edge with the gold-flow ring, the scene reading through. Legibility now rides the section scrim + text-shadow + blur (revises the earlier "glass dim guarantees 4.5:1" requirement — worth a legibility re-check on the lightest section).
- **Experience** — equal ladder column widths (was left-wider due to content forcing the track; `min-width:0` fixes it), narrower and shifted right, intro gets more room / fewer lines; year numeral a step smaller.
- **Projects** — index a step smaller; kicker moved further up; skill tags forced onto one left-aligned row, cards widened + tags shrunk so even the 5-tag card fits without clipping.
- **Talk** — input bar widened to match the widest text line above.

## Impact

- **Components:** `src/pages/index.astro` (hero), `src/components/Experience.astro`, `src/components/Projects.astro`, `src/components/Chatbot.astro`.
- **Styles/tokens:** `src/styles/backbone.css` (font tokens, glass-contrast token), `src/layouts/Base.astro` (font import).
- **Dependencies:** add the Fraunces font (`@fontsource-variable/fraunces` or equivalent) — one new font family; watch added weight against the LCP/JS targets.
- **Delivery floor (unchanged, must hold):** real-HTML content, mobile-readable, reduced-motion and WebGL/autoplay-fail fallbacks all preserved.
