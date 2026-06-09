# Spec-Driven Development

**Type:** learning
**Access:** public
**Tags:** AI-development, software-engineering, SDD, OpenSpec, methodology
**Updated:** 2026-05-05 (hands-on session added)
**tldr:** A discipline where structured specifications — not chat — drive AI code generation; bridges vibe coding's speed with engineering rigor.
**Related:** [[llm-wiki-concept]], [[personal-knowledge-management]]

## Summary
Spec-driven development (SDD) separates planning from implementation: first write a formal spec (domain language, Given/When/Then scenarios, technical constraints), then use that spec as the prompt for AI code generation. This reduces hallucinations, improves quality, and survives session boundaries — unlike plan mode, specs are versioned files that persist across sessions, team members, and tools.

## Detail

### Why SDD Exists
Vibe coding is fast but undisciplined — requirements scatter across chat logs, context is lost when windows overflow, and the AI hallucinates without constraints. SDD reintroduces requirements analysis without reverting to waterfall's long feedback cycles. The spec is the contract; the AI is the contractor.

### What Makes a Good Spec
- Domain-oriented language (describes business intent, not implementation)
- Given/When/Then scenario structure
- Balances completeness with conciseness
- Machine-readable enough to reduce hallucination, human-readable enough to review

### Why Not Just Use Plan Mode
| Dimension | Plan Mode | SDD Framework |
|-----------|-----------|---------------|
| Persistence | Ephemeral (lost on session end) | Files in the repo, versioned in git |
| Iteration | Hard to backtrack | Specs are editable, diffs are visible |
| Documentation | Chat history | Structured artifacts (proposal, design, tasks) |
| Team consistency | Tool-dependent | Portable across Cursor, Claude Code, Copilot |

### SDD Framework Landscape
Five main frameworks, each with a different philosophy:

| Framework | Philosophy | Best For |
|-----------|-----------|----------|
| **OpenSpec** | Brownfield-first, lightweight (44k stars) | Evolving existing codebases |
| **BMAD** | Simulates a full agile team with AI roles | Deep planning, complex greenfield |
| **spec-kit** | Greenfield-first, GitHub/Microsoft-backed, constitution + git branches | New projects from scratch |
| **PromptX** | Conversational context management via MCP | Natural interaction, meta-tool |
| **GTPlanner** | Rapid PRD generation with composable prefabs | Speed, vibe-coding adjacent |
| **Kiro** (AWS) | IDE-native spec tool | Deep AWS/Claude integration — but locked in |

### OpenSpec vs spec-kit — The Key Differences
These two are the most likely to be confused. They solve related but different problems:

| Dimension | OpenSpec | spec-kit |
|-----------|----------|----------|
| **Origin** | Fission AI, open-source | GitHub / Microsoft, open-source |
| **Project phase** | Works at any stage — brownfield-first | Greenfield-first; managing updates gets messy on existing code |
| **Folder model** | `specs/` (current truth) + `changes/` (proposed) | `specify/` folder with memory, scripts, templates |
| **Spec content** | Given/When/Then scenarios, spec deltas | What + why only (no technical details) — tech goes in `/plan` |
| **Unique feature** | Spec deltas show ADDED/MODIFIED/REMOVED per change | **Constitution** (`memory/constitution.md`) — non-negotiable project principles |
| **Git integration** | Manual | Auto-creates a branch per spec feature — deterministic, not LLM-controlled |
| **Acceptance** | Not explicit | Built-in acceptance checklist in every spec |
| **Cost (observed)** | ~$2 total (plan + full build) | ~$5 for planning alone |
| **CLI language** | Node.js (`npm install -g @fission-ai/openspec`) | Python (`uvx specify` from GitHub repo) |
| **Tool support** | 25+ tools | GitHub Copilot, Claude Code, Cursor, Codex |

**When to use which:** OpenSpec for an existing codebase you're evolving. spec-kit for a new project from scratch where you want Microsoft-backed discipline.

**spec-kit's constitution** is worth understanding — it's a file where you encode project-level non-negotiables (always use tests, specific framework version, deployment target). The LLM must respect these on every run. No OpenSpec equivalent.

**OpenSpec's spec delta** is the parallel innovation — each change records ADDED/MODIFIED/REMOVED in requirements, so PRs show *intent* alongside code. Reviewers understand *why* before reading implementation.

