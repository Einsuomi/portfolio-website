# Need to fix — dark homepage (Phase 1c), from Tong's live review 2026-06-15

Status legend: ❌ not done · 🟡 partial · ✅ done

1. ✅ **Dot sizes.** Ambient dots across the whole screen are too small — make them bigger,
   like the dots forming the 3D figures. Dots should be **varied sizes (small + big), not
   all the same**. (Reference: usta.agency live — varied sizes, bold dense figure.)
   → Density pass landed 2026-06-17 (see "Round A2 progress" below). Figures read bold/dense;
   varied size tail; ambient bigger but faint. (Hero globe uses a per-shape finer dot size.)

2. ✅ **PostNord** — figure overlaps the text. Move the figure **more right and down**.
   → Now placed right, opposite the left-aligned text; the text overlap (the original bug)
   is gone. Vertical is centred (not "down") — see note under item 5 on why that's fine.

3. ✅ **Basware** — figure should be **left and up** a bit. → Lands left + up.

4. 🟡 **Projects** — figure **right and down**. → Placed right (correct side); vertical is
   centred. Re-judge "down" with Tong at the taste gate.

5. ✅ **Writes** — figure **up and left**. → Lands left + slightly high = up-and-left.
   Tong confirmed `fixed-writes.png` "seems fine" on 2026-06-17.

6. ✅ **Talk to me** — input box is centered AND figure is centered → collision. Move the
   figure to the **left or right side**. → Verified 2026-06-17: figure sits on the right,
   title + input centred, no collision (`fig-bot.png`).

---
Plan agreed (2026-06-15): 2–6 are all solved by **auto-placing each figure in the empty
region opposite its text** (correct by construction, no per-section guessing). 1 is a
dot-sizing pass.

================================================================================
## Round A2 progress + decisions — 2026-06-17 session
================================================================================

### ✅ ROOT CAUSE of the figure-misplacement found and FIXED (the thing several rounds missed)

The placement maths (`recomputePlacements`) was sound — it computes a **screen/world-space**
target for the empty region. The bug was the **coordinate frame the offset is applied in**:

- The figure offset (`uOffsetX/uOffsetY`) was added to the particle position **in object
  space, BEFORE `modelViewMatrix`** in the vertex shader.
- The whole cloud is spun by `points.rotation` — `scrollSpin` (0 → 90° down the page) plus
  cursor parallax. So the offset got **rotated along with the figure**.
- Measured live at the Writes beat: `rotZ ≈ 73°`, `oy = 0`. A pure *leftward* offset
  (`ox ≈ -2.05`) gets spun ~73° → lands **down-and-left**, i.e. too low and not left enough.
  That is exactly Tong's "needs to be up and left," and the **tilt** seen in `fit-writes.png`.
- The Round A2 spec (item 7) originally said to tween `points.position` (a world-space
  translation, applied AFTER rotation → never spun). The implementation diverged to a
  per-particle shader offset (needed so ambient dots are excluded from the move), and that
  divergence reintroduced the rotation coupling.

