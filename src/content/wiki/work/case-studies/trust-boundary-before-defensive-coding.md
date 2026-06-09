# Dropping Security Code Because the Threat Didn't Exist

**Type:** work
**Access:** public
**Tags:** case-study, security, yagni, refactoring, spark-sql, round-3
**Updated:** 2026-05-08
**tldr:** An implementation plan included SQL literal escaping for safety — dropped it after identifying that all inputs come from typed config models, not users. The threat surface didn't exist; the code would have protected against nothing while adding permanent maintenance cost.
**Related:** [[professional-profile]], [[senior-de-interview-framework]], [[deleting-a-dependency]]

## Context

A refactoring task: rewrite an infrastructure bootstrap module to delegate catalog, schema, and volume creation to a shared Spark utilities library, replacing SDK calls with Spark SQL throughout. The implementation plan included a SQL literal escaping utility — handling single-quote and backslash characters in strings passed to raw SQL statements (comments and storage paths).

The code was written. It worked. Then it was reverted before being committed.

## The reasoning (Round 3)

Before committing the escaping utility, one question: *where do these strings actually come from?*

They come from typed configuration models — validated at application startup, not supplied by end users, not read from external APIs. Every value is a typed string field in a config class. There is no code path that takes user-provided input and passes it through to these SQL statements. The attack surface the escaping was protecting against does not exist in this system.

Escaping adds maintenance cost: the utility must be kept correct as string types evolve, callers must remember to use it, code reviewers must check it's applied consistently. None of that cost buys anything here — you can't exploit a boundary that isn't there.

Decision: remove the utility, document the reasoning explicitly in the decisions file.

The same session surfaced a parallel case: the bootstrap module was structured as a class with no instance state, no lifecycle, and no polymorphic callers. Before adding methods to it, the question was "why is this a class?" No good answer. Replaced with a plain function. Same pattern — question the premise before building on it.

## What this signals

**Round 3 — trade-off questions before designing.** The defensive move was to add the escaping utility and move on. The senior move was to ask "what boundary am I actually defending?" and discover the boundary doesn't exist. Security code with no threat to protect against isn't safety — it's noise that degrades readability and accumulates maintenance debt.

The principle generalises: any time defensive code, validation, or abstraction is about to be added, check whether the scenario it defends against can actually occur in the system. If the answer is no, document why and leave it out. Future readers will ask "why didn't they escape this?" — the answer should be in the decisions file, not reconstructed from scratch.

## Cross-cutting principle

**Apply defensive coding at actual trust boundaries, not at every string.** Trust boundaries are where unvalidated external input enters the system: HTTP endpoints, file uploads, environment variables read at runtime, data from external APIs. Internal functions receiving values from typed, validated config models are not trust boundaries. Treating internal code paths as untrusted adds complexity proportional to the number of "defenses" without reducing actual risk.

## Connections
- [[professional-profile]]: concrete instance of "doesn't gold-plate" — implements only what the system needs, documents what was deliberately left out
- [[senior-de-interview-framework]]: Round 3 example — asks scope/threat-model questions before implementing; same diagnostic instinct as [[deleting-a-dependency]] applied to security rather than architecture
- [[deleting-a-dependency]]: the same "verify the premise before building" pattern — there, an SDK dependency; here, a defensive-coding assumption
