# LLM Wiki Concept

**Type:** learning
**Access:** public
**Tags:** LLM, knowledge-management, second-brain, Karpathy
**Updated:** 2026-04-27
**tldr:** Karpathy's proposal for LLM-maintained wikis — raw sources feed a structured wiki via three operations (ingest, query, lint), compounding over time unlike flat RAG.
**Related:** [[personal-knowledge-management]], [[super-brain-project]]

## Summary
Andrej Karpathy proposed using an LLM to continuously maintain a structured markdown wiki as a layer between raw source material and the user. The breakthrough insight is that the hard part of personal knowledge management is not reading or thinking — it is bookkeeping, which LLMs handle well. This is the architectural foundation of the Super Brain.

## Detail

### Three Layers
1. **Raw Sources** — immutable documents dropped in by the user; never edited
2. **The Wiki** — LLM-generated markdown files covering summaries, concepts, entities, and cross-references; the living knowledge base
3. **The Schema** — configuration document defining structure, conventions, and workflows; the quality contract

### Three Operations
- **Ingest**: a new source triggers updates across 10–15 related pages simultaneously — primary pages get substantive updates, secondary pages get connection notes
- **Query**: user asks a question; LLM synthesizes an answer from wiki pages with inline citations, not from raw documents
- **Lint**: periodic health check catching contradictions, orphan pages, stale open questions, and thin pages

### Why This Beats Standard RAG
RAG (retrieval-augmented generation) re-derives knowledge from raw documents on every query — no compounding, no synthesis. The wiki pre-computes understanding: each ingestion makes the whole system richer. After 100 ingestions the wiki is dramatically more useful than after 10; a RAG index is roughly linearly better.

### Key Risks to Manage
- **Silent hallucination**: bad synthesis can corrupt pages without obvious errors — the lint pass is not optional
- **Schema drift**: a poorly maintained schema causes incoherent growth over time; revisit it every few months
- **Cold-start quality**: the first 20–30 ingestions set the quality baseline; human review matters most here
- **API exposure**: the LLM API sees all ingested content — accept this, and keep sensitive material in confidential folders

### Why Markdown + Git
Diffs make knowledge evolution visible. Git provides rollback if an LLM update corrupts a page. Files are human-readable without tooling and trivially served as a website or fed to a chatbot.

## Connections
- [[personal-knowledge-management]]: the PKM failure modes this concept directly solves — maintenance overhead and bookkeeping burden
- [[super-brain-project]]: this concept is the direct architectural basis of the Super Brain being built here
- [[spec-driven-development]]: same discipline applied to AI coding — schema/spec as the quality contract, structure before generation

## Open Questions
- What is the right lint frequency? After every 10 ingestions feels right but needs validation over time.
- How to detect hallucination in synthesized wiki pages without re-reading every source after ingestion?
- Can the schema self-improve — i.e., should the schema itself be updated via ingestion?

## Sources
- [Karpathy LLM Wiki Gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) — original proposal; short read, high signal
