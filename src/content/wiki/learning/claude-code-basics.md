# Claude Code Basics

**Type:** learning
**Access:** public
**Tags:** claude-code, tools, workflow, productivity
**Updated:** 2026-05-08
**tldr:** Practical Claude Code features, shortcuts, billing reality, and plugin ecosystem — things not obvious from the docs.
**Related:** [[minne-memory-system]], [[spec-driven-development]]

## Summary
Claude Code is Anthropic's CLI for Claude — runs in the terminal, works across projects. Key non-obvious things: most useful features are slash commands and keyboard shortcuts, billing via Pro subscription is informational not additive, and the plugin ecosystem (especially claude-hud) meaningfully improves the experience.

## Detail

### In-Session Shortcuts
- **Esc** — interrupts Claude mid-operation (not a slash command, just the keyboard key)
- `@filename` — reference a specific file in your prompt to focus Claude on it
- Paste screenshots directly — Claude Code reads images
- Drag files into the prompt (desktop app)
- `! command` — run a shell command inline without leaving chat (e.g. `! git log`)

### Session Management
| Command | What it does | Fires SessionStart hook? |
|---------|-------------|--------------------------|
| `/compact` | Compresses context when conversation gets long — use proactively at ~70-80% full | **No** |
| `/clear` | Wipes conversation context but keeps CLAUDE.md and memory intact | **Yes** |
| `/new` | Alias for `/clear` | **Yes** |
| `/reset` | Alias for `/clear` | **Yes** |
| `/context` | Shows token usage breakdown (system prompt, tools, messages, free space) | No |
| `/cost` | Shows session cost so far | No |
| `/status` | Session info, model, login method | No |

**Biggest beginner mistake:** letting context get too long without `/compact`. Quality drifts and cost spikes. Compact early, compact often.

**SessionStart hook behavior:** `/clear`, `/new`, and `/reset` all trigger `SessionStart` hooks, exactly like launching a fresh `claude` process. `/compact` does not — it continues the same session.

### Memory System
- **`#` prefix** — adds something to project memory mid-conversation (e.g. `# always use Python 3.11`)
- **`/memory`** — view what Claude has stored
- **CLAUDE.md** — persistent instructions; global at `~/.claude/CLAUDE.md`, project-level in repo root
- **Super Brain wiki** — separate from Claude's internal memory; wiki is for substantive knowledge, `#` memory is for behavioral preferences

### Built-in Tools (No Config Needed)
- **WebSearch** — search the web; returns snippets like a search result page
- **WebFetch** — fetches full page content; blocked by anti-bot sites (Reddit, Cloudflare-protected)
- For heavily bot-protected sites: Playwright MCP provides real browser rendering — add when you hit recurring walls

### Billing Reality
- **Claude Pro** ($20/mo) = claude.ai only, does NOT include Claude Code API access
- **Claude Code via Pro login** — works, and the `$0.xx` shown in Usage tab is **informational only** (equivalent API cost, not a real charge)
- Verify at `console.anthropic.com` → Billing. If balance is $0 and no API key set → you're on subscription, not paying extra
- **Claude Max** (~$100–200/mo) — includes Claude Code with rate limits, no per-token charges; better for heavy use

### Cross-Machine Use
- CLAUDE.md files and the wiki are **local to the machine** — not synced automatically
- To use Super Brain on another computer: sync via git (wiki repo) and manually copy `~/.claude/CLAUDE.md`
- Session history does not persist between machines or sessions

### claude-hud Plugin
A community plugin that adds a live dashboard to the terminal status line.

