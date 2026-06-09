# Review — 2026-06-09 — main

**Scope:** 
- `src/pages/index.astro`
- `package.json`
- `astro.config.mjs`
- `tsconfig.json`
- `.claude/settings.json`
- `CLAUDE.md`
- `.gitignore`
- `.vscode/` config files
- `public/` directory structure

**Commit:** unknown (initial scaffold, no commits beyond init)

## Layer 1: Visual / Frontend Quality [STRICTEST]

- **BLOCKER** `src/pages/index.astro:1-18` — Page title is generic "Astro" (default boilerplate). This is a recruiter-facing portfolio and must have a proper page title that reflects Tong's brand/profile. — Change `<title>Astro</title>` to `<title>Tong Nie — Data Engineer</title>` or similar descriptor.

- **BLOCKER** `src/pages/index.astro:14-16` — Content is bare boilerplate (`<h1>Astro</h1>`). The landing page has zero distinctive design, messaging, or visual identity. For a recruiter-facing site that must signal "senior DE + architectural taste", this is a placeholder that needs complete replacement with meaningful content and intentional visual hierarchy. — Replace boilerplate with actual landing page content (headline, value proposition, CTA). Use `frontend-design` skill to create distinctive, high-end aesthetic (not a generic dev-portfolio template).

- **SHOULD-FIX** `src/pages/index.astro:6-12` — HTML is minimal but has no semantic structure (`<main>`, `<nav>`, `<footer>` landmarks missing). While the page will be rewritten anyway, establish landmark conventions early. — When adding content, wrap page body in `<main>`, add `<header>` and `<footer>` regions with semantic meaning.

- **SHOULD-FIX** `src/pages/index.astro:5` — No `lang` attribute validation or consistency plan. The `lang="en"` is correct but should be confirmed as the only supported language throughout the site build. — Document language strategy in CLAUDE.md (is this en-only, or will localization be added later?).

- **NICE-TO-HAVE** `src/pages/index.astro:8-9` — Two favicon declarations (`/favicon.svg` + `/favicon.ico`). While functional, this is redundant — `.ico` is legacy. Modern best practice is `.svg` only or `.svg` + `.webp`. — Consider consolidating to just the `.svg` once branding assets are finalized.

## Layer 2: Code Quality

- **SHOULD-FIX** `astro.config.mjs:1-5` — Config is empty (no integrations, no middleware, no Vercel adapter). According to CLAUDE.md, the site deploys to Vercel and must use Vercel's adapter for Edge functions (`/api/chat`, `/api/track`, etc.). The adapter is not present. — Add `import vercel from '@astrojs/vercel/serverless'` and configure it in `defineConfig({ adapter: vercel() })`. Ensure Node.js version ≥22.12.0 is set (already in package.json ✓).

- **SHOULD-FIX** `package.json:1-17` — Missing critical dependencies. Per CLAUDE.md: the project needs a sync script (`npm run sync`) to pull wiki content, a leak check script (`npm run check-leaks`), and type checking (`astro check`). These scripts are referenced in CLAUDE.md but not defined in package.json. — Add scripts: `"sync": "node scripts/sync.js"`, `"check-leaks": "grep -r ... dist/"`, `"check": "astro check"`. Also add `scripts/` directory with sync logic (scope deferred — this is phase 2).

