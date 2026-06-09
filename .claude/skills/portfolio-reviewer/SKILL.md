---
name: portfolio-reviewer
description: Run a project-specific review of the portfolio-website codebase. Use when asked to "review the site", "run a review", or "check the code before PR". Spawns a read-only Explore subagent that checks three layers — visual quality (strictest), code quality, and security/cost/GDPR — then writes findings to reviews/YYYY-MM-DD.md and applies fixes.
---

# Portfolio Reviewer

This skill reviews the portfolio-website codebase across three layers of criteria specific to this project. It is NOT a general-purpose code reviewer — it is opinionated about this site's architecture, design language, and constraints.

## How to run this skill

1. Spawn a **read-only Explore subagent** with the task prompt below (copy the entire SUBAGENT TASK section).
2. Wait for the subagent to return its structured findings.
3. Write the findings to `reviews/YYYY-MM-DD.md` (today's date, or append to today's file if one exists).
4. Work through findings layer by layer — Layer 1 first (most important), then 2, then 3.
5. Apply all **blocker** and **should-fix** findings to `src/`. Leave **nice-to-have** for Tong to decide.
6. After applying fixes, add a footer to the log: which findings were applied, which were deferred, and why.
7. Tell Tong: "Review done. N findings — X applied, Y deferred. See `reviews/YYYY-MM-DD.md`."

## SUBAGENT TASK (copy verbatim when spawning)

You are a read-only code reviewer for a portfolio website. Your only job is to read files and return structured findings — you MUST NOT edit any file.

This is an Astro 6 site (static-first, island architecture) deployed on Vercel. The owner is a Data Engineer. The site's centrepiece is a recruiter-facing chatbot grounded in a private wiki. It must look high-end and distinctive — not like a generic AI/dev-portfolio template.

Read these paths:
- `src/` — all files recursively
- `CLAUDE.md` — for project rules and architecture context
- `.claude/` — for project-level config

Return your findings as a structured report with this exact format:

---
## Review — [date] — [branch or "main"]
**Scope:** [list of files you read]
**Commit:** [git describe or "unknown"]

### Layer 1: Visual / Frontend Quality [STRICTEST]
[findings — one per bullet]
- **[BLOCKER/SHOULD-FIX/NICE-TO-HAVE]** `file:line` — [what's wrong] — [concrete fix]

### Layer 2: Code Quality
[findings]
- **[BLOCKER/SHOULD-FIX/NICE-TO-HAVE]** `file:line` — [what's wrong] — [concrete fix]

### Layer 3: Security / Cost / GDPR
[findings]
- **[BLOCKER/SHOULD-FIX/NICE-TO-HAVE]** `file:line` — [what's wrong] — [concrete fix]

### Summary
- Layer 1: N findings (X blockers, Y should-fix, Z nice-to-have)
- Layer 2: N findings (...)
- Layer 3: N findings (...)
---

## Review criteria

### Layer 1 — Visual / Frontend Quality (STRICTEST — highest bar, most findings expected)

This layer is the most important. The site must look exceptional and distinctive. Flag anything that looks generic, templated, or "AI-slop".

**Aesthetics and design language:**
- Is the component/page distinctive? Would a designer call it memorable, or does it look like every other dev portfolio?
- Are design tokens consistent? No ad-hoc hex values, no inconsistent spacing units, no mixed typography approaches.
- Does the visual language match a "senior DE in Luxembourg/EU" profile — refined, professional, not loud?
- Is there a clear aesthetic direction (per the `frontend-design` skill: brutally minimal, editorial, luxury, etc.)? Or is it direction-less?

**Technical frontend quality:**
- Responsive? Mobile-first patterns? No fixed pixel widths where relative units belong.
- Semantic HTML: correct heading hierarchy (h1→h2→h3, never skipped), landmark elements (`<main>`, `<nav>`, `<header>`, `<footer>`).
- Accessibility basics: all `<img>` have meaningful `alt` text, interactive elements are keyboard-reachable, colour contrast passable at WCAG AA.
- Astro island discipline: is JS actually minimal? No `client:load` where `client:visible` or `client:idle` would do. No unnecessary React/Vue/Svelte loaded for static content.
- No inline styles where a class/token applies. No `!important` unless documented with a reason.

### Layer 2 — Code Quality (portfolio-specific)

**TypeScript:**
- No `any` where a real type exists or can be inferred. If `any` is used, it must have a comment explaining why.
- API route handlers typed with Vercel's request/response types.
- Astro component props typed with `interface Props`.

**Astro / Edge function constraints:**
- No Node.js-only APIs (`fs`, `path`, `process.env` accessed at runtime) inside Edge functions. Environment variables in Edge must use `import.meta.env`.
- Astro config and integrations are correct for the Vercel adapter.

**Architecture rules:**
- No magic strings — model IDs, rate-limit thresholds, KV key prefixes should be named constants.
- System prompt content must NEVER be echoed back in API responses.
- Sync script output (`src/content/`) should only be read, not hand-edited.
- No `console.log` left in production API routes.

### Layer 3 — Security / Cost / GDPR (fewer findings, high-confidence only — but BLOCKERS are hard blockers)

**Scope rule:** Only check what EXISTS in the current code. If a feature (API routes, tracking beacon, rate limiting) hasn't been built yet, write "N/A — not yet implemented" for those checks. Do NOT raise BLOCKERs on code that doesn't exist. The purpose is to catch violations in what's there, not to pre-flag future work.

**Secrets (BLOCKER if violated):**
- No `ANTHROPIC_API_KEY`, `SUPABASE_*`, `VERCEL_KV_*`, or `IP_HASH_SALT` in any source file.
- No hardcoded credentials, tokens, or salts.

**Confidential boundary (BLOCKER if violated):**
- No file in `src/content/` whose path contained `/confidential/` in the source wiki.
- No content that mentions internal employer names, project codenames, or personal details not meant for public.

**API cost posture:**
- Is the system prompt imported as a build-time constant (not read from disk per request)?
- Is the brief generation result cached client-side so Preview→Download = 1 API call, not 2?
- Is conversation history capped (last 10 turns, 2000 chars/message max)?

**GDPR / tracking:**
- `/api/track`: raw IP must never be written to Supabase — only the salted SHA-256 hash.
- No `Set-Cookie` headers anywhere in API responses.
- Only `x-vercel-ip-country` (country code) retained, not the full IP.

**Rate limiting:**
- All four layers from the architecture must be present: per-IP/minute, per-IP/day, global daily cap, Anthropic account budget cap (documented in env vars).
- Rate limit checks must happen BEFORE the Anthropic API call, not after.

## What is NOT reviewed here

- **Broad algorithmic correctness** → use the official `/code-review` skill
- **Rendered pixel quality / actual browser rendering** → deferred to phase 2 (Playwright)
- **Python / dbt / rendercv code** → different tool, added when that work begins
- **Performance profiling / Lighthouse scores** → manual check on Vercel preview URL
