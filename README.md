# portfolio-website

Recruiter-facing portfolio for **Tong Nie** — Data Engineer & Builder.
Public repo, deployed on Vercel. Built with Astro + a Three.js/GSAP WebGL homepage.

Live: https://portfolio-website-umber-one-98.vercel.app

## Stack

- **Astro** — static pages + a single Vercel server function (`/api/track`)
- **Three.js** — homepage particle-cloud scene (`src/scripts/dark-scene.ts`)
- **GSAP + Lenis** — scroll choreography and smooth scroll
- **Supabase** — privacy-light visit analytics (anon, INSERT-only)
- Self-hosted fonts (no runtime gstatic, GDPR)

The homepage is one pinned stage with 7 beats (hero → Neste → PostNord →
Basware → Projects → Writes → Talk-to-me). All copy lives in real HTML; WebGL is
a layer on top, so the site works with JS disabled and for crawlers. Today the
site ships dark only; a true light *theme* (colour variant of the same layout) is
a planned rebuild.

## Structure

```text
src/
├── pages/
│   ├── index.astro        # dark homepage — 7-beat pinned stage
│   └── api/track.ts       # analytics beacon endpoint (server fn)
├── layouts/Base.astro     # fonts, SEO/OG meta, analytics, slot
├── components/TrackBeacon.astro
├── scripts/dark-scene.ts  # Three.js particle-cloud scene
├── lib/timeline.ts        # single source of truth for all beat copy
├── lib/lucide-icons.js    # icons as static data (no CDN)
└── content/wiki/          # public wiki pages synced from the Super Brain

scripts/        # sync, leak scan, API + UI verification harnesses
specs/          # project narrative + per-phase work specs
supabase/       # analytics migrations
reference/      # design reference (gitignored, local only)
backups/        # retired-version snapshots (gitignored)
```

Content enters `src/content/` only via `npm run sync`, which filters out every
`/confidential/` path from the Super Brain wiki. This is a public repo.

## Commands

| Command              | What it does |
|----------------------|--------------|
| `npm run dev`        | Dev server at http://localhost:4321 |
| `npm run build`      | Production build to `./dist/` |
| `npm run preview`    | Preview the production build |
| `npm run sync`       | Pull filtered public wiki into `src/content/` |
| `npm run check-leaks`| Scan `dist/` for confidential markers |
| `npm run verify-ui`  | Playwright + axe UI quality harness |
| `npx astro check`    | Type / syntax check |

See `CLAUDE.md` for how the project is built (roles, rules, process) and
`specs/project.md` for the roadmap.