**Fix (in `src/scripts/dark-scene.ts`, UNCOMMITTED):** new uniform `uFigRotInv` (a `mat3`,
the inverse of the cloud's current rotation, refreshed every frame in `tick()`). The shader
pre-multiplies the world-space offset by it, so when `modelViewMatrix` re-applies the
rotation the figure lands exactly on its world spot. Net effect: **the figure spins in place
but stays pinned to its placement** — matches Tong's "keep spin, decouple placement" choice.
Verified across hero/postnord/basware/projects/writes: all now sit on the correct side, none
flung onto the text.

### Decisions taken this session (Tong)

- **Spin:** KEEP the scroll-spin as a flourish; decouple placement from it (done above).
- **2D empty-spot finder:** DROPPED for now. It was a secondary refinement, not the root
  cause. The existing 4-strip finder (largest of left/right/top/bottom strips, centred) is
  good enough after the rotation fix. Re-open only if a beat still looks off.
- **verify-ui.mjs:** SET ASIDE during visual tuning — it answers a narrow yes/no ("does
  figure mass occlude the text rect"), which is noise for aesthetic placement calls. The
  mechanism is fine; run it once at the END as a regression gate before any PR.
- **Vertical "high" look on the wordmark beats** (postnord/basware) is the **wordmark's
  wide backing-field centroid**, not a placement bug (`oy=0` = centred). Those wordmarks are
  being replaced by abstract forms anyway (scene-motion spec Round B, item 6) → don't tune.

### ✅ "Figure should be tightest/clearest when the text is centred" — NOT a bug

Measured `uScatterMix` while scrolling through the Writes centre:
`0.74 → 0.41 → 0 → 0.41 → 0.74` (symmetric, exactly **0 at centre**). So the scatter timing
already makes the figure tightest at each section's rest point. What made it *look*
un-concentrated was (a) the rotation tilt (now fixed) and (b) the figures being too sparse →
the density pass below.

### 🟡 Density pass — first pass landed (item 1 + scene-motion item 8), UNCOMMITTED

Shader changes in `dark-scene.ts`:
- base `uSize`: `22 → 28` (desktop), `17 → 21` (mobile)
- size variance: `mix(0.4, 2.8, pow(aRand,3.0))` → `mix(0.45, 4.2, pow(aRand,2.4))`
  (stronger big-dot tail = usta's "few big, many small")
- ambient dot size: `0.5× → 0.72×` (bigger per item 1, but kept faint via low alpha so the
  figure still dominates per item 8)

Result: figures read bold/dense/clear; scatter reads as a varied starfield; text still
legible over scatter. **OPEN taste call (unanswered):** the full-size **hero globe now reads
quite solid** — options offered were: open it up a touch (my lean) / keep bold / push bolder.
Tong pivoted to the new issues below instead of answering — revisit.

================================================================================
## NEW issues raised 2026-06-17 (from Tong's real Mac screenshot @ 1437×698)
================================================================================

Tong's laptop viewport is **short** (≈1437×698). That short height is what exposed two
layout bugs my 1440×900 test window was hiding. **These must be fixed RESPONSIVELY, not tuned
to 1437×698** — verify across a matrix: 1437×698 (short laptop), 1512×982 (14"), 1920×1080
(15.6"/1080p), 2560×1440 (27"), 390×844 (phone). CLAUDE.md already requires it work to phone.

7. ✅ **Hero globe = recognizable EARTH — Western Europe centred, Luxembourg lit.** Done
   2026-06-17 + **locked by Tong** ("lock it"). Replaced the generic dot-sphere with a real
   Natural-Earth coastline: rasterize `world-atlas` land-110m TopoJSON (`topojson-client`)
   onto an equirectangular canvas, sample it onto a fibonacci sphere; continents dense,
   ocean ~empty, back hemisphere faded (`uBackFade`), oriented so W. Europe faces the camera
   with Europe + Luxembourg lit blue. New deps: `world-atlas`, `topojson-client` (bundled in
   the already-lazy scene chunk). Honest limit (Tong accepted): at globe scale it reads as
   "real Earth with W. Europe glowing," not a textbook-crisp map — the option-1→3 convergence.

8. ✅ **Globe overflow** — fixed 2026-06-17. Added a **viewport-fit clamp** in
   `recomputePlacements`: shrink scale if the gap let the figure grow past the screen, then
   clamp the centre so the scaled figure (+ dot-bloom pad) stays inside the margins on ANY
   aspect ratio. Verified globe fits at 1437×698 (`hero-698-final.png`).

9. ✅ **Hero body text fit** — fixed 2026-06-17. Trimmed the hero's vertical budget (title
   clamp `min(13vw,17vh)/11rem → min(12vw,15vh)/9rem`, hero padding `8/6rem → 6/5rem`).
   Verified responsive: fits with margin from 620px (52px) → 698px (78px) → 1080px tall.

10. ✅ **Work-experience figures → pipeline topologies** — built 2026-06-17, replacing the
    wordmarks (`makeWordmark` removed). The seven figures read as one pipeline story:
    - **Neste** — `makeNesteStream`: green stream forking into two channels (`fig-neste.png`).
    - **PostNord** — `makePostnordNetwork`: hub nodes + blue packet-streams (`fig-postnord.png`).
    - **Basware** — `makeBaswareLedger`: amber ledger grid settling row-by-row (`fig-basware.png`).
    Themed accents; placed opposite their text; robust to text-length (no canvas/text sampling).

### Responsiveness is now a first-class requirement (Tong)
Don't fix for one screen. Every placement/scale/typography fix must hold across the matrix
above (14" / 15.6" / 27" / ultrawide / phone). Tong's short laptop is just the stress case.

================================================================================
## Remaining / next session
================================================================================

- [x] **`verify-ui` regression gate** — run 2026-06-17. Caught a real bug it was built to
      catch: **mobile (390×844) live hero — the Earth globe overlapped the hero text 26.67%**
      (gate 7%). Cause: the #8 viewport-fit clamp re-centred the figure symmetrically about
      the SCREEN centre, but the full-width mobile hero text *contains* the screen centre, so
      the clamp dragged the globe onto the words. Fix (`dark-scene.ts recomputePlacements`):
      clamp the figure centre to the chosen empty STRIP (gap box), not to screen centre, and
      lower `SCALE_MIN` 0.45→0.3 so a tall figure can shrink to fit a narrow mobile strip
      instead of being floored too big. Re-run: **all 4 passes PASS, mobile hero 26.67%→0%**,
      desktop unchanged, `astro check` 0 errors. Bot/all other beats clear.
- [x] Full **responsive matrix pass** — run 2026-06-17 by temporarily widening `verify-ui`'s
      VIEWPORTS to the full matrix [1437×698, 1512×982, 1920×1080, 2560×1440, 390×844] × both
      modes, then reverting. **All 10 passes PASS**: hero overlap 0% on every viewport, hero
      readable t=1s/5s everywhere, no text collisions, no horizontal overflow, no axe
      critical/serious, no console/request errors. Two beats showed single edge-clip cells
      (postnord 0.17%, projects 0.14%) — far under the 7% gate.
- [ ] **Item 4 (Projects "down")** — figure is on the correct side, vertical centred; minor
      taste judgement, revisit only if Tong flags it.
- [x] **Cleanup**: removed all 28 throwaway diagnostic PNGs from the repo root (~20MB;
      untracked, none referenced by the site).
- [x] `npm run build` check + leak check — both run 2026-06-17: build exit 0 (Vercel adapter,
      no errors), `check-leaks` "No leaks found." Ready for the PR.
- 🟡 **Cursor (scene-motion Round B item 5)** — conservative shrink applied 2026-06-17:
      CSS hover swell `64px → 42px` (`index.astro`), shader repulsion void `radius 1.4 → 0.7`
      (`dark-scene.ts`). `astro check` 0 errors. **Open taste call reserved for Tong (spec
      "test first"):** judge live, then decide whether the small repulsion void STAYS or is
      removed entirely (usta = one restrained cursor effect, not two). Needs a real pointer —
      can't be judged headlessly.

### Uncommitted code state (nothing committed this session)
`src/scripts/dark-scene.ts`: rotation-decoupled placement (`uFigRotInv`); density pass
(size/variance/ambient); **real-coastline Earth** (`isLand`/`buildLandMask` via world-atlas
+ topojson-client, `uBackFade`, per-shape `uDotScale`); **viewport-fit placement clamp** (#8);
**three pipeline figures** (`makeNesteStream`/`makePostnordNetwork`/`makeBaswareLedger`,
`makeWordmark` removed). `src/pages/index.astro`: hero vertical-budget trim (#9).
`package.json`: added `world-atlas`, `topojson-client`. The temporary `window.__dbg` hook was
added for measurement and REMOVED. `astro check` = 0 errors.
