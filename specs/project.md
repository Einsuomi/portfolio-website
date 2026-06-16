# Project Spec — Portfolio Website

Recruiter-facing and builder-showcase portfolio for Tong Nie, Data Engineer & Builder.
The bet: a distinctive, obviously hand-crafted frontend combined with a real production
data backend (Supabase, Databricks, LLM chatbot) — proof of both infrastructure depth
and product taste. The bet is job-hunt competitiveness — won by being unmistakably above
template grade with a backend doing real work behind it. Craft ambition is encouraged:
the site should catch and hold a recruiter's attention end to end (see CLAUDE.md taste),
not play it safe.

Whole picture lives outside this repo: `~/Desktop/AI Memory/Super Brain/`

## 1. Stack (Polyglot)

- **Creative Frontend:** Astro 6 + Vercel Hobby.
  - **Visual Engine:** Three.js (WebGL) + GSAP/ScrollTrigger + Lenis, used when they serve
    the design — the motion vehicle, not a cage. New techniques are welcome if they earn it.
  - **Architecture:** A full-screen WebGL canvas (today a scroll-driven particle/dot scene)
    with clean, readable HTML scrolling over it; the visual gets wired to real pipeline
    events in Phase 2. The real-HTML layer is the floor under any visual idea.
  - **Interactivity:** The Chatbot is an isolated, highly interactive Astro Island
    (glassmorphism UI) floating above the canvas.
- **Python Tooling:** `rendercv` (CV generation) and `dbt`/Databricks. Managed by **uv**.
  `uv init` is deferred.
- **Chatbot Backend:** Claude Haiku 4.5 via a Vercel Edge function (`POST /api/chat`).
  Streamed response, rate-limited via Vercel KV.
- **Analytics Hot Path:** Supabase Postgres (free tier).
- **Analytics Cold Path:** Databricks Free Edition + dbt (Bronze → Silver → Gold).

## 2. Design & Frontend Philosophy

- **Creative freedom:** No locked palette, typography, or technique — aesthetics are fully
  open, guided by the `frontend-design` and `ui-ux-pro-max` skills. Aim: distinctive, senior
  taste, EU polish — never a developer-portfolio template, never the generic AI/tech look.
- The hard constraints are legibility and the mobile / no-JS delivery floor (design law in
  `CLAUDE.md`, binding for every agent). Performance (LCP, JS weight) is a target we watch
  and report — not a gate on ambition. Heavy WebGL is welcome.
- **Mobile is a delivery floor, not a ceiling on exploration:** recruiters open links from
  LinkedIn/email on phones, so every visual must degrade gracefully (reduced-motion /
  WebGL-fail → static, usable page). That's the floor to clear — not a reason to shrink the
  idea.

## 3. Chatbot Grounding (Enforced via System Prompt)

- The wiki is the **ONLY** source of truth for anything personal about Tong (experience,
  projects, skills).
- Model general knowledge is used ONLY to explain generic technical concepts (e.g., Spark,
  dbt, GDPR).
- If asked personal details not in the wiki, the bot must respond: "I don't have that
  detail — you're welcome to ask Tong directly." Never hallucinate.

## 4. Execution Roadmap (Strict Order)

- [x] Architecture & Astro scaffold created.
- [x] `frontend-design` plugin installed.
- [x] Initial GitHub repo synced.
- [x] Working process set up: single main agent owns planning/build/quality, may dispatch
  subagents for focused build/review; specs + dispatch logs in `logs/`.
- [x] **Phase 1a: Analytics Day 1.** Shipped — `specs/phase-1a-analytics.md`. Collection
  runs from the first deploy; the `/stats` page is Phase 5.
- [x] **Phase 1b: Visual Base.** Shipped — dark-only homepage. The light camera-ride version
  was retired; light returns later as a colour theme of the dark scene, not a separate page.
- **[CURRENT] Phase 1c: Scene Motion.** `specs/phase-1c-scene-motion.md` +
  `phase-1c-needtofix.md`. Scatter / breathing / ambient field / text-derived figure
  placement on the dark scene. Round A shipped; harness → Round A2 → Round B remain.
- **[ ] Phase 2: Data Flow.** Pipeline visual driven by scroll; later, wire it to *real*
  events from Supabase so the visual IS the production pipeline. First feature on the
  OpenSpec workflow (see CLAUDE.md).
- **[ ] Phase 3: Content Handoff.** Content sections + Chatbot UI shell.
- **[ ] Phase 4: Chatbot Brain.** Edge function API + Vercel KV rate limit + wiki grounding.
- **[ ] Phase 5: Stats & Pipeline Story.** `/stats` page reading live Supabase counts.
- **[ ] Phase 6: Batch Pipeline.** Databricks + dbt + CV generation via `rendercv`.

## 5. Content TODO (feeds the chatbot + /experience pages)

- [ ] **Per-employer deep-dive sessions with Tong** (Neste, PostNord, Basware) → write wiki
      work-history pages. The wiki currently has NO employer history — the chatbot cannot
      answer "where has Tong worked?" until this lands. Tong's CV PDF (private, in
      `~/Documents/2026 Job Hunting/`, never copied into this repo) is the interim drafting
      reference only.
- [ ] **cv.yaml redactions for the public site:** strip phone number (spam) and the
      "willing to relocate to Luxembourg" line (employer-visibility rule) from the public
      `cv.pdf`/`/cv` route — the full version stays for direct recruiter sends.
- [ ] **Homepage chapter copy:** structure approved 2026-06-10 (hero manifesto → Neste →
      PostNord → Basware → projects-as-posters → case-study essays → chatbot finale, with
      footer colophon). No education chapter — degree + certifications live on /experience,
      the CV, and in chatbot grounding. Two lines per chapter; iterate drafts with Tong.
