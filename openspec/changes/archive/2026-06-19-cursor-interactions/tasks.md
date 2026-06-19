## 1. Shared pointer + spotlight foundation

- [x] 1.1 Add `src/scripts/pointer.ts`: one `pointermove`/`pointerenter` listener that finds the hovered `[data-spotlight]` card, caches its `getBoundingClientRect` on enter, and writes element-local `--x`/`--y`/`--xp` CSS vars on move (compositor-only, no per-card listeners).
- [x] 1.2 Import `pointer.ts` once from `src/pages/index.astro` alongside the existing `scroll.ts` import.
- [x] 1.3 Add the `[data-spotlight]` card treatment to `src/styles/backbone.css`: gold radial-gradient border masked to the border box (gold via `--gold`), positioned by the pointer vars; `pointer-events: none` on the gradient layer.

## 2. Card hover micro-interaction

- [x] 2.1 Add the wiggle keyframe + hover lift to `backbone.css`, gated behind `@media (hover: hover) and (prefers-reduced-motion: no-preference)`; transform-only (`rotate` ~1.5°, `translateY` lift, soft shadow), one-shot on hover-enter, settle while hovered.
- [x] 2.2 Add `data-spotlight` to the Experience `.rung` cards in `src/components/Experience.astro` and confirm the spotlight + wiggle + lift render over the sticky scene.
- [x] 2.3 Add `data-spotlight` to the Projects `.card` cards in `src/components/Projects.astro` and confirm hover effects do not interfere with the horizontal drag.

## 3. Boundary-bar gold flow

- [x] 3.1 Add a behind-the-names gold gradient glow layer to `src/components/HeroBar.astro` (`::before` or absolute child on `.bar`): gold/transparent `repeating-linear-gradient`, masked top-to-center, animated via `background-position`; z-index below `.bar__track`.
- [x] 3.2 Extend the existing `prefers-reduced-motion` block in `HeroBar.astro` to also stop the glow animation; confirm cert names stay crisp and readable.

## 4. Launcher → "Talk" + shimmer

- [x] 4.1 In `src/components/ChatLauncher.astro`, change the label text `Ask` → `Talk` and update the `aria-label` to match.
- [x] 4.2 Add a gold shimmer sweep + soft pulse to `.launcher`, behind `@media (prefers-reduced-motion: no-preference)`; verify it draws the eye without obscuring content and degrades to a plain pill under reduced motion.

## 5. Verify & polish

- [x] 5.1 Run `npm run dev` and check desktop hover (spotlight tracks, wiggle/lift restrained), touch emulation (no hover engaged, drag/scroll/tap intact), and `prefers-reduced-motion` (no spotlight anim, no wiggle, no glow, no shimmer).
- [x] 5.2 Confirm no-JS path: cards/bar/launcher render fully styled and readable with JS disabled.
- [x] 5.3 Run `astro check` and confirm no new type/syntax errors; confirm no new dependencies were added to `package.json`.
- [x] 5.4 Tune amplitudes against the taste bar (wiggle ≤ ~1.5°, lift a few px, glow/shimmer subtle) so the motion stays cinematic, not toy-like.