- **SHOULD-FIX** `package.json:1-17` — No `.env.example` file. CLAUDE.md lists four environment variables that must be kept secret (`ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `VERCEL_KV_REST_API_URL`, `VERCEL_KV_REST_API_TOKEN`, `IP_HASH_SALT`). Without `.env.example`, future collaborators won't know which vars to configure. — Create `.env.example` with these keys (no values, just names as placeholders). Example:
  ```
  ANTHROPIC_API_KEY=<set-in-vercel>
  SUPABASE_URL=<set-in-vercel>
  SUPABASE_ANON_KEY=<set-in-vercel>
  VERCEL_KV_REST_API_URL=<set-in-vercel>
  VERCEL_KV_REST_API_TOKEN=<set-in-vercel>
  IP_HASH_SALT=<set-in-vercel>
  ```

- **NICE-TO-HAVE** `tsconfig.json:1-5` — Config extends `astro/tsconfigs/strict` (good, aligns with Layer 2 code quality rules). The `include`/`exclude` are reasonable. No issues here.

- **NICE-TO-HAVE** `src/pages/index.astro:1-2` — Astro component frontmatter is empty (no script logic, no imports, no component Props interface). This is fine for a placeholder, but once routes like `/api/chat` and `/stats` are added, establish a naming convention for API route handler types (e.g., `RequestHandler`, `APIRoute`). — Document in CLAUDE.md that all API routes must be typed with Astro's `APIRoute` type.

## Layer 3: Security / Cost / GDPR

- **BLOCKER** `astro.config.mjs`, `package.json`, source files — **No Vercel adapter configured, no Edge function setup, no KV client or Supabase client imported.** This is scaffolding-only, so not yet a *violation*, but the task is to check **before** opening the PR. The following MUST be true before `/api/chat` is merged:
  - No `process.env` in Edge functions (use `import.meta.env`)
  - Rate limiting with Vercel KV must be in place BEFORE the Anthropic call
  - System prompt must be imported as a build-time constant, not read from disk per request
  - Conversation history must be capped (last 10 turns, 2000 chars/message max)
  - `/api/track` must hash IPs with `IP_HASH_SALT` before writing to Supabase (never store raw IPs)
  
  None of these are yet in the codebase — they are scaffolding TODOs. — These are phase 2 implementation details, but ensure CLAUDE.md or a separate `API_SECURITY.md` documents these constraints **now**, before coding begins.

- **BLOCKER** `.gitignore:17-19` — `.env`, `.env.local`, `.env.production` are gitignored (correct). However, there is NO `.env.example` file, which means secrets could accidentally be committed if not documented elsewhere. — Create `.env.example` as noted in Layer 2 finding above.

- **SHOULD-FIX** `CLAUDE.md:26-42` — Confidential boundary rules are well documented (sync script filters `/confidential/`, leak check is in npm scripts). However, the sync script itself does not yet exist (scaffolding deferred), so there's no enforcement mechanism yet. — Once `scripts/sync.js` is written, ensure it strictly filters any path containing `/confidential/`. Provide a sample denylist in comments.

- **NICE-TO-HAVE** `README.md:1-44` — README is the default Astro boilerplate. It should be updated to reflect this project (Tong's portfolio, chatbot, etc.), but this is not a security concern — it's documentation polish. — Replace with a brief, project-specific README (1-2 sentences + link to CLAUDE.md for the full build guide).

## Summary

- **Layer 1:** 5 findings (1 blocker, 2 should-fix, 2 nice-to-have)
- **Layer 2:** 4 findings (0 blockers, 3 should-fix, 1 nice-to-have)
- **Layer 3:** 4 findings (2 blockers, 2 should-fix, 0 nice-to-have)

**Total: 13 findings**

---

## Key Recommendations

**Blockers to address before PR:**
1. Replace boilerplate page title (`<title>Astro</title>` → `<title>Tong Nie — Data Engineer</title>`).
2. Replace landing page boilerplate with real content (headline, value prop, CTA) using `frontend-design` skill.
3. Configure Vercel adapter in `astro.config.mjs`.
4. Document Edge function security constraints in CLAUDE.md (API layer security pre-planning).

**Should-fix before or immediately after initial PR (phase 1.5):**
- Create `.env.example` with all required environment variable names.
- Add missing npm scripts (`sync`, `check-leaks`, `check`).
- Establish semantic HTML landmark conventions (document in CLAUDE.md).
- Document API route typing requirements.

**Nice-to-have (defer to phase 2 or Tong's discretion):**
- Consolidate favicon declarations (`.svg` only).
- Document language/localization strategy.
- Replace generic README with project-specific description.

---

## Scaffolding Status

This is a **valid initial scaffold** for the portfolio-website project. Core architecture decisions (18 locked) are documented in CLAUDE.md and external plan files. The project is set up correctly for incremental feature build-out:

- Node.js 22.12.0+ pinned in package.json ✓
- Astro 6 + strict TypeScript configured ✓
- Git initialized with clean .gitignore ✓
- Frontend-design plugin enabled for high-quality UI ✓
- Secret handling strategy documented ✓

The two blockers (page title + landing content + Vercel config) are straightforward to fix. Once addressed, this scaffold is ready for phase 2: sync script, chatbot API, and analytics routes.
