# Minne — Session Memory System

**Type:** learning
**Access:** public
**Tags:** memory, Claude-Code, session-capture, PKM, automation, python, copilot
**Updated:** 2026-05-03
**tldr:** Open-source Claude Code session logger by Ville Vainio — auto-captures transcripts, digests with Haiku or GitHub Copilot into keyword summaries and journal entries; key ideas absorbed into Super Brain design.
**Related:** [[super-brain-project]], [[llm-wiki-concept]], [[work-brain-setup]]

## Summary
Minne is a CLI tool by Ville Vainio that automatically captures Claude Code (and GitHub Copilot) session transcripts, then digests them with Haiku into keyword-dense summaries and first-person journal entries stored in a searchable local store. Reviewed as a reference implementation to identify ideas worth absorbing into the Super Brain.

## Detail

### What It Does
- **Ingest**: reads Claude Code session files from `~/.claude/projects/*/*.jsonl` automatically — no manual trigger
- **Digest**: runs each transcript through Haiku (4 parallel workers) producing three files per session: `chat.md` (raw), `summary.md` (keyword index + tldr), `journal.md` (first-person diary entry)
- **Clips**: `minne add` pipes any text/stdout into memory, correlated with the current session
- **Search**: `rg` (ripgrep) across keyword-dense summaries; `minne ls --days N` for date filtering; `minne journal` for diary aggregation
- **Skill**: bundled Claude Code skill teaches the agent to search the store and add clips proactively

### Architecture
```
~/minne/
├── inbox/   — raw transcripts awaiting digest
└── store/
    ├── chats/<repo>/<date-slug>/
    │   ├── chat.md       — full transcript
    │   ├── summary.md    — keyword index, slug, tldr front matter
    │   └── journal.md    — 2-3 sentence first-person diary entry
    └── clips/<repo>/     — hand-pinned notes from minne add
```

Non-git sessions get auto-categorized by Haiku under `_nogit/<category>/`.

### Digest Backend Options
By default digest uses Claude Code (runs via `claude -p`, uses Claude subscription — no API key needed). If no Claude subscription, Copilot CLI can be used instead:

```toml
# ~/.config/minne/config.toml
[digest]
backend = "copilot"
model = "gpt-4.1"   # use an included/0× quota model to avoid burning premium requests
```

Requirements for Copilot backend: Copilot CLI on PATH, authenticated via `gh auth login`. No Anthropic API key needed. Good fit for work machines where a personal Anthropic key may not be permitted.

### Why It Was Built as a CLI
Designed for distribution — anyone can `uv tool install minne`. Super Brain is personal-only so no CLI needed.

### Using Minne at Work
Planned setup: install minne on work machine, set Copilot as digest backend. Work sessions stay on company hardware — no IP leaves the work machine. Periodically distill general learnings (tools, patterns — nothing company-specific) into a source file, copy to personal machine, ingest into Super Brain. The LLM pass on minne summaries can help extract the general-knowledge signal while filtering company-specific details — but human review before crossing machines is non-optional.

See [[work-brain-setup]] for full architecture.

### Scope Comparison

| Dimension | Minne | Super Brain |
|-----------|-------|-------------|
| Scope | Coding sessions only | All of life (work, family, health, ideas) |
| Capture | Fully automatic (transcript scan) | Manual queue + auto-capture hook |
| Output | keyword summaries + journal | Rich prose wiki with cross-links |
| Search | grep/rg on keyword store | Wiki navigation + grep by Updated date |
| Portfolio use | None | Public layer for recruiter chatbot |
| Cost model | Haiku for bulk, cheap | Sonnet, switch to Haiku for bulk later |

## What We Absorbed

1. **Auto-capture hook** — implemented as `scripts/capture.py`, a `UserPromptSubmit` hook that scans `~/.claude/projects/*/*.jsonl` for previous-day sessions and queues them into `sources/queue/`. Mtime-aware so resumed sessions are re-captured when content grows. See [[super-brain-auto-capture]] for the full design.

2. **tldr field** — added as a required frontmatter field on all wiki pages and source files. Lets Claude scan all tldr lines first to decide relevance before reading full pages — faster retrieval.

3. **Date-based retrieval** — Super Brain can already filter by `Updated:` field via grep; no extra tooling needed.

4. **Haiku for bulk digestion** — noted for future use when ingest volume grows; current Sonnet usage is fine at low volume.

## Connections
- [[super-brain-project]]: auto-capture hook and tldr field were added to Super Brain after reviewing minne
- [[super-brain-auto-capture]]: capture.py design was shaped by minne's approach to session ingestion
- [[llm-wiki-concept]]: minne is a complementary approach — session logger vs structured wiki; different granularity and scope
- [[work-brain-setup]]: minne is the planned session capture tool for the work machine

## Open Questions
- Check minne repo periodically for updates — may add features worth absorbing: https://github.com/vivainio/minne
- Is the `minne journal` first-person diary format worth adding to Super Brain as a dedicated journal section?
- Build a script to LLM-distill minne summaries → personal-learnings source file for monthly sync to Super Brain

## Sources
- [vivainio/minne on GitHub](https://github.com/vivainio/minne) — source code and README; reviewed 2026-04-29, backend options confirmed 2026-05-02
