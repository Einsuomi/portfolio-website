# Super Brain Auto-Capture System

**Type:** idea
**Access:** public
**Tags:** second-brain, auto-capture, system-design, reliability, debugging
**Updated:** 2026-05-08
**tldr:** How the Super Brain automatically captures Claude Code sessions into the queue, the bugs found and fixed (silent-loss, race condition, empty-queue), and the current SessionStart + sequential-group design.
**Related:** [[super-brain-project]], [[llm-wiki-concept]]

## Summary
The Super Brain captures every Claude Code session automatically via a pair of `SessionStart` hooks. Multiple bugs were found and fixed: resumed sessions were silently lost (mtime-aware Option D fixed it); the two hooks raced when in the same parallel group (sequential groups fixed it); the empty queue was silent (now always prints a confirmation banner). The current design is `capture.py` → `queue_notify.py`, sequential, once per session start.

## Detail

### How Auto-Capture Works
Two `SessionStart` hooks run once per session, in sequential groups: `capture.py` first, then `queue_notify.py`. `capture.py` scans `~/.claude/projects/*/*.jsonl` for sessions last modified before today, extracts text-only conversation (skipping tool_use, tool_result, and thinking blocks), and writes structured markdown files to `sources/_queue/`. `queue_notify.py` then reads the queue and prints the banner to stdout. The assistant surfaces the banner in its first response.

### The Silent-Loss Bug
The original design tracked session IDs in `sources/.processed-sessions` as a flat list. Once a session ID appeared in that file, it was never rechecked. The failure mode:

1. Session active on Day 1 → capture.py runs → session might be early/short → marks as processed
2. User resumes session on Day 1 or Day 2 → JSONL grows significantly
3. Capture.py skips it forever — already in `.processed-sessions`

Found when investigating a 1.7MB session (73,909 chars, 217 messages) that had no autocapture file anywhere. The `extract_conversation()` function worked perfectly on the final state — the bug was purely in the state-tracking design.

### Option D: Mtime-Aware State Tracking
Redesigned `.processed-sessions` from a flat list to a TSV with `(session_id, mtime_float)` pairs. On each capture.py run:

- If `current_mtime > stored_mtime` → session grew → reprocess (write new queue file, overwriting any pending version)
- If `stored_mtime` is absent → never seen before → process normally
- If extract returns empty → log to `sources/.skipped-sessions` with reason and timestamp, do **not** mark as processed (retries will happen if the file grows)

Options A and B were considered and rejected:
- **Option A** (filesystem as truth — no state file): would re-process sessions whose autocapture files were intentionally deleted after ingest; doesn't handle resumed sessions that were already ingested in their early form
- **Option B** (atomic write order only): fixes future silent failures from crashes, but doesn't detect resumed sessions — the core failure mode

### Silence Hides Bugs
The original behavior was "stay silent when no sessions are queued." This masked the bug: sessions were being lost, but no signal ever surfaced it. The fix was to make every state visible:

- Fresh sessions queued → distinct banner
- Resumed sessions queued → distinct banner (notes "re-captured because content grew")
- Nothing queued → brief "no previous session in queue" notice instead of silence

That single change — surfacing the empty state — would have caught this bug days earlier.

### Time-Based Query Limitation
`git log` only finds sessions that were committed. Sessions pending ingest (sitting in `sources/queue/`) or sessions captured after the last commit are invisible to git. The SCHEMA.md query workflow now requires also checking `sources/**/autocapture-<date>-*.md` as a fallback.

### Queue Banner — Sequential SessionStart Hooks

Originally the banner was Claude's responsibility — CLAUDE.md instructed the assistant to check the queue and print it. Unreliable: a complex opening message could distract the assistant and skip the check.

Fixed by adding `scripts/queue_notify.py` as a second hook. Three bugs were discovered and fixed in the process:

**Bug 1 — Race condition (parallel hooks):** Both scripts were in the same `hooks` array. Claude Code runs hooks within the same array in parallel. So `queue_notify.py` would scan `_queue/` while `capture.py` was still writing — seeing an empty queue and printing nothing. Fix: split into two separate `{"hooks": [...]}` groups in `settings.json`. Groups run sequentially; `capture.py` completes before `queue_notify.py` reads.

**Bug 2 — Empty-queue silence:** `queue_notify.py` had `if not files: return` — silent when queue was empty, masking a broken hook as "no sessions." Fixed to always print `##### AUTO-CAPTURE: no previous session in queue #####`. Silence is a hidden failure; a confirmation notice is always better.

**Bug 3 — Hook output not visible to user:** Hook stdout goes into Claude's context as a `system-reminder`, not directly to the user's terminal. Claude sees it but doesn't echo it unless instructed. Fixed by: (a) `queue_notify.py` prepending a `REQUIRED: Echo ...` instruction line before the banner; (b) adding a `SESSION START — MANDATORY` section to the global `CLAUDE.md`.

**SessionStart vs UserPromptSubmit trade-off:** `capture.py` only captures previous-day sessions, so running it on every prompt never captures anything new — SessionStart loses nothing in normal use. One edge case: a session crossing midnight won't pick up other sessions that ended after the session started; those get captured at the next session start instead. Acceptable for typical workflow.

Key design principle: hooks are more reliable than instructions for anything that must always happen. Instructions can be missed; hooks run unconditionally.

## Connections
- [[super-brain-project]]: auto-capture is a core subsystem of the overall project architecture
- [[llm-wiki-concept]]: the self-maintaining wiki relies on reliable session ingestion — a leaky capture pipeline undermines the whole premise

## Open Questions
- Should the queue show a content preview (first 100 chars of transcript) in the banner so Tong can decide to skip without opening the file?
- Long-term: should autocapture files be deleted after ingest (clean), or retained as a raw record (current behavior, but accumulates)?
