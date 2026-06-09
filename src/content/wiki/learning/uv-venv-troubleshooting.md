# uv + venv Troubleshooting

**Type:** learning
**Access:** public
**Tags:** uv, venv, pyspark, ty, debugging, python-tooling
**Updated:** 2026-05-09
**tldr:** Foundations of how uv, venv, pyproject.toml, and uv.lock relate; how to distinguish environment problems from code problems when type-checking fails; and why you must never manually resolve uv.lock merge conflicts.
**Related:** [[claude-code-basics]], [[spec-driven-development]]

## Summary
A venv is an isolated `site-packages/` directory so each project's dependencies don't fight each other. `pyproject.toml` is the human-managed declaration of what the project needs; `uv.lock` is the machine-generated full pin (every package, exact version, hash, and dependency graph). `uv sync` makes `.venv/` match those two files. Mass type-check failures across unrelated files are almost always an environmental break — most often a corrupted venv from a manually resolved `uv.lock` merge conflict.

## Detail

### Foundations — how the pieces fit

#### What a venv is and why it exists
Python packages install into a folder called `site-packages/`. Without a venv, that folder is global — shared by every project on your machine. Two projects needing different versions of the same package can't coexist; upgrading for one silently breaks the other.

A venv is a self-contained directory (typically `.venv/` in the project) with its own isolated `site-packages/`:

```
.venv/
  bin/python                  ← isolated Python interpreter
  lib/python3.x/
    site-packages/
      pyspark/                ← only this project's pyspark
      pandas/
      ...
```

When you run Python or tools like `ty` / `pytest` through the venv, they only see packages installed in that venv. `uv` manages the venv automatically — no manual activate/deactivate. `uv sync` creates and populates it; `uv run pytest` invokes it.

#### `pyproject.toml` vs `uv.lock` — division of labor

| | `pyproject.toml` | `uv.lock` |
|---|---|---|
| Written by | Developer (hand) | uv (machine) |
| Contains | Intent: `pyspark >= 4.0` | Exact pin: `pyspark == 4.0.0` + SHA256 hash + full dependency graph |
| Committed to git? | Yes | Yes |
| Edited manually? | Yes | **Never** |
| Purpose | Human contract | Reproducible installs across machines |

`pyproject.toml` says *what* you want; `uv.lock` says *exactly which version of everything*. Keeping them as distinct artifacts is what makes installs reproducible without locking the developer into rigid version pins in the human-readable file.

#### What `uv sync` does
Reads both files. Then makes `.venv/` match exactly: installs what's missing, removes what's extra, updates what's wrong. If `.venv/` doesn't exist, it creates it first.

Think of it as: `pyproject.toml` says what you want, `uv.lock` says exactly which versions, `uv sync` makes reality match the two files.

#### What `uv lock` does
Generates / regenerates `uv.lock` from `pyproject.toml`. The process:
1. Reads constraints from `pyproject.toml` (e.g. `pyspark >= 4.0`)
2. **Queries the package registry** (PyPI or your company mirror) for available versions and metadata
3. Runs a **dependency resolution algorithm** — picks the newest pyspark that satisfies `>=4.0`, then resolves pyspark's own dependencies (`py4j`, etc.), recursively, until every package in the tree has an exact version satisfying all constraints simultaneously
4. Fetches the **SHA256 hash** of each wheel from the registry
5. Writes everything into `uv.lock`: exact version + registry URL + hash + dependency graph for every package

`uv lock` runs:
- Manually with `uv lock`
- Automatically inside `uv add <package>` (adds to `pyproject.toml` + re-resolves)
- When `pyproject.toml` changes and you run `uv sync`

uv doesn't *guess* versions — the registry is the source of truth, the lock file is just the snapshot of what the resolver decided.

#### The dependency graph inside `uv.lock`
The lock file isn't just "package + version + hash" — it also encodes which packages depend on which. Simplified:

```toml
[[package]]
name = "pyspark"
version = "4.0.0"
source = { registry = "https://your-company-mirror.com/simple" }
dependencies = [
  { name = "py4j", specifier = "==0.10.9.7" },
]

[[package]]
name = "py4j"
version = "0.10.9.7"
source = { registry = "https://your-company-mirror.com/simple" }
```

Note the structure: pyspark's entry names its own dependencies with exact versions; those dependencies have their own entries further down. The whole file is a consistent graph — every version and hash must agree with every other entry.

A company mirror as the registry source doesn't change this — the mirror is just where the files come from. The graph consistency requirement exists regardless.

