## Context

The backbone build (hero → marquee → Experience → Projects → Writes → Chatbot) is live and functional, riding a continuous fixed scene backdrop. It works but reads as one undifferentiated voice and risks looking templated. Tong's overnight mockups define a more premium target: extreme minimalism, luxury serif, crystal glass, more negative space. This is a **restyle pass, not a rebuild** — the backbone architecture (fixed scene, sticky-stack, section order, scroll engine) is fixed and untouched. The current hero name is condensed Anton (`index.astro:165`); the section components already split serif/Anton/mono ad hoc with no governing rule, which is the inconsistency this change resolves.

## Goals / Non-Goals

**Goals:**
- Establish an enforced serif/condensed typographic duality (identity vs machine) as the site's organizing concept.
- Add Fraunces as the luxury serif identity voice; flip the hero wordmark to it with a safe mobile reflow.
- Make Experience/Projects/Chatbot read as premium: crystal glass with guaranteed contrast, breathable cards, scarce gold, glass input.
- Restore + rephrase the chatbot differentiator line.
- Hold the CLAUDE.md delivery floor: real-HTML content, mobile-readable, reduced-motion + autoplay/WebGL-fail fallbacks.

**Non-Goals:**
- No change to backbone structure, the fixed-scene backdrop system, section order, or the Lenis/ScrollTrigger engine.
- No change to cursor/spotlight or preloader/refresh-intro behavior.
- No chatbot backend (stays a non-deceptive "coming soon" shell).
- No content/copy changes beyond the chatbot differentiator line.

## Decisions

- **Type duality over single-voice.** Map serif → identity (hero, Experience), Anton → machine (Projects, Chatbot). *Why over single-voice:* the duality maps onto the hero line "same machine, different rules," turning a coherence risk into the concept. Alternatives considered: all-serif editorial (too quiet/classic), all-condensed tech (loses the luxury hero). Rejected both.
- **Fraunces for the hero wordmark.** A variable high-contrast Didone with an `opsz` optical-size axis that shines at display sizes; warmer/more human than Playfair. *Why a new font:* the loaded Instrument Serif is flatter and won't carry luxury spaced-caps weight. Load via `@fontsource-variable/fraunces` (consistent with the existing fontsource setup in `Base.astro`), import only the weight(s)/axis needed to limit added bytes. Keep Instrument Serif for softer serif body where it already reads well.
- **Token-only shell touch.** Add `--font-luxe` (Fraunces) in `backbone.css` next to the existing font tokens; hero CSS in `index.astro` currently hardcodes families, so swap its `.hero__name` family to Fraunces directly. No structural edits to the backbone.
- **Glass contrast via a per-card dim, not a global scrim.** Each glass card composites a local dim layer (e.g. a darker translucent base behind the blur) so text clears 4.5:1 regardless of the scene patch beneath — fixes the borderline "2021" rung without darkening the whole scene. Alternative (heavier global scrim) rejected: it would flatten the cinematic backdrop the site depends on.
- **Gold scarcity as a rule.** One gold beat per section viewport. In Chatbot: keep the input glow gold; demote "ASK." emphasis and the "Coming soon" badge to a quiet ink/line treatment.
- **Two distinct big-number systems.** Experience year numerals (serif, gold) vs Projects ghosted index (Anton, semi-opaque ink) — deliberately different so an index never reads as a date.

## Risks / Trade-offs

- **Added font weight hurts LCP** → import only the needed Fraunces axis/weight via fontsource, `font-display: swap`, and rely on the existing serif fallback; LCP is watched/reported per CLAUDE.md, not a hard gate.
- **Spaced-caps wordmark overflowing on small phones** → deliberate mobile reflow (reduced tracking + size step), verified at 390px; covered by the hero mobile-overflow requirement.
- **Glass dim muddying the cinematic scene** → keep the dim local to cards and as light as the 4.5:1 target allows, preserving the backdrop everywhere else.
- **Duality drifting back to ad-hoc mixing over time** → codified in the new `visual-language` spec so it's versioned and reviewable, not tribal knowledge.

## Migration Plan

Pure front-end restyle on `feat/premium-restyle`; no data/runtime migration. Rollback = revert the branch. Verify locally with `npm run dev` (desktop + 390px), confirm reduced-motion and autoplay-blocked paths still degrade cleanly, then PR for Tong to review/merge.

## Open Questions

- Exact Fraunces optical-size/weight for the wordmark (tune visually against the mockup during apply).
- Whether the gold-flow seam around Experience glass cards is a static border-gradient or animated; default to matching the existing HeroBar gold-flow treatment unless it costs too much.
