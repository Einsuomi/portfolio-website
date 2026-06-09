# Portfolio Website Rebuild

**Type:** idea
**Access:** public
**Tags:** portfolio, chatbot, astro, vercel, architecture, data-engineering
**Updated:** 2026-06-09
**tldr:** Architecture decisions for replacing the Wix site with an Astro+Vercel chatbot portfolio grounded in Super Brain's public wiki — including a live DE analytics pipeline as a centerpiece portfolio piece.
**Related:** [[super-brain-project]], [[professional-profile]]

## Summary

The Wix site (`ethannie2020.wixsite.com/data-analytics`) is being replaced with a modern Astro site hosted on Vercel, with a recruiter-facing chatbot as the centerpiece. The chatbot answers questions grounded in the public Super Brain wiki — recruiters have a conversation instead of reading a CV. Architecture was designed and locked in a planning session on 2026-06-08 before any code was written.

## Detail

### Why Rebuild

Wix is not aesthetically competitive for a 2026 job hunt in Luxembourg. The new site needs: modern design, a chatbot as the main interaction, project case studies, CV download, and a live visitor analytics pipeline that itself doubles as a DE portfolio piece.

### Stack

- **Framework:** Astro (static-first, islands architecture — chatbot is the one JS island)
- **Hosting:** Vercel Hobby tier ($0, EU edge network, auto-deploys from GitHub)
- **Chatbot API:** Claude Haiku 4.5 via Anthropic API (~$1–2/month at portfolio traffic)
- **Analytics hot path:** Supabase Postgres (free tier, 500 MB)
- **Analytics cold path:** Databricks Free Edition + dbt (Delta Lake Bronze → Gold)
- **CV generation:** rendercv from YAML source

Astro was chosen over Next.js because the site is content + one interactive widget — full SSR framework is over-engineered here. Next.js migration later is mechanical if ever needed.

### Why Claude, not a cheaper model

DeepSeek V4 was considered (cheaper, higher limits) and rejected. At portfolio
traffic the absolute saving is ~$1.80/month — too small to justify the cost:
routing recruiter conversations through a Chinese LLM provider is a GDPR/data-
residency talking point that Lux banking-adjacent recruiters will notice. "Built
with Claude" is also a cleaner build narrative for EU/tech-forward employers.
Provider is reversible (one isolated function boundary) if cost ever becomes real.

### Content Sync Architecture

Super Brain stays private. The public wiki flows into the portfolio repo via a sync script:

1. `npm run sync` reads `../AI Memory/Super Brain/wiki/**/*.md`
2. Filters any path containing `/confidential/`
3. Optional second pass: denylist for sensitive patterns
4. Copies filtered files into `portfolio-website/src/content/`

Vercel builds from this copy — confidential content never enters the public repo. Phase 2: automate via GitHub Action when wiki edit frequency warrants it.

### Chatbot — Grounding Boundary

The LLM is allowed to use model knowledge for general technical concepts (what Spark is, what GDPR means) but must use the wiki as the *only* source of truth for anything personal about Tong. If asked something personal not in the wiki, it responds "I don't have that detail — ask Tong directly" — never infers or invents.

This eliminates hallucination risk on claims about experience, projects, or opinions while keeping the conversation natural for questions like "what is Delta Lake?"

### Chatbot — Conversation Brief

After a chat session, recruiters can download a polished "Conversation Brief" — a LLM-synthesized one-pager (not a transcript) that summarizes what they learned about Tong. Sections: topics discussed, key profile takeaways (grounded in wiki), relevant case study links, contact info. Single self-contained HTML file with inline CSS/JS, ~50–100 KB, mobile responsive.

This gives recruiters a shareable artifact to bring to hiring managers without asking them to share a chat log.

### Visitor Analytics — The Live DE Pipeline

The analytics pipeline is not just plumbing — it is the technical depth of the portfolio.

```
Browser beacon → Vercel /api/track → Supabase Postgres (hot, 90d)
                                             ↓ nightly sync
                                      Databricks Free Edition
                                      Bronze → Silver → Gold (dbt)
                                             ↓
                                   /stats page (live DE portfolio)
```

The beacon collects: page path, country (from `x-vercel-ip-country`), language preference, chat engagement events (event names only, no content). IP is SHA-256 hashed — no raw PII, no cookies, no consent banner needed.

The public `/stats` page shows the pipeline running in production: visits, country breakdown, language usage, chat engagement rate, architecture diagram, link to the pipeline code.

At interview: "I built and operate this exact pipeline. It's running right now. Here's the /stats page."

### CV as Code

CV content lives in `wiki/about/cv.yaml` (rendercv format), synced into the portfolio repo and built to `public/cv.pdf` on each deploy. One source of truth — updates once, reflected everywhere (PDF download, `/cv` web view, chatbot grounding). ATS-friendly output.

### Transition from Wix

New site launches on a fresh domain (not yet purchased — candidates: `ethannie.dev`, `tongnie.dev`). Wix stays alive in parallel — Wix URL is on CVs already sent to recruiters (which may be clicked months later) and on LinkedIn. LinkedIn update deferred until actively job-hunting (visibility concern with current employer). Minimum 6-month parallel period.

## Connections

- [[super-brain-project]]: the wiki source that feeds the chatbot — same public/confidential split; this rebuild is the deployment of that concept
- [[professional-profile]]: the professional identity the chatbot is grounded in
- [[senior-de-interview-framework]]: the visitor analytics pipeline is designed to generate Round 2/3/4 interview evidence

## Open Questions

- Final domain name choice (deferred — not blocking)
- Phase 2: GitHub Action to auto-sync wiki on push to Super Brain
- Phase 2: dbt scheduling + nightly Databricks refresh
- Phase 2: expand French content as Tong's French improves beyond A1
