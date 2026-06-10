# Portfolio Website — Project Instructions

Recruiter-facing and builder-showcase portfolio for Tong Nie, Data Engineer & Builder.
The bet: a distinctive, obviously hand-crafted frontend combined with a real production
data backend (Supabase, Databricks, LLM chatbot) — proof of both infrastructure depth
and product taste. The goal is job-hunt competitiveness, not design awards: clearly
above template grade, with the backend doing real work behind it.

Whole picture lives outside this repo:
- `~/Desktop/AI Memory/Super Brain/ `

## 1. Stack (Polyglot)

- **Creative Frontend:** Astro 6 + Vercel Hobby. 
  - **Visual Engine:** Three.js (WebGL), GSAP (ScrollTrigger), and Lenis (Smooth Scroll). 
  - **Architecture:** A fixed full-screen 3D canvas rendering an abstract "Data Pipeline", with clean HTML content scrolling fluidly over it.
  - **Interactivity:** The Chatbot is an isolated, highly interactive Astro Island (glassmorphism UI) floating above the canvas.
- **Python Tooling:** `rendercv` (CV generation) and `dbt`/Databricks. Managed by **uv**. `uv init` is deferred.
- **Chatbot Backend:** Claude Haiku 4.5 via a Vercel Edge function (`POST /api/chat`). Streamed response, rate-limited via Vercel KV.
- **Analytics Hot Path:** Supabase Postgres (free tier).
- **Analytics Cold Path:** Databricks Free Edition + dbt (Bronze → Silver → Gold).

## 2. Design & Frontend Philosophy

- **Creative freedom:** No locked palette, typography, or technique — aesthetics are fully
  open, guided by the `frontend-design` and `ui-ux-pro-max` skills. Aim: distinctive, senior
  taste, EU polish — never a developer-portfolio template, never the generic AI/tech look.
- **Hard constraint — performance (the silent killer):**
  - Lazy-load any 3D/WebGL after first paint; capped pixel ratio (`Math.min(devicePixelRatio, 2)`).
  - No `backdrop-filter` blur over a live-animating WebGL canvas on mobile — cheap glass
    (translucent bg, no blur) instead.
  - `prefers-reduced-motion` and WebGL-fail fallbacks: static poster, fully usable site.
  - Budget: LCP < 2.5s on mid-range mobile, initial JS < ~300 KB gz, smooth scroll on a phone.
- **Hard constraint — legibility:** text always readable over any background. The hero must
  communicate name + role + value within ~5 seconds, before any animation finishes.
- **Mobile first reality:** recruiters open links from LinkedIn/email on phones. Every visual
  idea must degrade gracefully there or not ship.

## 3. Hard Rules — Confidential Boundary

This is a **public** GitHub repo. Confidential content must NEVER enter it.

- Site content flows in only via `npm run sync` — reads `~/Desktop/AI Memory/Super Brain/wiki/**/*.md`, **filters out EVERY path containing `/confidential/`**, and copies the rest into `src/content/`.
- Always run `git diff` after a sync and inspect what changed before committing.
- Run `npm run check-leaks` before any push.
- **NEVER hardcode secrets.** Use `.env.local` (gitignored) and Vercel env vars:
  - `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `VERCEL_KV_REST_API_URL`, `VERCEL_KV_REST_API_TOKEN`, `IP_HASH_SALT`

## 4. Chatbot Grounding (Enforced via System Prompt)

- The wiki is the **ONLY** source of truth for anything personal about Tong (experience, projects, skills).
- Model general knowledge is used ONLY to explain generic technical concepts (e.g., Spark, dbt, GDPR).
- If asked personal details not in the wiki, the bot must respond: "I don't have that detail — you're welcome to ask Tong directly." Never hallucinate.

## 5. Git Discipline

- Never push to `main` directly. Feature branch → PR.
- Never stage or commit unless Tong explicitly asks. Tong runs `git add`/`git commit`.
- Branch naming: `feature/X` for code, `content/X` for wiki sync.

## 6. npm Scripts

| Command              | What it does |
|----------------------|--------------|
| `npm run dev`        | Astro dev server at http://localhost:4321 |
| `npm run build`      | Production build to `./dist/` |
| `npm run preview`    | Preview the production build locally |
| `npm run sync`       | Pull filtered public wiki into `src/content/` |
| `npm run check-leaks`| Grep `dist/` for confidential markers |
| `astro check`        | Type/syntax check |

## 7. Execution Roadmap (Strict Order)

- [x] Architecture & Astro scaffold created.
- [x] `frontend-design` plugin installed.
- [x] Initial GitHub repo synced.
- **[CURRENT] Phase 1a: Analytics Day 1.** `/api/track` Edge function + Supabase `events`
  table + page-view beacon. Ship with the very first deploy — every week of delay is a week
  of traffic history lost. (`/stats` page comes later; collection starts now.)
- **[CURRENT] Phase 1b: Visual Base.** UI iteration on `ui-v3` (Three.js/GSAP/Lenis as the
  design demands). Cinematic scroll + hero reveal. Keep v4/v5 as fallback — 3D ships only
  if it clearly beats them.
- **[ ] Phase 2: Data Flow.** Pipeline visual driven by scroll; later, wire it to *real*
  events from Supabase so the visual IS the production pipeline.
- **[ ] Phase 3: Content Handoff.** Content sections + Chatbot UI shell.
- **[ ] Phase 4: Chatbot Brain.** Edge function API + Vercel KV rate limit + wiki grounding.
- **[ ] Phase 5: Stats & Pipeline Story.** `/stats` page reading live Supabase counts.
- **[ ] Phase 6: Batch Pipeline.** Databricks + dbt + CV generation via `rendercv`.

## 8. Content TODO (feeds the chatbot + /experience pages)

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