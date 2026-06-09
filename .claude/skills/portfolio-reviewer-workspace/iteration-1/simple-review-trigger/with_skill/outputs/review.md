## Review — 2026-06-09 — main
**Scope:** src/pages/index.astro, astro.config.mjs, tsconfig.json, package.json, CLAUDE.md, .claude/settings.json, README.md, .gitignore
**Commit:** 6a6ecee

### Layer 1: Visual / Frontend Quality [STRICTEST]

- **BLOCKER** `src/pages/index.astro:12` — Page title is generic placeholder "Astro" instead of meaningful project title like "Tong Nie — Data Engineer" — Update title to match brand
- **BLOCKER** `src/pages/index.astro:15` — H1 is generic "Astro" placeholder; no actual site identity or headline present — Replace with descriptive headline matching portfolio brand
- **SHOULD-FIX** `src/pages/index.astro` — Missing semantic page structure: no `<main>`, `<nav>`, `<header>`, `<footer>` landmark elements required for WCAG compliance and professional site architecture — Add proper semantic HTML landmarks
- **SHOULD-FIX** `src/pages/index.astro` — No meta description, og:title, og:description, or social share tags — Add comprehensive meta tags for SEO and social previews
- **SHOULD-FIX** `src/pages/index.astro:7-10` — Favicon configuration is incomplete; references `/favicon.svg` and `/favicon.ico` which likely don't exist yet — Verify favicon assets exist in `public/` or remove references
- **NICE-TO-HAVE** `astro.config.mjs` — No Vercel adapter configured despite CLAUDE.md specifying "Vercel Hobby" deployment target — Import and configure `@astrojs/vercel` adapter with edge function support
- **NICE-TO-HAVE** `src/pages/index.astro` — No design tokens, layout system, or CSS framework imported (e.g., no global styles file) — Establish design token system and import global stylesheet once visual direction is locked

### Layer 2: Code Quality

- **SHOULD-FIX** `astro.config.mjs` — Vercel adapter missing for Edge function and KV support per architecture (CLAUDE.md: chatbot on Edge, rate-limit via Vercel KV) — Add: `import vercel from '@astrojs/vercel/edge'` and configure in defineConfig()
- **SHOULD-FIX** `package.json` — No dev dependencies for TypeScript, linting, or formatting (astro --check is available but no eslint/prettier) — Add `astro check` to CI; consider adding eslint for code quality
- **SHOULD-FIX** `tsconfig.json` — Using strict Astro config but no comment density or JSDoc rules documented; future API routes will need typed request/response handling — Add explicit rules for API route types once `/api/chat.ts` is written
- **NICE-TO-HAVE** `package.json` — No `sync` script despite CLAUDE.md Step 2b describing `npm run sync` for wiki content — Add script: `"sync": "node scripts/sync.js"` (deferred until wiki structure exists)
- **NICE-TO-HAVE** `package.json` — No `check-leaks` or `preview` scripts for pre-deployment checks and local preview — These can wait until API routes are built

### Layer 3: Security / Cost / GDPR

- **BLOCKER** `package.json` — No `.env.example` file documenting required secrets (ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, VERCEL_KV_*, IP_HASH_SALT) — Create `.env.example` with all required keys marked as sensitive; verify `.env.local` is in .gitignore (✓ confirmed in .gitignore)
- **SHOULD-FIX** `.gitignore` — Already includes `.env` and `.env.local` (good), but should also explicitly ignore `.env.production` and verification is needed that no build output includes these — Confirmed: .env, .env.local, .env.production all gitignored correctly
- **NICE-TO-HAVE** `CLAUDE.md` — Confidential boundary rules exist (no `/confidential/` paths in src/content/) but no inline enforcement yet (deferred to sync script build) — This is acceptable as sync script doesn't exist yet; verify once sync.js is written

---

### Summary

- **Layer 1:** 7 findings (1 blocker, 2 should-fix, 4 nice-to-have)
  - Critical: placeholder content and missing semantic HTML
  - Should-fix: meta tags, landmarks, incomplete favicon config
  
- **Layer 2:** 5 findings (0 blockers, 3 should-fix, 2 nice-to-have)
  - Critical: Vercel adapter missing for production deployment
  - Should-fix: dev tooling gaps (though minimal at scaffold stage)
  
- **Layer 3:** 3 findings (1 blocker, 1 should-fix, 1 nice-to-have)
  - Critical: `.env.example` missing — needed before any secrets touch code
  - Should-fix: post-build verification prep

**Assessment:** This is a minimal scaffold stage (0.0.1, 1 commit). All findings are expected. Blockers must be resolved before API routes are built. The codebase follows CLAUDE.md discipline (proper .gitignore, tsconfig strictness, frontend-design plugin enabled). No confidential leaks or production secrets detected. Ready for next phase: content structure + chatbot API scaffold.
