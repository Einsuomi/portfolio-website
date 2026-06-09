# Databricks AI Dev Kit

**Type:** learning
**Access:** public
**Tags:** databricks, claude-code, MCP, data-engineering, productivity, pyspark, medallion
**Updated:** 2026-05-04
**tldr:** Open-source toolkit by Databricks Field Engineering that gives Claude Code (and other AI assistants) live tools and pattern knowledge for Databricks — MCP server with 45+ tools plus skills files covering DLT, jobs, Unity Catalog, and more.
**Related:** [[claude-code-basics]], [[work-brain-setup]]

## Summary
The AI Dev Kit bridges Claude Code and a Databricks workspace — skills teach Claude Databricks-idiomatic patterns, and the MCP server gives Claude live tools to create jobs, run pipelines, query Unity Catalog, and more. Built by Databricks Field Engineering (not official Databricks product, but internally certified). Practical result: building a full medallion architecture without writing a single line of code, for ~$0.40 in API cost.

## Detail

### Claude + Databricks — Integration Patterns

Five ways Claude sits on top of Databricks infrastructure (before even using the AI Dev Kit):

| Pattern | What it does |
|---|---|
| **AI reasoning layer** | Claude consumes query results, schema context, or retrieved docs from Databricks — generates analysis, summaries, SQL |
| **Tool use / function calling** | Claude is given a `run_sql` tool pointing at a Databricks SQL Warehouse; model decides when to call it, builds the query, interprets results |
| **RAG from Delta tables** | Embeddings stored in Databricks Vector Search feed context into Claude's prompt; Databricks handles chunking + indexing, Claude does generation |
| **Model Serving as proxy** | Databricks Model Serving routes Claude calls through its governance layer — audit logging, cost tracking, access control — using the same API surface as your internal models |
| **Agent workflows on Lakehouse** | Claude-powered agents that read from Unity Catalog, call Databricks Jobs to trigger pipelines, and return results; agent loop runs in your app, Databricks is the execution + storage backend |

**Key tradeoff:** Direct Anthropic API vs. routing through Databricks Model Serving. Direct is simpler and lower latency; Model Serving gives unified governance if your org already runs everything through Databricks.

**Databricks + Anthropic partnership:** 5-year deal signed early 2026 making Claude models (Claude 3.7 Sonnet first) natively available on Databricks Model Serving. Claude can be served through Unity Catalog for governance-integrated LLM use.

### Two Components — Different Jobs

| Component | What | When it helps |
|---|---|---|
| **Skills** | Markdown files Claude reads at session start | Writing correct Databricks code — Unity Catalog patterns, DLT syntax, SDK auth |
| **MCP server** | Live Python process with 45+ Databricks API tools | Talking to the workspace — creating jobs, querying schemas, running pipelines |

Skills = knowledge. MCP = action.

### Installation — Interactive Installer
The installer is fully interactive. Run it in your project folder:
```bash
bash <(curl -sL https://raw.githubusercontent.com/databricks-solutions/ai-dev-kit/main/install.sh)
```

It prompts for:
1. **Stable vs latest** version
2. **Which client** — Claude Code, Cursor, GitHub Copilot, etc. (uncheck others)
3. **Which Databricks profile** — strongly use `default` to avoid auth errors
4. **Install location** — project directory (recommended) or global
5. **Which skills** — data engineering, AI/ML, or all 14; pick your domain

The installer handles everything: clones the repo, creates the venv, installs Python packages, creates `.mcp.json`, and triggers re-authentication. No manual steps.

### What Gets Created
```
your-project/
├── .claude/
│   └── skills/           — skill markdown files, auto-loaded by Claude Code
│       ├── jobs/
│       │   └── SKILL.md  — step-by-step job creation, SDK examples, patterns
│       ├── pipelines/
│       ├── spark/
│       └── ...
└── .mcp.json             — points to MCP server in the cloned repo

~/ai-dev-kit/repo/        — cloned repo + venv (managed by installer, not your project)
```