### OpenSpec — The Practical Choice
Lightweight, open-source, CLI + Markdown, no server or API keys needed. 44k stars. Works across 25+ AI coding tools including Claude Code, Cursor, Copilot, Codex.

**Two-folder model:**
- `openspec/specs/` — current system state (source of truth, checked into git)
- `openspec/changes/` — proposed changes in progress

**Setup (do this first):**
1. `openspec init` — sets up the folder structure and slash commands for your AI assistant. Note: older guides mention `agents.md` and `project.md` being auto-created, but the current version (verified 2026-05-04 against GitHub README) does not create these files. Run init and follow what it actually produces.

**Two workflow profiles:**

*Simple* (new default — start here):
1. `/opsx:propose "your idea"` — AI generates `proposal.md`, `design.md`, `tasks.md`, and spec deltas
2. `/opsx:apply` — implements all tasks against the spec
3. `/opsx:archive` — merges spec deltas into `specs/`; run this every time — it's the long-term memory

*Expanded* (switch with `openspec config profile`):
Adds `/opsx:new`, `/opsx:continue`, `/opsx:ff`, `/opsx:verify`, `/opsx:sync`, `/opsx:bulk-archive` — more control, more steps.

**Spec deltas** are the key innovation: each change records what was ADDED/MODIFIED/REMOVED in requirements using GIVEN/WHEN/THEN. PRs show intent alongside code — reviewers understand *why* before reading a line of implementation.

**Fast-forward mode** (`/opsx:ff`) generates all planning docs in one pass — fewer tokens but lower quality. Learn phase by phase first.

### Iteration Workflow — When You're Not Satisfied

Two paths depending on where you are:

**Path A — Spec was wrong, nothing implemented yet (or mid-implementation):**
Edit the files in `openspec/changes/<change-name>/` directly — fix `proposal.md` or the spec delta — then re-run `/opsx:apply`. Don't archive until you're happy. Repeat until satisfied, then archive once.

**Path B — Implemented, but want to improve it:**
```
/opsx:archive      ← locks in v1
/opsx:propose "update X: more specific requirement"
/opsx:apply
/opsx:archive      ← locks in v2, delta shows exactly what changed
```

Path B is more "OpenSpec native" — the spec delta records the evolution of requirements over time, so future readers understand *why* v2 differs from v1. Use Path A for corrections (spec was just wrong); use Path B for genuine feature evolution (v1 worked, you want something better).

### OpenSpec in Practice — Hands-On Session (2026-05-05)

A full-cycle OpenSpec session building a CLI Task Manager (add / list / complete / delete) with GitHub Copilot. Five rounds, each a complete `/opsx:new → apply → verify → sync → archive` cycle. Key learnings:

**Architecture-first round pattern — Round 1 is skills only, not feature code.**
The first round should produce AI Skill files (SKILL.md) and project-level instructions (AGENTS.md) only. Writing any feature code in Round 1 is a scope violation. This is the hardest discipline to hold — the AI will naturally want to scaffold modules immediately.

**AI Skill files (SKILL.md) — how to make the AI consistent.**
Create project-specific `.github/skills/<name>/SKILL.md` files that constrain the AI to a specific implementation pattern. Examples from this session:
- `python-json-persistence` — enforce `Path.read_text` + `json.dumps(indent=2)`, `FileNotFoundError` fallback
- `python-cli-argparse` — enforce subparser routing, ban raw `sys.argv`
- `python-type-validation` — require annotations on all signatures, validate empty/bad input
- `python-testing` — enforce Red→Green order, descriptive test names, `unittest.mock.patch` for storage

Without skills, the AI drifts across rounds — each feature may use different patterns. Skills front-load the standardization so every subsequent round is consistent.

**AGENTS.md — project-level AI instructions.**
A file at the project root that encodes non-negotiable workflow rules for the AI. Distinct from SKILL.md (which governs code style) — AGENTS.md governs *process*. Typical entries: always update change artifacts before implementing, run linting after every change, follow the full workflow including sync.

**SDD + TDD combination — natural fit.**
SDD and TDD are orthogonal:
- SDD (OpenSpec) governs *what* and *where* — specs define contracts, folder structure defines responsibility
- TDD governs *how* — write failing test first, then minimum code to pass

