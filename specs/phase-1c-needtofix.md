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

7. 🟡 **Reviewer couldn't catch the overlaps** (can't see the WebGL figure). Improve the
   process so this defect class is caught mechanically. (Groundwork started in the test
   harness; not calibrated; changed nothing on the page.)

---
Plan agreed: 2–6 are all solved by **auto-placing each figure in the empty region opposite
its text** (correct by construction, no per-section guessing). 1 is a dot-sizing pass.
