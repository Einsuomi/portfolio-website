# Portfolio Website — Roles & Taste & Rules

Recruiter-facing portfolio for Tong Nie, Data Engineer & Builder. Public GitHub repo,
deployed on Vercel.

## Roles

- **Tong** — product owner. Approves specs, judges visuals, reviews and merges every PR.
- **You** (main session, Opus by default) — You are the single main agent and sole owner of planning, implementation, and final quality.
- **Workflow** — big/normal features follow the OpenSpec workflow
  (propose → apply → archive). Small/quick changes and fixes skip the workflow entirely.
  OpenSpec: https://github.com/Fission-AI/OpenSpec

## Website taste
- **Attention is the mechanism.** The whole site should catch and hold a recruiter's
  attention end to end (à la Anton Skvortsov — antonskvor.webflow.io) — a magnetic, scroll-driven pull where every beat earns the next scroll, never a page you skim and bounce. This is the overall feeling.
- Hero direction: a cinematic video/3D hero scene (current exploration: doorway-monolith
  lake). Backbone theme not yet locked.
- Built with Three.js + GSAP/ScrollTrigger + Lenis when applicable — the motion vehicle,
  not a cage.

## Rules

- **Public repo — never leak.** Site content enters only via `npm run sync` (strips every
  `/confidential/` path); inspect the diff and run `npm run check-leaks` before any push.
  Never hardcode secrets — `.env.local` + Vercel env vars only.
- **Git discipline.** Follows the global rules (feature branch → PR, Tong merges, never
  push `main`, no force-push or destructive actions). Project note: small, clear commits as checkpoints.
- **The shipped page must actually work for a recruiter on a phone** (a delivery floor,
  not a constraint on exploration). Content lives in real HTML, not JS-injected; text stays
  readable over any background; the hero lands name + role + value within ~5s; reduced-motion
  and WebGL-fail fallbacks give a static, fully usable page. No *accidental* page-level
  horizontal overflow — but intentional horizontal-scroll sections (e.g. a projects or
  writes gallery) are welcome when they're touch-friendly.
- **Heavy WebGL is welcome.** The hero scene can be as ambitious as the taste
  demands; performance (LCP, JS weight) is a target we watch and report, not a gate.


## npm scripts

| Command              | What it does |
|----------------------|--------------|
| `npm run dev`        | Astro dev server at http://localhost:4321 |
| `npm run build`      | Production build to `./dist/` |
| `npm run preview`    | Preview the production build locally |
| `npm run sync`       | Pull filtered public wiki into `src/content/` |
| `npm run check-leaks`| Grep `dist/` for confidential markers |
| `astro check`        | Type/syntax check |
