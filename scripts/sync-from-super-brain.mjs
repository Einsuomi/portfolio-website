/**
 * Sync public wiki pages from Super Brain into src/content/wiki/.
 * Filters out any path containing "/confidential/" — those must never enter this repo.
 * Run via: npm run sync
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WIKI_SRC = path.resolve(__dirname, '../../../AI Memory/Super Brain/wiki');
const CONTENT_DEST = path.resolve(__dirname, '../src/content/wiki');

// Grep for known sensitive patterns even in otherwise-public files.
// Add strings here if a public file ever slips something sensitive through.
const DENYLIST = [
  // Add employer-internal codenames, colleague names, etc. as needed.
];

/** Recursively collect all .md files under a directory. */
function collectMarkdownFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

/** Return true if the file content contains any denylist pattern. */
function hitsDenylist(content) {
  return DENYLIST.some((pattern) => content.includes(pattern));
}

// --- main ---

if (!fs.existsSync(WIKI_SRC)) {
  console.error(`Super Brain wiki not found at: ${WIKI_SRC}`);
  process.exit(1);
}

// Clear the dest so deleted/renamed wiki pages don't linger.
fs.rmSync(CONTENT_DEST, { recursive: true, force: true });
fs.mkdirSync(CONTENT_DEST, { recursive: true });

const all = collectMarkdownFiles(WIKI_SRC);
let synced = 0;
let skippedConfidential = 0;
let skippedDenylist = 0;

for (const srcFile of all) {
  // Hard rule: skip anything under a /confidential/ directory.
  if (srcFile.includes('/confidential/')) {
    skippedConfidential++;
    continue;
  }

  const content = fs.readFileSync(srcFile, 'utf8');

  // Secondary check: skip files containing sensitive patterns.
  if (hitsDenylist(content)) {
    skippedDenylist++;
    console.warn(`  DENYLIST HIT — skipped: ${path.relative(WIKI_SRC, srcFile)}`);
    continue;
  }

  // Preserve relative path from wiki root (e.g. "work/case-studies/my-study.md").
  const relPath = path.relative(WIKI_SRC, srcFile);
  const destFile = path.join(CONTENT_DEST, relPath);
  fs.mkdirSync(path.dirname(destFile), { recursive: true });
  fs.copyFileSync(srcFile, destFile);
  synced++;
}

console.log(`\nSync complete:`);
console.log(`  Synced  : ${synced} pages`);
console.log(`  Skipped : ${skippedConfidential} confidential`);
if (skippedDenylist > 0) {
  console.log(`  Skipped : ${skippedDenylist} denylist hits (review warnings above)`);
}
console.log(`\nRun "git diff src/content/" to inspect what changed before committing.\n`);
