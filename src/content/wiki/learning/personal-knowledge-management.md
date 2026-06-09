# Personal Knowledge Management

**Type:** learning
**Access:** public
**Tags:** PKM, second-brain, productivity, knowledge
**Updated:** 2026-04-27
**tldr:** Classic PKM fails because humans can't sustain bookkeeping at scale; LLMs fix this by taking over maintenance, leaving humans to curate and query.
**Related:** [[llm-wiki-concept]], [[super-brain-project]]

## Summary
Personal knowledge management (PKM) is the practice of capturing, organizing, and retrieving what you learn over time. The classic failure mode — abandoned wikis and stale notes — comes from maintenance overhead outpacing human motivation. LLMs change the equation by taking over the bookkeeping, leaving the human to focus on curation and thinking.

## Detail

### Why Personal Wikis Fail
The pattern is consistent: a person starts a wiki with good intentions, maintains it for a few weeks, then gradually stops cross-linking, stops updating related pages, and eventually distrusts the index. The wiki becomes a write-only graveyard. The root cause is not laziness — it is that humans are good at reading and thinking but poor at large-scale bookkeeping. Maintaining 500 interconnected pages manually is simply not a sustainable task.

### What LLMs Change
An LLM can handle the bookkeeping automatically: cross-referencing, updating related pages on ingestion, catching contradictions, generating summaries. The human role shifts entirely to curation (what sources to add) and analysis (what questions to ask). This is a sustainable division of labor.

### Compounding Knowledge
A flat note-taking app has roughly linear value — 100 notes is roughly 10x better than 10 notes. A wiki with LLM-maintained cross-references has compounding value: each new page makes existing pages richer. After enough ingestions, asking a question surfaces connections the user would never have made manually. This is the core value proposition over apps like Notion or Obsidian used without automation.

### Design Principles
- **Schema first**: the structure of the wiki determines its long-term coherence; a poor schema causes drift that compounds over time
- **Synthesis over transcription**: the wiki should contain understanding, not copied text — if you wanted the original, you'd read the source
- **Small pages over big pages**: granular pages cross-link better and age more gracefully than monolithic ones
- **Lint regularly**: contradictions and orphans compound if ignored; a periodic health check is load-bearing
- **Public/private separation**: the same knowledge base can serve personal use (full access) and external audiences (public layer only) — this enables a portfolio chatbot use case without exposing sensitive material

### The Right Mental Model
Think of it not as a note-taking system but as a research assistant maintaining your extended memory. You bring raw material; it synthesizes, connects, and makes everything queryable. The goal is that future-you can ask a question and get an answer grounded in everything past-you has ever learned.

## Connections
- [[llm-wiki-concept]]: the specific technical architecture (Karpathy's proposal) that implements these PKM principles at scale
- [[super-brain-project]]: the concrete application of PKM principles being built here, with a portfolio chatbot as an additional use case

## Open Questions
- What is the right ingestion cadence to maintain momentum without overwhelming the review process?
- How do you handle sources that partially contradict each other — synthesize a middle position, or represent both views?

## Sources
- Synthesized from PKM literature and conversation — no single source; update with specific books/papers as they are ingested
