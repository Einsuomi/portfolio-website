# Product

Thin steering doc for design tooling. Source of truth is `specs/project.md` (narrative,
stack, roadmap) and the active `specs/phase-*.md` — when they conflict, the specs win.

## Register

brand

## Users

Recruiters and hiring managers, usually opening the link from LinkedIn or email on a
phone. Their job: decide in under a minute whether Tong Nie (Data Engineer & Builder)
is worth a conversation. Secondary audience: engineers checking technical depth.

## Product Purpose

Job-hunt competitiveness, not design awards: a distinctive, obviously hand-crafted
frontend backed by a real production data backend (Supabase analytics, LLM chatbot,
Databricks pipeline). The site itself is the proof of both infrastructure depth and
product taste. See `specs/project.md`.

## Brand Personality

Cinematic, precise, candid.

- **Cinematic** — the homepage is a chaptered, film-like story (pinned stage,
  scroll-driven scenes), not a stack of sections.
- **Precise** — data-engineer craft; nothing decorative that doesn't carry meaning.
- **Candid** — direct manifesto voice ("Don't read my CV. Interview it.").

## Anti-references

- The developer-portfolio template (avatar, skill badges, identical project card grid).
- The generic AI/tech look: cream-neutral scaffolding, uppercase eyebrow kickers on
  every section, hero-metric blocks, glassmorphism by default.
- Prompt-library template grade (motionsites.ai-style output) — the exact look this
  project exists to clear.
- The light treatment is a **colour theme of the dark scene** (shared layout + scene,
  re-tuned tokens) — never a lazy plain inversion (see `reference/v3-v4-demos.md`).

## Design Principles

1. **The backend is the proof.** Visuals should eventually render real production
   data — the pipeline visual IS the pipeline. Never fake what could be real.
2. **Five-second hero.** Name + role + value communicated before any animation
   finishes; animation rewards staying, never gates understanding.
3. **Motion is narrative, not decoration.** Chapters that tell a story, not uniform
   section reveals. Every transition earns its place in the storyline.
4. **Phone-first reality.** Recruiters open links on phones; every visual idea
   degrades gracefully there or doesn't ship.
5. **One story, two projections.** Dark and light are treatments of the same
   narrative and copy — the structure never forks.

## Accessibility & Inclusion

- `prefers-reduced-motion`: full alternative — chapters render as static stacked
  sections, site fully usable.
- WebGL/JS failure: static poster fallback, fully usable site.
- Text ≥ 4.5:1 contrast over any background at every scroll position (binding design
  law in `CLAUDE.md`).
- No cookies, no tracking beyond the privacy-safe beacon (GDPR posture in
  `specs/phase-1a-analytics.md`).
