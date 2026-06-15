# Portfolio Website — Rules & Roles

Recruiter-facing portfolio for Tong Nie, Data Engineer & Builder. Public GitHub repo,
deployed on Vercel. Project narrative and roadmap live in `specs/project.md`; the active
work spec is the relevant `specs/phase-*.md`. Read those first.

## Roles

- **Tong** — product owner. Approves specs, judges taste, reviews and merges every PR.
- **Architect** (main session) — the only role that talks to Tong and the only one with
  network access. Drafts specs, dispatches subagents, verifies their output, logs
  dispatches, reports to Tong. Does not write feature code (small reviewer-specified
  fixes excepted, reproduced and logged first).
- **designer / coder / reviewer** (subagents in `.claude/agents/`) — work from the
  architect's dispatch prompt, stay in their lane, report back. Never merge, never push,
  never expand scope.

## Hard rules

**This repo is PUBLIC.**
- Site content enters only via `npm run sync`, which strips every `/confidential/` path
  from the Super Brain wiki. Inspect `git diff` after a sync; run `npm run check-leaks`
  before any push.
- `logs/`, `reference/`, and `backups/` are gitignored and stay that way.

**Secrets** — never hardcoded. `.env.local` (gitignored) + Vercel env vars only.

**Git** — never push to `main`. Feature branch → PR; Tong merges. No force-push, no
rebasing shared history, no destructive actions.

## Design law

**No creative limits.** Palette, type, technique, scene complexity, ambition — fully
open (see `project.md`). The homepage is WebGL (Three.js); heavy is allowed. Performance
is a **target, not a gate** — CI reports LCP and JS weight as informational.

**Correctness floor** — the deliverable must actually work for a recruiter opening the
link on a phone:
- Content lives in **real HTML**, not JS-injected — name, role, and every beat's copy in
  the served markup (works with JS off; readable by search / ATS / link-preview crawlers).
  WebGL is a layer on top, never the source of text.
- Hero communicates name + role + value within ~5s; text always readable over any
  background. Mobile portrait works on a real phone — no horizontal overflow.
- `prefers-reduced-motion` and WebGL-fail fallbacks render a static, fully usable page.
- Lazy-load 3D after first paint; pixel ratio capped at `Math.min(devicePixelRatio, 2)`.
- No `backdrop-filter` blur over a live WebGL canvas on mobile.

## Process

- Work ships on a feature branch and is reported to Tong only after it's clean: architect
  verification → **blind** review (spec + diff only, no pre-anchoring) → fixes → clean
  APPROVE. Mechanical defects (overlap, overflow, console errors, contrast, broken
  no-JS / reduced-motion fallback) are caught by the `verify-ui` harness, not by eye —
  new defect classes become new assertions there.
- CI (`.github/workflows/ci.yml`) is the mechanical gate; branch protection on `main`
  requires the `checks` job. Tong merges only green PRs.
- Every dispatch prompt starts with a `TASK: <kebab-slug>` line; a hook logs it to
  `logs/YYYY-MM-DD-<task>.md` (local only). The architect records the verdict there.

## npm scripts

See the commands table in `README.md`.