### MCP Server Tools (45+)
Key tools Claude gets access to:
- `execute_sql_query`, `get_table_stats` — SQL against a warehouse
- `run_code_on_cluster`, `create_cluster`, `terminate_cluster` — compute lifecycle
- `create_job`, `run_job`, `get_job_status` — full job lifecycle
- `create_spark_pipeline`, `run_pipeline` — DLT (Declarative Pipelines)
- `manage_uc_objects` — Unity Catalog schemas, tables, volumes
- `upload_file_to_workspace` — file operations
- `create_genie_space`, `create_supervisor_agent` — AI/multi-agent workflows
- `deploy_model_serving_endpoint` — model serving

**Note:** This is the field-engineering MCP, not Databricks' official `databricks-mcp` package. Databricks also maintains a separate official MCP server — the ai-dev-kit version is field-certified but community-maintained.

Claude decides which tool to call based on context — you just describe what you want.

The installed `.mcp.json` uses `${CLAUDE_PLUGIN_ROOT}` as the variable for the install location:
```json
{
  "mcpServers": {
    "databricks": {
      "command": "${CLAUDE_PLUGIN_ROOT}/.venv/bin/python",
      "args": ["${CLAUDE_PLUGIN_ROOT}/databricks-mcp-server/run_server.py"],
      "defer_loading": true
    }
  }
}
```

### Skills Structure
Each skill is a `SKILL.md` containing step-by-step instructions + working code examples. The jobs skill, for example, includes full Python scripts for task creation, notification config, dependency chaining, and SDK reference. Claude reads the relevant skill when it detects the intent.

Skills are the reason Claude Code gets better results than Cursor/Copilot with this kit — Claude Code's skill system is first-class; other clients rely on MCP tools alone.

### Practical Demo — Medallion Architecture
Built end-to-end without writing code (source: Ansh Lamba tutorial, 2026-05-03):

**Bronze layer:** Fetched 3 CSV files from GitHub URLs → Delta tables in `claude_catalog.raw`
- Claude used pandas to fetch from URLs, then PySpark to write Delta tables
- Ran as a Databricks job (job compute, no cluster needed)

**Silver layer:** Joined bronze tables on `passenger_id` and `airport_id` → one big enriched table in `claude_catalog.enriched`
- Added as a new task to the existing job (not a new job)

**Gold layer:** Aggregated view — bookings per city → `claude_catalog.curated`
- Created as a view, also added as a job task

Total cost: ~$0.40. All three layers in one job with three tasks. No code written manually.

### Databricks Free Edition Gotchas
- **No cluster by default** — only a SQL warehouse. Workaround: create a job with task compute instead of running notebooks directly.
- **Not metastore admin** — Databricks free edition makes Databricks (not you) the metastore admin. Create the catalog manually from the UI first. Claude can create schemas and tables within it.

### Repo and Skills for Multiple Repos
- Run the install script per repo — each gets its own `.claude/skills/` and `.mcp.json`
- The cloned repo + venv lives globally on the machine (not inside your repos)
- Skills are safe to commit to git — pure markdown, no runtime dependency
- `.mcp.json` is also safe to commit; standardize install path across team (e.g. `~/ai-dev-kit`)

## Connections
- [[claude-code-basics]]: MCP server pattern — Claude Code starts the server process automatically from `.mcp.json`; skills extend the same CLAUDE.md instruction system
- [[work-brain-setup]]: relevant for Tong's setup — central lib repo gets skills, central pipeline repo gets both skills and MCP
- [[fingrid-pipeline]]: real project using the same Databricks stack (Autoloader, DLT, Unity Catalog) the AI Dev Kit's skills files cover
- [[aws-dlt-pipeline]]: same — Asset Bundles and DLT patterns here are exactly what the skills teach

## Open Questions
- Does the installer support a team-standardized path out of the box, or does each developer get a different install location?
- DLT (Declarative Pipelines) support in MCP — worth testing for the 1000-pipeline template repo use case
- Skills update cadence — how to refresh skills when the repo updates? Re-run installer?

## Sources
- [databricks-solutions/ai-dev-kit on GitHub](https://github.com/databricks-solutions/ai-dev-kit) — reviewed 2026-05-03
- [Databricks Vibe Coding With Claude Code (Full Tutorial)](https://www.youtube.com/watch?v=DyAa7lLu5sU) — Ansh Lamba, 2026-05-03
