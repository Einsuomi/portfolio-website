## 1. Tokens & font loading (site-shell)

- [x] 1.1 Add the Fraunces variable font dependency (`@fontsource-variable/fraunces`) and import only the needed axis/weight in `src/layouts/Base.astro` with `font-display: swap`
- [x] 1.2 Add a `--font-luxe` token (Fraunces, with the existing serif as fallback) alongside the font tokens in `src/styles/backbone.css`; confirm no architectural/backdrop/order edits
- [x] 1.3 Add a glass-contrast helper token/utility (a local per-card dim) that components can apply over the scene

## 2. Visual-language rules

- [x] 2.1 Verify the duality mapping is applied consistently: serif identity (hero, Experience) vs Anton machine (Projects, Chatbot); fix any ad-hoc voice usage that violates it
- [x] 2.2 Apply the gold-scarcity rule across sections (audit each section viewport for >1 gold beat) — Experience year demoted from gold to cream
- [x] 2.3 Apply the glass-contrast rule wherever glass sits over the scene (cards, input bar)

## 3. Hero

- [x] 3.1 Swap `.hero__name` in `src/pages/index.astro` from Anton to Fraunces (`--font-luxe`); set luxury spaced-caps tracking
- [x] 3.2 Push extreme-minimalism pass on the hero (spacing/scale), keeping eyebrow, day/night line, ghost "Talk" launcher, scene, and scrim intact
- [x] 3.3 Add the mobile reflow for the wordmark (reduced tracking/size step) so spaced caps don't break; verify at 390px with no horizontal overflow
- [x] 3.4 Confirm the hero entrance animation + reduced-motion / autoplay-blocked fallbacks still work with the new wordmark

## 4. Experience

- [x] 4.1 Restyle rungs as crystal-clear glass cards with the gold-flow accent seam
- [x] 4.2 Set year numerals in Fraunces (`--font-luxe`); keyword stays Anton (duality within the card)
- [x] 4.3 Apply the per-card scene dim so every rung's text (incl. the large year numeral) clears 4.5:1 — fix the borderline "2021" case
- [x] 4.4 Verify the mobile single-column / reduced-motion fallback still reads cleanly

## 5. Projects

- [x] 5.1 Make cards smaller / more breathable with more dark negative space (gallery feel)
- [x] 5.2 Render a large semi-opaque ghosted index number (01, 02, …) per card, distinct from Experience year numerals
- [x] 5.3 Keep card titles in Anton; confirm horizontal-scroll stays self-contained (no page-level overflow) and touch-friendly

## 6. Chatbot / Ask

- [x] 6.1 Restyle the composer as a glass input bar; keep it inert with a non-deceptive "coming soon" state
- [x] 6.2 Replace the differentiator line with the confirmed copy: "An assistant that knows the reasoning, not just the résumé — my pipelines, my architecture, the trade-offs behind each decision. Ask it what a CV can't tell you."
- [x] 6.3 Apply gold scarcity: keep only the input glow gold; demote "ASK." emphasis and the "Coming soon" badge to a quiet non-gold treatment

## 7. Verify & deliver

- [x] 7.1 `npm run build` + `astro check` pass
- [x] 7.2 Manual check on desktop and 390px: legibility (4.5:1 on glass), no accidental horizontal overflow, reduced-motion + autoplay-blocked + no-JS fallbacks intact
- [x] 7.3 Confirm LCP/JS weight impact of Fraunces is acceptable; report the numbers (68KB latin subset, font-display: swap, non-blocking)
- [x] 7.4 Open a PR from `feat/premium-restyle` for Tong to review and merge — PR #12

## 8. Review revisions (2026-06-20)

- [x] 8.1 Hero: reduce wordmark scale/tracking so "TONG NIE" stays one line in the left region, clear of the doorway
- [x] 8.2 Marquee: lead each cycle with a gold "CERTIFIED —" token and reverse drift to right→left
- [x] 8.3 Experience: reverse emphasis — keyword as bold Anton front title, year as large semi-opaque ghosted serif watermark behind (like the Projects index)
- [x] 8.4 Glass: make the shared crystal glass clearer/brighter (lighter dim + luminous edge) while holding 4.5:1 — applies to Experience + Projects
- [x] 8.5 Experience: reduce card height (more compact, livelier)
- [x] 8.6 Projects: top-align the "PROJECTS · BUILT" kicker (move it up)
- [x] 8.7 Chatbot: kicker → "BEYOND THE CV"; "DON'T JUST READ — ASK." on one line; keep content left-anchored (door/man visible); deepen moody backdrop + strengthen input gold glow
- [x] 8.8 Re-verify desktop + 390px: legibility, no overflow, fallbacks intact
- [x] 8.9 Asset (no code): 4-point watermark — DECISION: keep the current scene assets as-is, no regeneration/retouch (Tong's call, 2026-06-20)

## 9. Review refinements (2026-06-20, round 3)

- [x] 9.1 Hero: pin eyebrow top-left, lift name + value block up to ~ the doorway top (no longer bottom-anchored)
- [x] 9.2 Experience: year numeral 1–2 steps smaller, faint fill + thin gold outline stroke; same outline applied to the Projects index numbers
- [x] 9.3 Experience: skill tags on a single left-aligned row (no wrap)
- [x] 9.4 Chatbot: widen the block so the differentiator line is ~2 lines; bump the headline up a step; "ask" → gold "talk."; keep mobile-safe via clamp
- [x] 9.5 Add `overflow-x: clip` on html/body to kill a 1px sub-pixel page overflow without breaking the sticky-stack (verified Projects still pins)
- [x] 9.6 Re-verify desktop + 390px: no overflow, sticky-stack intact, legibility holds

## 10. Review refinements (2026-06-20, round 4)

- [x] 10.1 Talk: widen the input bar to match the widest text line above
- [x] 10.2 Experience year + Projects index: one step smaller
- [x] 10.3 Projects: move the "PROJECTS · BUILT" kicker up further (margin-top 0)
- [x] 10.4 Projects: skill tags on a single left-aligned row; widen cards + shrink tags so the 5-tag card fits without clipping
- [x] 10.5 All cards (Experience + Projects): transparent background (frosted blur + edge only), gold flow kept
- [x] 10.6 Experience: equal ladder column widths (min-width:0), narrower cards moved right, intro gets more room / fewer lines
- [x] 10.7 Re-verify desktop + 390px: no overflow, no tag clipping, sticky-stack intact

## 11. Review refinements (2026-06-20, round 5)

- [x] 11.1 Projects: drop the card strip down a bit below the kicker (margin-top)
- [x] 11.2 Tags left-alignment: remove the default `<ul>` 40px indent (padding:0) on both `.rung__stack` and `.card__stack` so tags line up flush with the card text; shrink Experience tags so 3 fit the narrower cards without clipping (verified tagLeft === textLeft on every card)
- [x] 11.3 Talk: input right edge now aligns with the widest text line — fixed the content-box overflow with `box-sizing: border-box` + tuned max-width (verified −2px)
- [x] 11.4 Re-verify desktop + 390px: no overflow, tags flush-left + no clipping, input aligned
