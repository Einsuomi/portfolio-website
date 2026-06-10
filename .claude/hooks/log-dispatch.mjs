#!/usr/bin/env node
// PostToolUse hook: auto-logs every subagent dispatch (prompt + report)
// to logs/YYYY-MM-DD-dispatches.md so no dispatch is ever missed.
import { appendFileSync, mkdirSync } from 'node:fs';
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

  const now = new Date();
  const file = join(dir, `${now.toISOString().slice(0, 10)}-dispatches.md`);

  const input = data.tool_input || {};
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

  const entry = [
    `\n---\n## ${now.toISOString()} — ${input.subagent_type || 'agent'}${input.model ? ` (${input.model})` : ''} — ${input.description || ''}`,
    `\n### Dispatch prompt\n\n${input.prompt || '(none)'}`,
    `\n### Report\n\n${report}`,
    // empty section the architect fills in by hand — stays visibly blank if forgotten
    `\n### Decision / Verification\n\n_(pending)_\n`,
  ].join('\n');

  appendFileSync(file, entry);
});
