# Power BI Projects

**Type:** work
**Access:** public
**Tags:** power-bi, azure-devops, microsoft-fabric, dax, star-schema, ci-cd, data-modeling
**Updated:** 2026-05-04
**tldr:** Three Power BI projects covering enterprise CI/CD deployment, real-world ticket sales analysis, and multi-currency star schema modeling — demonstrating the full BI development lifecycle.
**Related:** [[portfolio-projects]], [[fingrid-pipeline]]

## Summary
Three Power BI projects spanning the BI spectrum: enterprise-grade deployment automation (J&D CI/CD), client-facing analytical insight delivery (Heureka), and clean data modeling practice (YourFashion). Together they show both engineering depth (CI/CD, data modeling) and analytical delivery (business insights, dynamic measures).

## Detail

### 1. J&D Report with Power BI CI/CD

**What it is:** Enterprise BI deployment pipeline for a fashion retailer using Azure DevOps and Microsoft Fabric.

**CI/CD architecture:**
- **Validation pipeline:** Runs automatically on commits to dev branch — checks dataset relationships, measure accuracy, report best practices (visual density limits, etc.) via JSON rule files (`Rules-Dataset.json`, `Rules-Report.json`)
- **Release pipeline:** Deploys across multiple workspace stages (dev → test → prod) with environment isolation
- **Approval gate:** Release managers authorize production deployments

**Dashboard features:** Dynamic metric selection via parameters, hidden slicers, KPI tracking with drill-through, customer segmentation with anomaly detection, revenue-per-customer analysis.

**Stack:** Power BI (`.pbip` format for version control), Azure DevOps, Microsoft Fabric, Azure Pipelines (YAML), Python

**Links:**
- [GitHub repo](https://github.com/Einsuomi/J-D-Power-BI-CI-CD)
- [Live report](https://app.powerbi.com/view?r=eyJrIjoiZjQwOGI3MjctNjY1Yy00Zjg1LTg3YWUtZDcyNDcyMWQ0NTQ2IiwidCI6IjA2ZDllZTNkLTQxN2EtNGMyYi04NzdmLTgxNWMyMjdiYjk0NSIsImMiOjEwfQ%3D%3D)

---

### 2. Heureka Science Centre Report

**What it is:** Real-world ticket sales analysis for a Finnish science center investigating revenue and volume drivers.

**Key findings:**
- 20% total sales increase (2024 vs. 2023)
- 71% of growth attributed to one newly introduced ticket product (€468.6K)
- Pre-sold tickets declined ~20% overall, with 40% drop in July
- New categories (Service and Museum Card) identified as growth drivers

**Report pages:** Overview (key metrics, ranked product analysis), Seasonal Fluctuations (weekly/monthly trends, YoY), Detailed Comparison (drill-through month-by-month KPI breakdown).

**Stack:** Power BI, dynamic measures, drill-through

**Links:**
- [Live report](https://app.powerbi.com/view?r=eyJrIjoiMWI3OWM4ZjYtMjgzZS00ZjI3LWIyNmUtYzAzNmE0N2Y0N2Q1IiwidCI6IjA2ZDllZTNkLTQxN2EtNGMyYi04NzdmLTgxNWMyMjdiYjk0NSIsImMiOjEwfQ%3D%3D)

---

### 3. YourFashion Sales Report

**What it is:** Sales dashboard for a global jewelry brand with multi-currency support across markets.

**Data modeling:** Star schema with dedicated DimDate table for time intelligence, parameterized folder paths for data source reusability, BUS Matrix documenting dimension-to-fact relationships.

**Calculations:** YTD/MTD sales, YoY growth rates, average selling price (ASP), discount % analysis, currency-adjusted totals.

**Stack:** Power BI, DAX (advanced time intelligence), star schema modeling

**Links:**
- [Live report](https://app.powerbi.com/view?r=eyJrIjoiN2Y3ODc3NzktYzRiNC00Yzc3LWJkZTItYWMwZjdjNTY2ZTQ3IiwidCI6IjA2ZDllZTNkLTQxN2EtNGMyYi04NzdmLTgxNWMyMjdiYjk0NSIsImMiOjEwfQ%3D%3D)

---

## Connections
- [[fingrid-pipeline]]: Power BI is the downstream BI layer in the Fingrid project — the data engineering and BI work are connected
- [[portfolio-projects]]: these three projects populate the Power BI section of the portfolio

## Open Questions
- GitHub repos for Heureka and YourFashion — only J&D has one; worth adding for the other two
- `.pbip` format adoption — using the project format enables version control; confirm if Heureka/YourFashion also use it

## Sources
- [Portfolio — Power BI section](https://ethannie2020.wixsite.com/data-analytics/power-bi) — fetched 2026-05-04
- [GitHub — J-D-Power-BI-CI-CD](https://github.com/Einsuomi/J-D-Power-BI-CI-CD) — fetched 2026-05-04