- **GitHub**: [jarrodwatts/claude-hud](https://github.com/jarrodwatts/claude-hud) — 21k+ stars, MIT license
- **Zero network requests** — reads only local files (transcripts, git, config)
- **Shows**: context usage, cost, session tokens, tools activity, agents/todos, session duration, session name
- **Install**: `/plugin marketplace add jarrodwatts/claude-hud` → `/plugin install claude-hud` → `/reload-plugins` → `/claude-hud:setup` → restart

### Recommended Terminal: VS Code Integrated Terminal
The VS Code integrated terminal works well for Claude Code — files and code are visible in the same window, which is the main practical advantage. Warp was tested and removed: its file-browsing UX didn't fit the workflow.

### Git Workflow Lessons
Non-obvious git behaviors learned in practice:

**Rebase on diverged branch + force-push:**
- If remote `main` has commits not in local (e.g. GitHub auto-created a README), use `git pull origin main --rebase` — this replays your commits on top of remote's commits, rewriting hashes
- After rebase, any branch you already pushed has stale hashes → must force-push: `git push --force-with-lease origin <branch>`
- Without the force-push: GitHub shows no PR button (can't reconcile histories)

**Branch tracking:**
- `git branch -vv` shows which remote each local branch tracks
- Set manually: `git branch --set-upstream-to=origin/main main`
- Safe branch delete: `git branch -d <name>` — checks fully merged; `-D` force-deletes

### GitHub Branch Protection
- Branch protection rules on **private repos** require **GitHub Pro** (~$4/month)
- **GitHub Free** = branch protection on public repos only
- Workaround: self-discipline + PR conventions (always branch, always open PR, never force-push main)

### Skills

Skills encode repetitive multi-step tasks as a markdown file Claude Code reads and executes.

**File structure:**
```
.claude/
  skills/
    [skill-name]/
      skill.md       ← YAML frontmatter + step-by-step instructions
```

**skill.md format:**
```yaml
---
name: fetch-api
description: Fetches CSV data from GitHub raw URLs using async httpx and saves to a timestamped folder
---
```
Then markdown steps below the frontmatter.

**Key insight — description quality = routing accuracy.** Claude Code reads the description to decide whether to invoke a skill automatically when you don't explicitly name one. A vague description ("query data") causes the wrong skill to fire. A specific description ("execute SQL against a warehouse using DBSQL") routes correctly. This is the root cause of skill mis-selection in tools like the [[databricks-ai-dev-kit]].

Skills vs. sub-agents: skills define *what to do* (orchestration steps). Sub-agents define *who does it* (a specialized agent with constrained access).

### Sub-Agents

Sub-agents are lighter instances of Claude Code — isolated, constrained, and optionally cheaper.

**File structure:**
```
.claude/
  agents/
    [agent-name]/
      [agent-name].md   ← YAML frontmatter with name, description, tools, model
```

**Key parameters:**
```yaml
---
name: code-reviewer
description: Reviews code for quality, naming, and edge cases. Does not modify files.
model: claude-haiku-4-5-20251001
tools: [Read, Glob]
disallowedTools: [Write, Edit]
memory: project
---
```

**Why use sub-agents:**
- **Isolated context window** — sub-agent gets a fresh window, not the full parent chat history. Saves tokens on long sessions.
- **Cost optimization** — use Haiku for low-stakes tasks (scanning, reviewing, documenting); reserve Sonnet/Opus for code generation
- **Restricted permissions** — prevent a task from touching files or tools it shouldn't (e.g. a review agent that can read but not write)
- **Parallel execution** — Claude Code can delegate to multiple sub-agents simultaneously for independent tasks

Sub-agents don't define steps — they define capabilities and constraints. Let the agent figure out *how*; write a skill if you need *what* spelled out.

### Hooks — Practical Tips

Always create `settings.json` by asking Claude Code to add the hook — don't create the file manually. Claude Code tracks `settings.json` internally; a manually created file can be silently overwritten or ignored when Claude Code syncs its own config. If a hook stops working, delete `settings.json` and re-ask Claude Code to create it.

**Hook I/O — where stdout/stderr go:**
- Both stdout and stderr from hooks go into Claude's context as a `system-reminder`. Neither is printed directly to the user's terminal.
- The only exception: `stderr + exit code 2` is shown to the user in the terminal (Claude Code treats it as an error signal). Not a banner mechanism — just for error visibility.
- Implication: if you want the user to see hook output, the hook must tell Claude to echo it (e.g. print a `REQUIRED: Echo this` instruction line), and Claude must comply.

**Parallel vs sequential hook groups:**
- Hooks in the **same** `{"hooks": [...]}` array run in **parallel**.
- Separate `{"hooks": [...]}` objects in the outer array run **sequentially**.
- If hook B depends on hook A's output (e.g. B reads files that A writes), they must be in separate sequential groups — or B will see stale state.

## Connections
- [[minne-memory-system]]: minne extends Claude Code's session capture — the auto-capture hook in Super Brain was inspired by it
- [[spec-driven-development]]: Claude Code is one of the supported tools for OpenSpec's SDD workflow
- [[databricks-ai-dev-kit]]: MCP server + skills extend Claude Code specifically for Databricks workspaces

## Open Questions
- When should Playwright MCP be added globally? Add when a recurring pattern of blocked sites emerges.
- Does `/compact` lose important context or does it preserve the essentials? Test on a long session.

## Sources
- Claude Code session transcripts, Apr 28–29 2026
- [jarrodwatts/claude-hud](https://github.com/jarrodwatts/claude-hud) — reviewed Apr 29 2026
