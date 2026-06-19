## 1. Restore scaffold from backup

- [x] 1.1 Copy `Base.astro`, `TrackBeacon.astro`, `api/track.ts`, `lib/timeline.ts` from `backups/site-v1-dark-dot/src/` into `src/` (`content.config.ts` not needed — hero uses no content collections)
- [x] 1.2 Confirm the `@fontsource` font imports in `Base.astro` resolve (Anton, JetBrains Mono, Space Grotesk already in `package.json`)
- [x] 1.3 Run `npm run build` to confirm the restored scaffold compiles before adding the hero

## 2. Hero assets

- [x] 2.1 Move Pair B (`graded_10s.mp4`, `7330-graded.png`) and Pair A (`final_10s.mp4`, `7330final.png`) into `public/hero/`
- [x] 2.2 Loop seamlessness + still-match confirmed per prior asset validation (these are the finalized pairs); not re-frame-compared here

## 3. Build the hero

- [x] 3.1 Rebuilt `src/pages/index.astro` on restored `Base.astro` (`version="dark"`) with a `<section class="hero">`
- [x] 3.2 Added `HERO_PAIR` config constant mapping `'A'|'B'` → `{ video, still }`, default `'B'`
- [x] 3.3 Background `<video>` (muted/loop/playsinline/preload=auto/poster) — `autoplay` attribute intentionally dropped; playback started via JS only when motion is allowed (see 4.1/4.2)
- [x] 3.4 Hero text in real HTML: mono eyebrow (`Building in public — Western Europe`), Anton name, Space Grotesk day/night line
- [x] 3.5 Applied type scale + color tokens (`--hero-ink`, `--hero-gold`, `--hero-scrim`) and the bottom gradient scrim
- [x] 3.6 Top-right menu icon — present, focusable, clickable placeholder; no top bar, no panel/animation yet

## 4. Legibility, fallbacks, motion

- [x] 4.1 `prefers-reduced-motion`: video isn't played → poster (still) shown; no entrance stagger
- [x] 4.2 Autoplay-fail path: `video.play()` rejection caught → poster stays, text unchanged
- [x] 4.3 GSAP entrance stagger (eyebrow → name → line), gated on motion preference
- [x] 4.4 Scrim sized + name text-shadow added; legibility confirmed visually at desktop + 390px. NOTE: numeric 4.5:1 on the literal brightest bloom frame not yet measured — gold eyebrow over bright sky is the spot to re-check

## 5. Verify

- [x] 5.1 `npm run build` clean; `astro check` 0 errors. Payload note: video ~8 MB + **poster PNGs 12–14 MB** (LCP risk — see follow-up)
- [x] 5.2 390px phone: text fits, legible, no page-level horizontal overflow (scrollWidth == clientWidth)
- [x] 5.3 Name + eyebrow + line all present in `dist/client/index.html` (no-JS safe)
- [x] 5.4 `npm run check-leaks` on the build → "No leaks found."
