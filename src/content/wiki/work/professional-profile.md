# Professional Profile

**Type:** work
**Access:** public
**Tags:** data-engineering, BI, azure, databricks, python, sql, power-bi
**Updated:** 2026-05-05
**tldr:** Tong Nie — Data Engineer & BI Analyst with 3 years of experience building enterprise data pipelines and BI dashboards on Azure and Databricks.
**Related:** [[portfolio-projects]], [[databricks-ai-dev-kit]], [[spec-driven-development]]

## Summary
Tong is a Data Engineer and BI Analyst with 3 years of professional experience designing scalable data pipelines and delivering business intelligence dashboards. His work spans Azure, AWS, and Databricks, with strong depth in medallion lakehouse architecture, CI/CD automation, and Power BI development.

## Detail

### Core Skills
- **Languages:** Python, SQL
- **BI:** Power BI (DAX, star schema modeling, time intelligence)
- **Processing:** Apache Spark (PySpark), Delta Live Tables
- **DevOps:** CI/CD with Azure DevOps and GitHub Actions

### Cloud & Platforms
- **Azure:** ADF, ADLS Gen2, Azure DevOps, Microsoft Fabric
- **Databricks:** Unity Catalog, Delta Lake, Autoloader, Asset Bundles
- **AWS:** S3, Terraform-provisioned Databricks workspaces
- **Other:** Snowflake

### Architecture Expertise
- Medallion lakehouse (Bronze/Silver/Gold)
- EDW and ETL design
- Star schema and Data Vault 2.0
- Metadata-driven pipeline design

### Contact
- Email: ethan.nie2020@gmail.com
- LinkedIn: https://www.linkedin.com/in/tong-nie/
- Portfolio: https://ethannie2020.wixsite.com/data-analytics
- GitHub: https://github.com/Einsuomi

### Engineering Approach

These are observed, concrete behaviors — not self-descriptions. Each is backed by a specific example.

**Architecture-first before writing any code.**
When starting a new project, Tong's instinct is to define the system structure and constraints before implementing features. In a hands-on OpenSpec session (2026-05-05), he structured Round 1 as AI skill definitions only — explicitly refusing to scaffold modules or write feature code until the standards layer was locked in. This is a non-obvious discipline; most engineers jump straight to implementation.

**Catches spec and scope drift under pressure.**
During the same session, Tong flagged multiple AI violations mid-stream: Round 1 tasks that had silently expanded to include Round 2+ work, a design document that still said "3 patterns" after the team had agreed on 4, and a post-implementation doc update that should have happened before implementation. Each catch required comparing intent against execution, not just reading the output.

**Asks "why" before accepting a pattern.**
Consistently questions the reasoning behind methodology choices. Examples from the same session: why TDD (asked before accepting the pattern), why post-implementation sync rather than pre, whether understanding the architecture first is truly better than jumping to the first feature. This habit surfaces hidden assumptions before they become structural problems.

**Edge case thinking without prompting.**
Identified double-complete and double-delete as problems during manual testing — without being asked. Proposed soft delete unprompted as the right semantics for a delete operation. These are product-level judgments, not just code-level ones.

**Codifies fixes so they can't recur.**
When a missing workflow step (/opsx:sync) caused spec drift, Tong's response was to add it as a mandatory named task in every future tasks.md and encode the rule in AGENTS.md — not just fix the immediate instance. Pattern: finds the root cause, then closes the loop structurally.

**Actively learning modern AI-assisted development workflows.**
Currently deepening expertise in Spec-Driven Development using OpenSpec with GitHub Copilot, building projects from scratch using the full SDD + TDD workflow. See [[spec-driven-development]] for detail.

## Connections
- [[portfolio-projects]]: hands-on evidence for every skill listed here
- [[databricks-ai-dev-kit]]: reflects Tong's active depth in the Databricks ecosystem
- [[spec-driven-development]]: methodology behind the engineering approach described above

## Open Questions
- Certifications (Databricks, Azure) — not listed on site, worth adding if earned
- Formal education background — not captured from portfolio site

## Sources
- [Portfolio site — About Me](https://ethannie2020.wixsite.com/data-analytics/about-me) — fetched 2026-05-04