They compose via spec scenarios: each `WHEN/THEN` in a spec becomes one test to write first. The `tasks.md` enforces order — scaffold → failing tests → implement → verify. This turns spec scenarios into executable contracts.

**The `/opsx:sync` step — the most commonly skipped.**
The canonical specs in `openspec/specs/` are the source of truth, but they only update when you run sync. Without it, every archive leaves the canonical specs stale. The fix: add a named sync task to every `tasks.md` so it cannot be forgotten.

The correct expanded workflow is:
```
/opsx:new ──► /opsx:apply ──► /opsx:verify ──► /opsx:sync ──► /opsx:archive
```
Or for fast-forwarded changes:
```
/opsx:ff ──► /opsx:apply ──► /opsx:verify ──► /opsx:sync ──► /opsx:archive
```

**Versioning archived features.**
After a feature is archived, use `/opsx:new "update <feature>"` to open a new change. The new change produces a delta that records ADDED/MODIFIED/REMOVED against the v1 spec. This is how OpenSpec creates a traceable history of *why* requirements evolved — future readers see intent, not just code diffs.

**Spec drift — a quiet accumulating risk.**
During implementation, change artifacts (`proposal.md`, `design.md`, `specs/<name>/spec.md`) get modified. If you forget to update the canonical specs in `openspec/specs/` (via sync), the system accumulates silent drift. It only surfaces at archive time — by then multiple rounds may be stale. Guard: make sync a mandatory named task, not an afterthought.

### Practical Tips
- **Model**: use high-reasoning models — Opus 4.5 recommended for both planning and implementation
- **Context hygiene**: clear context window before starting implementation; specs provide the structure, a clean window prevents drift
- **Don't spec everything upfront**: create specs as you build — trying to spec an entire codebase upfront is waste
- **Always archive**: skipping `/opsx:archive` means losing the spec history — the whole point of the framework
- **Always sync before archive**: `/opsx:sync` keeps `openspec/specs/` current; skip it and canonical specs silently drift
- **Round 1 is skills only**: no feature code, no scaffolding — produce SKILL.md files and AGENTS.md only
- **Read the command list once**: before starting any project, scan the full OpenSpec command list — trial-and-error wastes time (`/opsx:add` is not a real command; `/opsx:verify` exists but isn't obvious)
- **Telemetry opt-out**: `export OPENSPEC_TELEMETRY=0` if needed

### Key Risks
- Spec drift and hallucination are hard to avoid — CI/CD is essential
- Non-deterministic generation complicates maintenance over time
- No industry consensus yet on correct workflows or evaluation

## Connections
- [[llm-wiki-concept]]: same core discipline — structure before generation, specs/schemas as the quality contract, not the output
- [[personal-knowledge-management]]: SDD solves for AI dev the same problem PKM solves for knowledge — without structure, context is lost

## Open Questions
- How will SDD practices evolve as context windows continue to grow?
- At what project complexity does the overhead of full SDD pay off vs. a lighter plan mode?
- Will one framework dominate, or will SDD become a built-in feature of all AI coding tools?
- Kiro (AWS) entering the space signals enterprise interest — how does that shift the landscape?

## Sources
- [ThoughtWorks: SDD unpacked](https://www.thoughtworks.com/en-gb/insights/blog/agile-engineering-practices/spec-driven-development-unpacking-2025-new-engineering-practices) — industry-level analysis, good for the "why now"
- [OpenSpec deep dive](https://redreamality.com/garden/notes/openspec-guide/) — practical workflow walkthrough
- [SDD framework comparison](https://redreamality.com/blog/-sddbmad-vs-spec-kit-vs-openspec-vs-promptx/) — tradeoff matrix across 5 frameworks
- [OpenSpec GitHub](https://github.com/Fission-AI/OpenSpec) — source, installation, full command reference
- [OpenSpec official site](https://openspec.dev/) — quick start and FAQ
- [OpenSpec video (WorldofAI)](https://www.youtube.com/watch?v=gHkdrO6IExM) — full tutorial; covers older init flow (agents.md/project.md); demo ran ~$2 total for one small project — not a guaranteed cost, depends on model, size, and cycles
- [spec-kit video (Den Delimarsky, GitHub maintainer)](https://www.youtube.com/watch?v=a9eR1xsfvHg&t=336s) — walkthrough of constitution, specify/plan/tasks flow, git branching; confirmed greenfield-only
