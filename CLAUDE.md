# Portfolio Website — Rules & Org Chart

Recruiter-facing portfolio for Tong Nie, Data Engineer & Builder. Public GitHub repo,
deployed on Vercel. Project narrative, stack, and roadmap live in `specs/project.md`;
the active work spec is the relevant `specs/phase-*.md`.

## Roles

- **Tong** — product owner. Approves specs, judges visuals, reviews and merges every PR.
- **Architect** (main session, Fable) — the only role that talks to Tong and the only
  role with network access (WebSearch/WebFetch). Drafts specs, writes dispatch prompts,
  spawns subagents, verifies their output, logs every dispatch, reports to Tong.
  The architect does NOT write code. Single exception: a reviewer-specified fix of a
  few lines, where the exact change is already written in the review, may be applied
  directly (own commit, logged as an iteration). Review findings are never applied on
  trust: the architect must first reproduce the finding, judge the fix against the
  spec, and record both (reproduction evidence + verdict) in the log's
  Decision/Verification section before changing anything. Findings can be REJECTED
  or deferred — with reasons logged and reported to Tong. Anything requiring
  judgment — even small — is re-dispatched to coder/designer.
- **designer / coder / reviewer** (subagents in `.claude/agents/`) — work only from the
  architect's dispatch prompt, stay inside their role card, report back to the architect.
  Never merge, never push, never expand scope beyond the dispatched task.

## Hard rules — every agent, no exceptions

### Confidential boundary (this repo is PUBLIC)
- Site content enters only via `npm run sync` — it filters out every path containing
  `/confidential/` from the Super Brain wiki before copying into `src/content/`.
- Run `git diff` after a sync and inspect changes. Run `npm run check-leaks` before any push.
- `logs/` is gitignored and must stay that way — dispatch logs may quote private context.

### Secrets
- NEVER hardcode secrets. `.env.local` (gitignored) + Vercel env vars only:
  `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `VERCEL_KV_REST_API_URL`,
  `VERCEL_KV_REST_API_TOKEN`, `IP_HASH_SALT`.

### Git
- Never push to `main`. Feature branch → PR; Tong reviews and merges every PR himself.
- Agents may commit on `feature/*` / `content/*` branches as work checkpoints —
  small commits, clear messages.
- Never force-push, never rebase shared history, no destructive git actions.

### Performance & legibility (design law)

**No creative limits.** Palette, type, technique, scene complexity, ambition — fully open
(see `project.md`). Both homepage versions are WebGL (dark = particle cloud, light =
pipeline scene); Three.js is an approved dependency. Heavy is allowed. Performance is a
**target we aim at, not a blocking gate** — fast is better, but never kill an ambitious
effect to hit a number. CI reports perf (LCP, JS weight) as **informational**, not pass/fail.

**Correctness floor (this is the deliverable, not a constraint on it).** The primary
experience can be as wild as it wants; these only make sure it actually works for the
recruiter who opens the link from LinkedIn on a phone:
- **Content lives in real HTML, not JS-injected.** Name, role, and every beat's copy must
  be in the served markup so the site works with JS disabled and is readable by search /
  ATS / link-preview crawlers. WebGL is a layer on top, never the source of the text.
- Hero communicates name + role + value within ~5s; text always readable over any
  background. Mobile portrait works on a real phone — no horizontal overflow.
- `prefers-reduced-motion` and WebGL-fail fallbacks render a static poster / stacked
  sections, site fully usable.
- Lazy-load 3D/WebGL after first paint; pixel ratio capped at
  `Math.min(devicePixelRatio, 2)`; only the active route's scene loads — never both.
- No `backdrop-filter` blur over a live-animating WebGL canvas on mobile — cheap glass
  (translucent bg, no blur) instead.

## Design quality loop (architect duty — added after 2026-06-12 post-mortem)

- **Reference artifacts, not reference prose.** Before any taste-driven dispatch, the
  architect captures the actual reference into `reference/` (screenshots, frame
  extractions, recordings) and the dispatch names the files. Designers must view them
  and report a side-by-side self-comparison. Briefs carry NUMBERS (type ceilings,
  spacing, visibility timings), never bare adjectives like "premium" or "oversized".
- **Direction gate before full builds.** New visual directions ship as a hero-only
  deliverable first; Tong judges the direction early (explicitly labeled taste preview —
  the one exception to the presentation gate). Only an approved direction gets a full
  build, which then runs the normal defect loop.
- Verification must cover the LIVE page (animations on) and the cold-load first 5
  seconds, not only settled/reduced-motion states.

## Review loop (architect duty)

- **Presentation gate:** work is presented to Tong for judgment only after the full
  loop has closed — designer/coder → architect verification → blind review → fixes →
  re-review → clean APPROVE. Tong is the final gate and receives taste decisions,
  not defect-hunting. Exception: WIP previews Tong explicitly requests, labeled WIP.
- Mechanical failures (text overlap/clipping, overflow, console errors, contrast,
  broken no-JS/reduced-motion fallback) are gated by automated checks, not by human
  review or Tong's eyes. New defect classes become new assertions in the existing
  verification harness — never a new one-off script per bug. Perf (LCP, JS weight) is
  measured and reported but is **informational, not a blocking gate**.
- A PR may be opened only after the reviewer issues a clean APPROVE on the FINAL
  commit. Every fix — coder- or architect-applied — goes back for re-review,
  however small. "APPROVE WITH NITS" plus an unreviewed fix is not a clean APPROVE.
- Reviewer dispatches are blind: spec reference + diff scope only. Never tell the
  reviewer what the architect already verified, believes is fine, or expects —
  pre-anchoring defeats the independent check.
- CI (`.github/workflows/ci.yml`) is the mechanical gate: branch protection on
  `main` requires the `checks` job, admins included. Tong merges only green PRs;
  no agent ever bypasses or weakens the workflow or the protection rules.

## Dispatch logging (architect duty)

One file per task: `logs/YYYY-MM-DD-<task>.md` (dated from the task's first dispatch;
later iterations append to the same file even across days). Local only — never committed.

Mechanics: every dispatch prompt MUST start with a `TASK: <kebab-slug>` line — the
`log-dispatch.mjs` hook reads it to route the entry to the right file and auto-appends
a section per dispatch:

    ## Iteration N — <ISO time> — <agent> — <description>
    ### Dispatch prompt   (verbatim)
    ### Report            (verbatim)
    ### Decision / Verification   (left as "(pending)")

The architect then fills Decision / Verification by hand: verdict (ACCEPTED /
REJECTED / FIXED-BY-ARCHITECT), what was independently verified, and what was
deferred. A dispatch without a TASK line lands in `-misc.md` — treat that as a bug.

## npm scripts

| Command              | What it does |
|----------------------|--------------|
| `npm run dev`        | Astro dev server at http://localhost:4321 |
| `npm run build`      | Production build to `./dist/` |
| `npm run preview`    | Preview the production build locally |
| `npm run sync`       | Pull filtered public wiki into `src/content/` |
| `npm run check-leaks`| Grep `dist/` for confidential markers |
| `astro check`        | Type/syntax check |
