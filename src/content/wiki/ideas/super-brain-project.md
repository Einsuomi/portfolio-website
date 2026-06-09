# Super Brain Project

**Type:** idea
**Access:** public
**Tags:** second-brain, LLM, knowledge-management, portfolio, chatbot
**Updated:** 2026-06-08
**tldr:** LLM-maintained personal wiki serving as second brain and recruiter-facing portfolio chatbot, built on Karpathy's concept.
**Related:** [[llm-wiki-concept]], [[personal-knowledge-management]]

## Summary
The Super Brain is a personal LLM-maintained wiki built on Karpathy's concept, serving two purposes simultaneously: a genuine second brain for lifelong knowledge accumulation, and a portfolio chatbot that lets recruiters and HR managers interactively explore who I am — replacing the static CV with a queryable knowledge base.

## Detail

### What It Is
A git-tracked collection of markdown files organized into six knowledge domains (work, learning, ideas, family, hobbies, health), maintained by Claude via three operations: ingest new sources, answer queries, and lint for quality. The schema governs structure and conventions. All files tracked in a private GitHub repository.

### Two-Layer Access Design
Every page is either **public** (served to the portfolio chatbot) or **confidential** (owner-only, in `/confidential/` subfolders). The same wiki serves both use cases — Claude switches modes based on context.

| Layer | Who sees it | What it contains |
|-------|------------|-----------------|
| Public | Anyone visiting portfolio website | Professional identity, learning, ideas, interests |
| Confidential | Owner only | Personal reasoning, finances, family details, health |

### The Portfolio Chatbot Use Case
The public layer will be served via a chat interface on a portfolio website. Recruiters can ask questions interactively — "what has Tong worked on?", "what is Tong learning right now?", "why is Tong moving to Luxembourg?" — and get answers grounded in real accumulated knowledge, not a rehearsed pitch. This is a meaningful differentiator in a job hunt: most candidates hand a PDF, this lets the recruiter have a conversation.

**Deployment (architecture locked 2026-06-08):** Full Wix rebuild as an Astro site on Vercel — iframe approach rejected (SEO-hostile, performance penalty, doesn't fix the Wix aesthetic problem). See [[portfolio-website-rebuild]] for the complete architecture: stack, grounding boundary, conversation brief, live DE analytics pipeline (beacon → Supabase → Databricks + dbt), CV-as-code via rendercv. Wix stays live in parallel for 6+ months (URL on CVs already sent to recruiters).

**Retrieval strategy (tiered by wiki size):**
| Stage | Wiki size | Approach |
|-------|-----------|----------|
| Now | <100 pages | Stuff all public pages into system prompt — full context, no search |
| Future | 100–300 pages | ripgrep full-text search over markdown to filter relevant pages first |
| Later | 300+ pages | Embeddings with `sqlite-vec` |

At current scale (~20 pages, ~15KB), full context stuffing fits easily in Claude's context window. Don't build retrieval infrastructure until the wiki outgrows this.

### Why This Approach Over Other PKM Tools
Notion, Obsidian, Roam — all require the human to do the bookkeeping. Cross-linking, consistency, updating related pages: humans abandon these tasks at scale. The LLM handles all maintenance; the human only decides what to ingest and what to ask. See [[personal-knowledge-management]] for the full argument.

### Why Markdown + Git
- Every change is diffed — you can see how your knowledge evolved over time
- Rollback if an LLM update corrupts a page
- Private GitHub repo as access control for confidential content
- Static files are trivially served as a website or fed to a chatbot

### Six Domains
`work/` — `learning/` — `ideas/` — `family/` — `hobbies/` — `health/`
Each has a `confidential/` subfolder. `family/confidential/investment/` is a dedicated subfolder for family financial planning.

### Tooling
- **Claude Code in Warp terminal** — primary interface for all Super Brain sessions
- **claude-hud plugin** — real-time HUD showing context usage, cost, tools, session info at the bottom of the terminal
- **auto-capture hook** — `scripts/capture.py` runs on every UserPromptSubmit, queuing Claude Code sessions from `~/.claude/projects/` into `sources/queue/`; uses mtime-aware state tracking to detect resumed sessions (see [[super-brain-auto-capture]])

## Connections
- [[llm-wiki-concept]]: the architectural basis — Karpathy's three-layer design and three operations
- [[personal-knowledge-management]]: the theory of why LLM-maintained wikis succeed where human-maintained ones fail
- [[super-brain-auto-capture]]: deep-dive on the auto-capture subsystem, the silent-loss bug, and Option D fix

## Content Backlog
Identified 2026-05-05 — content that requires Tong's active input, cannot be scraped or auto-captured:

1. **Project retrospectives (work/)** — for each major project: what was the hardest decision, what would you do differently, what surprised you? Start with Fingrid. ~20 min per project, one session each.
2. **Engineering judgment (learning/)** — one "what I know" session on data modeling principles and habits built over 3 years, not tool-specific. Produces `data-engineering-principles.md`.
3. **Hobbies + health quick-fill** — 15-min Q&A on travel, skiing, cooking, general wellness. Creates 2–3 humanizing pages. Fastest to close.

## Development Backlog
Feature/technical work items, not yet started:

1. **Portfolio chatbot persona skill** — draft created 2026-05-06 (confidential). Covers audience detection, answer patterns per question type, tone rules, deflection rules, and what wiki content must exist before going live.

## Open Questions
- What is the right ingest cadence to maintain momentum?
- Portfolio website scaffolding: next step is `mkdir /Users/tong/Desktop/Projects/portfolio-website`, then install `frontend-design` plugin, then scaffold Astro. Architecture is locked in [[portfolio-website-rebuild]].
