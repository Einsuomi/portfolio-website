#!/usr/bin/env node
// PostToolUse hook: auto-logs every subagent dispatch (prompt + report) to a
// per-task file logs/YYYY-MM-DD-<task>.md, one "## Iteration N" section per dispatch.
// The task slug comes from a "TASK: <kebab-slug>" line at the top of the dispatch
// prompt; dispatches without one land in -misc.md (architect should fix the prompt).
import { appendFileSync, mkdirSync, readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  const data = JSON.parse(raw);
  if (data.tool_name !== 'Agent') return;

  // logs/ lives at the project root and is gitignored
  const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const dir = join(root, 'logs');
  mkdirSync(dir, { recursive: true });

  const input = data.tool_input || {};

  // task slug from the dispatch prompt's "TASK: <slug>" line
  const m = (input.prompt || '').match(/^TASK:\s*([a-z0-9][a-z0-9-]*)/im);
  const task = m ? m[1].toLowerCase() : 'misc';

  // a task may span days: append to its existing file if one exists,
  // otherwise start a new file dated today
  const now = new Date();
  const existing = readdirSync(dir)
    .filter((f) => f.endsWith(`-${task}.md`))
    .sort();
  const file = existing.length
    ? join(dir, existing[existing.length - 1])
    : join(dir, `${now.toISOString().slice(0, 10)}-${task}.md`);

  // iteration number = existing iteration headers + 1
  let iter = 1;
  if (existsSync(file)) {
    iter += (readFileSync(file, 'utf8').match(/^## Iteration \d+ /gm) || []).length;
  }

  // the agent's final report comes back as message-style content blocks;
  // pull out the text and fall back to raw JSON for anything unexpected
  const resp = data.tool_response;
  let report;
  if (typeof resp === 'string') {
    report = resp;
  } else if (resp && Array.isArray(resp.content)) {
    report = resp.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n');
  }
  if (!report) report = JSON.stringify(resp, null, 2);

  const agent = `${input.subagent_type || 'agent'}${input.model ? ` (${input.model})` : ''}`;
  const entry = [
    `\n---\n## Iteration ${iter} — ${now.toISOString()} — ${agent} — ${input.description || ''}`,
    `\n### Dispatch prompt\n\n${input.prompt || '(none)'}`,
    `\n### Report\n\n${report}`,
    // empty section the architect fills in by hand — stays visibly blank if forgotten
    `\n### Decision / Verification\n\n_(pending)_\n`,
  ].join('\n');

  appendFileSync(file, entry);
});
