# Fingrid Azure Data Engineering Pipeline

**Type:** work
**Access:** public
**Tags:** azure, databricks, delta-lake, adf, unity-catalog, medallion, data-engineering, ci-cd
**Updated:** 2026-05-04
**tldr:** Production-ready medallion lakehouse on Azure ingesting Finland's national power grid data via Fingrid's Open Data API — metadata-driven, incremental, CI/CD automated.
**Related:** [[aws-dlt-pipeline]], [[databricks-ai-dev-kit]]

## Summary
End-to-end data engineering solution that ingests electricity consumption and generation forecast data from Fingrid's public API and refines it through a Bronze → Silver → Gold medallion architecture to Power BI. Key design choices: metadata-driven pipelines (no code changes to add new datasets), incremental loading with state management, and full CI/CD via GitHub Actions. Built on Azure ADF + Databricks + Delta Lake + Unity Catalog + ADLS Gen2.

## Detail

### Architecture

```
Fingrid Open Data API
       ↓
Azure Data Factory (orchestration, CI/CD via ARM templates + GitHub Actions)
       ↓
ADLS Gen2 / Delta Lake
  ├── Bronze  — raw API responses, immutable
  ├── Silver  — validated, cleansed, enriched
  └── Gold    — star schema, analytics-ready
       ↓
Power BI (dashboards)
```

### Key Technical Decisions

**Metadata-driven design:** ADF pipelines are parameterized and controlled through a centralized configuration table. Adding a new data source requires only a config entry, not a new pipeline.

**Incremental loading:** Configurable batch sizes with state tracking — only new/changed records are processed each run. Avoids full reloads and controls cost.

**Delta Lake + Unity Catalog:** ACID transactions and schema enforcement on Delta, with Unity Catalog providing centralized governance and fine-grained access control across the lakehouse.

**Two pipeline variants:** The repo includes both a standard ADF + PySpark notebook pipeline and an alternative Databricks DLT (Delta Live Tables) pipeline — useful for comparing orchestration patterns.

### Stack
| Component | Role |
|---|---|
| Azure Data Factory | Orchestration, CI/CD deployment via ARM templates |
| Databricks | Data processing — Autoloader, PySpark, Delta Live Tables |
| Delta Lake | Storage format — ACID, versioning, time travel |
| Unity Catalog | Governance — access control, lineage, schema registry |
| ADLS Gen2 | Cloud storage for Delta tables |
| GitHub Actions | CI/CD automation for pipeline deployments |
| Power BI | Downstream BI layer |

### Repo Structure
- `/adf` — ADF pipeline definitions and ARM templates
- `/databricks` — PySpark notebooks for Bronze/Silver/Gold processing
- `/Databricks DLT Pipeline Solution` — alternative DLT-based implementation

Languages: Jupyter Notebook 82.8%, Python 17.2%

## Connections
- [[aws-dlt-pipeline]]: same problem domain (Fingrid data, medallion lakehouse) solved on AWS instead of Azure — direct architectural comparison
- [[databricks-ai-dev-kit]]: Databricks patterns used here (Autoloader, DLT, Unity Catalog) are exactly what the AI Dev Kit's skills files cover

## Open Questions
- Production deployment status — demo/portfolio project or live in an org?
- Monitoring and alerting setup not described in the README

## Sources
- [GitHub — Data_Engineering_Fingrid](https://github.com/Einsuomi/Data_Engineering_Fingrid) — fetched 2026-05-04
- [Portfolio page](https://ethannie2020.wixsite.com/data-analytics/copy-of-yourfashion-sales-report) — fetched 2026-05-04
