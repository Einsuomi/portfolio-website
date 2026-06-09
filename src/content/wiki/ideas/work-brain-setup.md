# Work Brain Setup

**Type:** idea
**Access:** public
**Tags:** second-brain, work, privacy, IP, minne, architecture
**Updated:** 2026-05-03
**tldr:** Architecture for capturing work session knowledge without mixing company IP into the personal Super Brain — separate work machine brain, manual distillation of general learnings only.
**Related:** [[super-brain-project]], [[minne-memory-system]]

## Summary
Using the Super Brain at work introduces two privacy risks: personal confidential data on company hardware (company IT can access), and company IP flowing into a personal GitHub repo (violates most employment contracts). The clean solution is to keep them separate — minne captures work sessions on the work machine, and only general skills/learnings cross back to the personal Super Brain through a deliberate manual distillation step.

## Detail

### Why Not Clone Super Brain to Work Machine
Two risks run in opposite directions:

1. **Personal data on company hardware** — work computers have MDM/endpoint monitoring. IT can access the filesystem. Cloning the full Super Brain repo (including `/confidential/` paths) exposes personal data to the employer.

2. **Company IP in personal repo** — most employment contracts say anything produced or learned on company time belongs to the company. Work session content (code, architecture decisions, product strategy) pushed to a personal GitHub repo could be claimed as company IP.

### Planned Architecture

```
Personal machine (personal GitHub)
└── Super Brain — full repo, confidential paths, all of life

Work machine (work GitHub or local-only)
└── minne — session capture only, stays on company hardware
    ~/minne/store/chats/<repo>/
        ├── summary.md  — keyword index (digest target)
        └── journal.md  — first-person diary entry

Monthly manual sync:
└── LLM pass over minne summaries → personal-learnings-YYYY-MM.md
    → human review (IP filter) → sources/queue/ → Super Brain ingest
    (only general skills, tools, patterns — nothing company-specific)
```

### Minne at Work
Minne is the chosen tool because:
- Captures GitHub Copilot, VS Code Copilot Chat, and Claude Code sessions natively
- Digest backend can use GitHub Copilot CLI instead of Anthropic API (no personal API key needed on work machine)
- Lives entirely on the work machine — no company data leaves
- Installable via `uv tool install minne`

Config for work machine (`~/.config/minne/config.toml`):
```toml
[digest]
backend = "copilot"
model = "gpt-4.1"   # use an included/0× quota model
```

### The IP Filter
The LLM pass extracts general knowledge but cannot know what is company-sensitive. The human review step is non-optional. Practical filter: "would I be comfortable if my employer read this page?" If yes → can enter personal Super Brain. If no → stays on work machine.

Company-specific: internal architecture, product decisions, team observations, code from work projects.
General knowledge: tools learned, techniques adopted, programming patterns, industry concepts.

### Work Machine Confidential Folder
A work brain repo could have a `confidential/` folder (career reflections, performance notes). But this only controls what you share with colleagues — the company IT can still access everything on company hardware. It's a sharing control, not a privacy control.

## Connections
- [[super-brain-project]]: work brain is a satellite that feeds the personal Super Brain via manual distillation
- [[minne-memory-system]]: minne is the capture layer on the work machine; Copilot backend avoids needing a personal API key at work

## Open Questions
- When switching from Copilot to Claude Code at work (post-June 2026 depending on pricing): does the capture.py hook need updating for the work machine, or does minne replace the need for it entirely?
- Build the LLM distillation script: takes minne summaries from last N days, extracts general learnings, outputs a source file ready for Super Brain ingest.

## Sources
- Discussion: 2026-05-02 session on work brain architecture and minne Copilot integration
