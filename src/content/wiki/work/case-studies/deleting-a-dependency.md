# Deleting a Dependency Instead of Duplicating It

**Type:** work
**Access:** public
**Tags:** case-study, databricks, spark-sql, architecture, round-2, round-3
**Updated:** 2026-05-07
**tldr:** A duplication-cleanup ticket that started as "add an SDK variant function" and ended with removing the SDK from the module entirely — because a 30-second observability test showed the only feature justifying the SDK wasn't observable anywhere.
**Related:** [[professional-profile]], [[senior-de-interview-framework]], [[fingrid-pipeline]]

## Context

A duplication-cleanup ticket sat between two internal modules: an infrastructure bootstrap component and a shared Spark utilities library. On paper, both modules created Databricks objects (catalog, schema, volume) — one using the Databricks SDK's `WorkspaceClient` directly, the other using Spark SQL `IF NOT EXISTS`. Two implementations of the same operation. The brief was to consolidate.

The expected fix was straightforward: add an SDK variant of the existing Spark-SQL function to the utilities library so the bootstrap module could call into it instead of inlining the SDK. Same SDK code, just centralized. A senior engineer reviewing the design flagged that this would break the consistent SparkSession-based API of the utilities module — that became the constraint.

## The reasoning (Round 2 / Round 3)

The first instinct — add an SDK variant — was rejected on the API-consistency point. Considered keeping the SDK inline in bootstrap and just extracting a private helper. Rejected too — that hides the duplication, not removes it.

At that point the question shifted from *how to consolidate* to *why is the SDK here at all?* The only SDK-specific feature in use was `properties={}` on the catalog — a metadata dict the Spark SQL path can't write. Was that feature load-bearing?

A 30-second test answered it: `DESCRIBE CATALOG EXTENDED` did not surface the properties. They were not visible in the workspace UI. A grep across the codebase found no consumer reading them. The only way to retrieve them was a separate SDK REST call — which nothing did.

That single observation collapsed the architecture decision. With `properties={}` confirmed unobservable, the SDK had no remaining justification in this layer. The fix expanded: replace all three DDL operations (catalog, schema, volume) with Spark SQL `IF NOT EXISTS` in the utilities library; remove `WorkspaceClient` from the bootstrap module entirely; fold the informational intent of `properties` into the `COMMENT` field, which *is* visible.

Result: the dependency wasn't centralized — it was deleted. The bootstrap module became thin orchestration over a single consistent Spark SQL surface.

## What this signals

**Round 2 — diagnose before reacting.** The reflexive move was to add a function. The diagnostic move was to ask whether the function should exist. The same instinct that says "Spark UI before cluster size" at the implementation level shows up at the architecture level: read the data first.

**Round 3 — trade-off questions before designing.** Three questions reshaped the solution: *Is the SDK feature actually observable? Is anything reading it? What does keeping the SDK cost vs. removing it?* Without those, the original "SDK variant" path looks reasonable. With them, it's clearly the wrong shape.

## Cross-cutting principle

**Invisible metadata is not worth a dependency.** Any time a dependency is justified by "feature X needs it", confirm feature X is actually observable and consumed before accepting the dependency cost. A 30-second test is cheaper than building around an assumption — and the result, when the assumption fails, is a smaller surface, not a larger one.

## Connections
- [[professional-profile]]: concrete instance of "asks why before accepting a pattern" — the SDK was assumed necessary; a 30-second test removed the assumption
- [[senior-de-interview-framework]]: real Round 2/3 example for the framework's answer patterns — diagnose before reacting, ask trade-off questions before designing
- [[fingrid-pipeline]]: same diagnostic instinct applied at pipeline scale — anchor on observable constraints, not default architecture