#### Adding a package — the normal flow
```bash
# Recommended: let uv manage both files atomically
uv add pyspark>=4.0          # updates pyproject.toml + regenerates uv.lock

# Or manually
# (edit pyproject.toml)
uv lock                       # regenerate uv.lock from updated constraints
uv sync                       # install into .venv
```

This is also why `uv.lock` merge conflicts happen: two branches add different packages at the same time, both modify the lock file, git can't reconcile.

### The diagnostic signal
When `ty` (or mypy, pyright) suddenly reports 20+ unresolved-import or "has no member X" errors for a well-known package like PySpark across the entire codebase, stop checking code. The pattern "mass failures across unrelated files" is a reliable signal that the problem is the environment, not any single file.

Quick sanity check before anything else:
```bash
python -c "import pyspark; print(pyspark.__file__)"
```
If this fails or the path looks wrong, the venv is corrupted. Skip code debugging entirely.

### The fix
Delete the venv and reinstall from scratch:
```bash
rm -rf .venv
uv sync
```
Incremental repair (reinstalling individual packages) is unreliable when installation is structurally broken. A clean reinstall is the only trustworthy path.

### Root cause: manually resolved uv.lock
`uv.lock` is machine-generated: it contains dependency graphs, hashes, and version pins for the full tree. Manual edits can produce a syntactically valid but semantically corrupt file — for example, a package entry whose hash no longer matches, or a dependency graph that disagrees with `pyproject.toml`. The result is a partial or broken install that looks fine to `uv` but is missing files.

**Rule: never manually resolve `uv.lock` merge conflicts.**
When a merge conflict appears in `uv.lock`:
1. Resolve `pyproject.toml` first (manually — it's human-readable). Make sure the dependency constraints reflect what you actually want.
2. Accept one whole side of the `uv.lock` conflict — never edit the markers:
   ```bash
   git checkout --ours uv.lock      # keep your branch's lock
   # OR
   git checkout --theirs uv.lock    # keep the other branch's lock
   ```
3. Regenerate the lock file from the resolved `pyproject.toml`:
   ```bash
   uv lock
   ```
4. Stage both files: `git add pyproject.toml uv.lock`

It doesn't matter which side you pick in step 2 — `uv lock` will recalculate everything from `pyproject.toml` and overwrite whatever you gave it. You just need a syntactically valid file for it to start from.

### Rebase + push after a merge-conflict fix
After a rebase that resolved a `uv.lock` conflict, your local branch has rewritten history vs. `origin/<branch>`. A normal `git push` will be rejected. The correct push is:

```bash
git push --force-with-lease origin <branch>
```

`--force-with-lease` is safer than `--force`: it refuses if someone else pushed to the same branch since your last fetch, so you can't overwrite a teammate's work by accident.

Full sequence after a merge-conflict rebase:
```
git rebase origin/main
# resolve conflicts: pyproject.toml first, then uv.lock via --ours/--theirs + uv lock
git add pyproject.toml uv.lock <other resolved files>
git rebase --continue
git push --force-with-lease origin <branch>
```

### Why "copy main's `uv.lock` and run `uv sync`" sometimes fixes a broken venv
If a manual conflict resolution left `uv.lock` semantically corrupt but pyspark's version number happened to match what was already on disk, `uv sync` saw it as already installed and didn't touch the broken files. Replacing the lock with main's version usually triggers a reinstall (different hash or different version) → fresh wheel extraction → `__init__.py` files land correctly.

This is essentially `git checkout --theirs uv.lock && uv sync` — same effect. It works as long as the `pyproject.toml` constraints didn't change on your branch. If you added new packages, you'd lose them; in that case, regenerate via `uv lock` after resolving the `pyproject.toml` conflict.

### Broader principle
When debugging tool failures, distinguish environment from code problems first. Two questions to ask before reading any source file:
1. Can the runtime even import the package? (`python -c "import X"`)
2. Did any infrastructure change recently — merge, rebase, dependency update, venv recreation?

If the answer to 2 is yes, reset the environment before debugging the code.

## Connections
- [[claude-code-basics]]: same "distinguish environment from code" principle applies when Claude Code hooks stop working unexpectedly
- [[spec-driven-development]]: clean environment is a prerequisite for reliable TDD loops — a corrupted venv produces false failing tests

## Open Questions
- Should `.venv` be explicitly in `.gitignore` to prevent accidental staging?
- Is there a fast venv-health check script (e.g. verify a key package imports correctly) worth adding as a pre-commit hook or `Makefile` target?
