## Review — 2026-06-09 — main

**Scope:** 
- `src/pages/index.astro`
- `CLAUDE.md` (project context)
- `astro.config.mjs`
- `tsconfig.json`
- `package.json`

**Commit:** unknown (git describe not available)

---

### Layer 1: Visual / Frontend Quality [STRICTEST]

**6 findings**

- **BLOCKER** `src/pages/index.astro:12` — Title is generic placeholder "Astro" instead of project title. Should be "Tong Nie — Data Engineer". Set `<title>` to match brand identity and improve SEO.

- **BLOCKER** `src/pages/index.astro:14-16` — Page has zero meaningful content. Only shows `<h1>Astro</h1>` which violates the project brief entirely (recruiter-facing portfolio centrepiece with chatbot). Replace with full landing page layout including hero section, chatbot iframe/component, and CTAs.

- **BLOCKER** `src/pages/index.astro:5-6` — Missing semantic HTML structure. No `<header>`, `<nav>`, `<main>`, or `<footer>` landmarks. Astro should enforce accessibility from day 1. Add proper landmark elements and nest heading hierarchy correctly.

- **SHOULD-FIX** `src/pages/index.astro:1-3` — Empty frontmatter (---). Astro components should define layout import, CSS scope, and component props. At minimum, if using a layout, import it: `import Layout from '../layouts/Base.astro';`.

- **SHOULD-FIX** `src/pages/index.astro` — No responsive viewport meta tag value check and no charset ordering. The `<meta charset>` should come before `<meta name="viewport">` per HTML5 spec. Current order is correct but move viewport after charset explicitly.

- **NICE-TO-HAVE** `src/pages/index.astro:8` — favicon paths are duplicated (SVG and ICO). Consider consolidating to a single favicon strategy or clarify the dual-icon approach in code comments.

---

### Layer 2: Code Quality

**4 findings**

- **BLOCKER** `src/pages/index.astro:1-3` — Component lacks Astro `interface Props` pattern or proper TypeScript setup. Per project rules (CLAUDE.md §2), "Astro component props typed with `interface Props`". Even if no props, explicitly document this: `interface Props {}` at the top of frontmatter.

- **SHOULD-FIX** `src/pages/index.astro` — No layout inheritance. Project expects a shared layout pattern (Base.astro or similar) for consistent header/footer/nav. Currently building `<html>` directly in the page. Import a layout and wrap content via `<Layout>...</Layout>`.

- **SHOULD-FIX** `src/pages/index.astro:11` — Meta generator tag `content={Astro.generator}` is fine for identification, but no `name="description"` or `name="author"` meta tags. Add meaningful meta description (40–160 chars) for SEO and `name="author"` = "Tong Nie".

- **NICE-TO-HAVE** `src/pages/index.astro` — No comments explaining the purpose or structure of the page. Per CLAUDE.md design rules: "Add short, plain-language comments explaining what code does and why." Consider a brief comment block in frontmatter explaining this is the main landing page.

---

### Layer 3: Security / Cost / GDPR

**2 findings**

- **NICE-TO-HAVE** `src/pages/index.astro` — No API integration or tracking code yet (not a blocker at scaffold stage). When chatbot/analytics are added: ensure `/api/track` uses salted hashes per CLAUDE.md rules, never raw IPs.

- **NICE-TO-HAVE** `src/pages/index.astro` — No environment variables or secrets referenced (safe). Once `/api/chat` integration is added, ensure `ANTHROPIC_API_KEY` is only accessed via `import.meta.env`, never hardcoded.

---

### Summary

- **Layer 1:** 6 findings (3 blockers, 2 should-fix, 1 nice-to-have)
- **Layer 2:** 4 findings (1 blocker, 2 should-fix, 1 nice-to-have)
- **Layer 3:** 2 findings (0 blockers, 0 should-fix, 2 nice-to-have)

**Total: 12 findings (4 blockers, 4 should-fix, 4 nice-to-have)**

---

### Notes

This is a scaffold-stage review. The page currently has zero functional content and violates the project brief at the visual level. All blockers must be fixed before the site is previewed or deployed. The should-fix items establish proper Astro patterns and will prevent technical debt. Nice-to-have items can be deferred to later polish phases.

The core work is:
1. **Replace placeholder with real landing page** (recruiter-facing hero, chatbot UI hook, CTA)
2. **Add layout hierarchy** (create Base.astro, import into index.astro)
3. **Add proper TypeScript & meta tags** (interface Props, meta description/author)
4. **Ensure semantic HTML** (landmarks, heading structure)

