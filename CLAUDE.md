# Portfolio Website — Project Instructions

Recruiter-facing portfolio for Tong Nie, Data Engineer.
The centerpiece is a chatbot grounded in the public subset of the Super Brain wiki.
Replaces the old Wix site (`ethannie2020.wixsite.com/data-analytics`).

Full architecture rationale (18 locked decisions) lives outside this repo:
- `~/.claude/plans/ok-i-need-to-buzzing-meerkat.md` — the primary reference
- `~/Desktop/AI Memory/Super Brain/wiki/ideas/portfolio-website-rebuild.md` — summary

Consult those for the WHY. This file is the HOW for working in this repo.

## Stack (polyglot)

- **Frontend/site:** Astro 6 + Vercel Hobby. Managed by **npm**. Static-first;
  the chatbot is the one interactive JS island. Dev server at `localhost:4321`.
- **Python tooling:** `rendercv` (CV generation, §17) and `dbt`/Databricks
  (analytics pipeline, §16). Managed by **uv** (never pip). `uv init` is
  **deferred** — only set up when the first `.py` file is needed.
- **Chatbot backend:** Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) via a
  Vercel Edge function at `POST /api/chat`. Streamed response, rate-limited via
  Vercel KV (4-layer cost protection).
- **Analytics hot path:** Supabase Postgres (free tier, 90-day hot window).
- **Analytics cold path:** Databricks Free Edition + dbt (Bronze → Silver → Gold).

## Hard rules — confidential boundary

This is a **public** GitHub repo. Confidential content must NEVER enter it.

- Site content flows in only via `npm run sync` — the sync script reads
  `~/Desktop/AI Memory/Super Brain/wiki/**/*.md`, **filters out every path
  containing `/confidential/`**, and copies the rest into `src/content/`.
  Never copy wiki files by hand.
- Always run `git diff` after a sync and inspect what changed before committing.
- Run `npm run check-leaks` (once built) before any push — greps `dist/` for
  known confidential markers from a denylist file.
- Never hardcode secrets. These variables must live only in `.env.local`
  (gitignored) and in Vercel project env vars:
  - `ANTHROPIC_API_KEY`
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`
  - `VERCEL_KV_REST_API_URL`, `VERCEL_KV_REST_API_TOKEN`
  - `IP_HASH_SALT`

## Chatbot grounding (enforced in the system prompt)

- The wiki is the **only** source of truth for anything personal about Tong —
  experience, projects, skills, education, opinions, certifications, language level.
- Model general knowledge is fine for explaining generic technical concepts
  (what Spark is, what GDPR means, what Delta Lake does).
- If asked something personal not in the wiki: respond "I don't have that detail —
  you're welcome to ask Tong directly." Never guess or infer.

## Git discipline

- Never push to `main` directly. Always feature branch → PR, even when working solo.
- Never stage or commit unless Tong explicitly asks. Tong runs `git add`/`git commit`.
- Never force-push or `reset --hard` without explicit confirmation.
- Branch naming: `feature/X` for code, `content/X` for wiki sync changes.

## npm scripts (add here as they're built)

| Command              | What it does |
|----------------------|--------------|
| `npm run dev`        | Astro dev server at http://localhost:4321 |
| `npm run build`      | Production build to `./dist/` |
| `npm run preview`    | Preview the production build locally |
| `npm run sync`       | Pull filtered public wiki into `src/content/` |
| `npm run check-leaks`| Grep `dist/` for confidential markers (phase 2 CI gate) |
| `astro check`        | Type/syntax check |

Python commands (added when uv is set up):
- `uv run rendercv render src/content/cv.yaml` — regenerate `public/cv.pdf`
- `uv run dbt ...` — run analytics dbt models

## Design

- Use the `frontend-design` skill for all UI/component work. It produces
  distinctive, production-grade interfaces that avoid generic AI aesthetics.
- The site aesthetic should signal: senior DE + architectural taste + EU/Lux polish.
  Not a "developer portfolio template" look.
- Add short, plain-language comments explaining what code does and why.
- Match comment density and naming style of surrounding code.
- Minimal changes — no unsolicited refactors, no speculative future-proofing.
- No error handling for scenarios that can't happen.

## What's been done / build order

- [x] Architecture: 18 decisions locked (see plan file above)
- [x] Project folder created at this path
- [x] Astro scaffold: `npm create astro@latest --template minimal` (Astro 6)
- [x] `frontend-design` plugin installed (`claude-plugins-official`, project-scoped)
- [x] `git init` + initial commit + public GitHub repo (`github.com/Einsuomi/portfolio-website`)
- [ ] `.env.example` with key names (no values)
- [ ] `src/content/` structure + sync script
- [ ] Chatbot: `src/pages/api/chat.ts` Edge function
- [ ] Analytics: `src/pages/api/track.ts` + Supabase schema
- [ ] `/stats` page (live counts from Supabase, then Databricks pipeline in weeks 2–6)
- [ ] CV pipeline: `rendercv` + `public/cv.pdf` + `/cv` route
- [ ] Conversation brief: `src/pages/api/summarize.ts` + download UX
