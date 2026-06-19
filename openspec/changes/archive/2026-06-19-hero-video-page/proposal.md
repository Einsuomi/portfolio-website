## Why

The site is a clean slate — `src/` is a single placeholder page. The one fully decided beat is the
cinematic doorway-monolith lake video hero (Pair B / graded as default). Building it first lands the
recruiter-critical payload (name + role + value in ~5s) and produces a concrete, rendered anchor from
which the still-open backbone theme can finally be judged against reality instead of in the abstract.

## What Changes

- Restore the reusable scaffold from `backups/site-v1-dark-dot/` — `Base.astro` (fonts, SEO/OG,
  flash-prevention background), `TrackBeacon` + `api/track.ts` (anonymous analytics) — as the
  foundation the hero mounts on. No new theme system; the hero is a self-contained, themeable block.
- Build the **video hero**: full-viewport background video (Pair B `graded_10s.mp4`, looping, muted,
  `playsinline`) with the matching still (`7330-graded.png`) as poster + fallback.
- A single config value flips Pair B ⇄ Pair A (`final_10s.mp4` / `7330final.png`) so we can A/B the
  two grades live in the real layout.
- **Premium "by day / by night" hero copy** for Tong — name + mono role eyebrow + a poetic
  day/night line, drawn from his real profile (Data Engineer orchestrating pipelines; builder by night).
- A **type + color treatment** grounded in the ui-ux-pro-max + frontend-design skills: warm off-white
  text + a gold accent pulled from the doorway sunset glow, over a warm near-black scrim. Details in design.md.
- **Legibility + fallbacks** per the recruiter-on-a-phone rule: a gradient scrim guarantees text contrast
  over any video frame; `prefers-reduced-motion` and autoplay-fail show the static still with identical text.
- Copy the hero entry from `lib/timeline.ts` (real portfolio copy) into the rebuilt source.

Out of scope (explicitly): the backbone theme for sections below the hero, and the other sections
(about, projects, chatbot, contact). The hero block is built to be reused under whatever theme is chosen next.

## Capabilities

### New Capabilities
- `hero`: the homepage hero — its content (name, role, day/night line), the video-with-still-fallback
  background, text legibility over the video, and the reduced-motion / autoplay-fail static behavior.

### Modified Capabilities
<!-- None — clean slate, no existing specs. -->

## Impact

- **Code:** `src/pages/index.astro` (rebuilt), `src/layouts/Base.astro`, `src/components/TrackBeacon.astro`,
  `src/pages/api/track.ts`, `src/lib/timeline.ts` (restored from backup); hero video assets moved from
  `reference/options/07options/final round/` into `public/`.
- **Dependencies:** none new — Astro, GSAP, and the self-hosted fonts are already in `package.json`.
- **Infra:** analytics writes to the existing Supabase events table (`supabase/migrations/0001_events.sql`).
- **Performance:** two ~8–9 MB video files enter `public/`; watch and report LCP/weight (heavy hero is welcomed, not gated).
