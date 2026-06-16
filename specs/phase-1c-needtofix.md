# Need to fix — dark homepage (Phase 1c), from Tong's live review 2026-06-15

Status legend: ❌ not done · 🟡 partial · ✅ done

1. ❌ **Dot sizes.** Ambient dots across the whole screen are too small — make them bigger,
   like the dots forming the 3D figures. Dots should be **varied sizes (small + big), not
   all the same**. (Reference: usta.agency live — varied sizes, bold dense figure.)

2. ❌ **PostNord** — figure overlaps the text. Move the figure **more right and down**.
   (How much: decide by placing it in the empty space opposite the text, not by guessing.)

3. ❌ **Basware** — figure should be **left and up** a bit.

4. ❌ **Projects** — figure **right and down**.

5. ❌ **Writes** — figure **up and left**.

6. ❌ **Talk to me** — input box is centered AND figure is centered → collision. Move the
   figure to the **left or right side**.

7. ✅ **Reviewer couldn't catch the overlaps** (can't see the WebGL figure) → now caught
   mechanically. `verify-ui` reads the WebGL canvas per beat and asserts the figure mass
   doesn't occlude the text rect (desktop + mobile, fails loudly). Calibrated 2026-06-16.
   Root cause found + fixed: the old check screenshotted `#scene` *with the DOM text
   composited on top*, so it scored the headings ("TONG NIE"…) as figure mass — which is
   why Round A's overlaps slipped past it. Fix: hide the overlay DOM during canvas capture,
   and isolate the figure via a density-grid + ambient-baseline (the screen-filling ambient
   field defeated the old per-pixel measure). Gate = occlusion-only (Tong's call): currently
   fails **bot** (18.4% — centred figure on centred input), passes the rest; flips fully
   green once Round A2 placement moves the bot figure off-centre.

---
Plan agreed: 2–6 are all solved by **auto-placing each figure in the empty region opposite
its text** (correct by construction, no per-section guessing). 1 is a dot-sizing pass.
