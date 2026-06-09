# AWS Databricks DLT Pipeline

**Type:** work
**Access:** public
**Tags:** aws, databricks, delta-live-tables, terraform, unity-catalog, data-engineering, iac, ci-cd
**Updated:** 2026-05-04
**tldr:** Cloud-native medallion lakehouse on AWS processing Fingrid power grid data — infrastructure provisioned with Terraform, pipelines built with Databricks Delta Live Tables and Asset Bundles.
**Related:** [[fingrid-pipeline]], [[databricks-ai-dev-kit]]

## Summary
A cloud-native data engineering platform on AWS that processes Fingrid's power grid data through a medallion lakehouse architecture. Distinguishing choices vs. the Azure Fingrid project: Terraform for infrastructure-as-code (entire AWS + Databricks workspace provisioned declaratively), Databricks Delta Live Tables for declarative ETL, and Databricks Asset Bundles for packaged versioned deployments. Demonstrates multi-cloud data engineering competency using the same domain problem.

## Detail

### Architecture

```
Fingrid Open Data API
       ↓
Databricks (Autoloader + Delta Live Tables pipelines)
       ↓
AWS S3 / Delta Lake format
  ├── Bronze  — raw ingestion
  ├── Silver  — validated, schema-enforced
  └── Gold    — star schema, business-ready
       ↓
Power BI (downstream BI)
```

Infrastructure provisioned entirely by Terraform: S3 buckets, Databricks workspace configuration — no manual console setup.

### Key Technical Decisions

**Infrastructure as Code:** Terraform manages all AWS resources declaratively. Reproducible environments, version-controlled infrastructure.

**Delta Live Tables (declarative ETL):** DLT handles pipeline orchestration, data quality rules, schema evolution, and retry logic declaratively — less boilerplate than imperative PySpark pipelines.

**Databricks Asset Bundles:** Pipeline definitions, notebooks, and dependencies packaged as a single versioned unit. Deploy with `databricks bundle deploy --target dev/prod`. Supports dev/prod target separation (dev disables scheduled triggers for safety).

**CI/CD:** GitHub Actions workflows in `.github/workflows/` automate deployment on merge.

### Stack
| Component | Role |
|---|---|
| AWS S3 | Storage — Delta tables in Delta Lake format |
| Databricks | Processing — DLT pipelines, Autoloader, Unity Catalog |
| Terraform | Infrastructure provisioning — AWS + Databricks workspace |
| Databricks Asset Bundles | Packaged pipeline deployment with environment targeting |
| Unity Catalog | Governance across the lakehouse |
| GitHub Actions | CI/CD automation |
| Power BI | Downstream BI |

### Repo Structure
- `.github/workflows/` — CI/CD pipeline definitions
- `src/` — data engineering source code
- `resources/` — Databricks job and DLT pipeline definitions
- `tests/` — pytest suite
- `databricks.yml` — Asset Bundles configuration

Development: `uv sync --dev` + `databricks bundle deploy --target dev`

Languages: Python 49.8%, Jupyter Notebook 50.2%

## Connections
- [[fingrid-pipeline]]: same domain (Fingrid, medallion lakehouse), Azure vs. AWS — direct architectural comparison; DLT appears in both but as primary orchestrator here vs. an alternative there
- [[databricks-ai-dev-kit]]: Asset Bundles and DLT patterns here match the skills covered by the AI Dev Kit

## Open Questions
- Terraform state management — remote backend (S3) or local?
- Cost profile on AWS vs. Azure for equivalent workloads

## Sources
- [GitHub — AWS-data-engineering-demo](https://github.com/Einsuomi/AWS-data-engineering-demo) — fetched 2026-05-04
- [Portfolio page](https://ethannie2020.wixsite.com/data-analytics/copy-of-fingrid-data-engineer-project-1) — fetched 2026-05-04
