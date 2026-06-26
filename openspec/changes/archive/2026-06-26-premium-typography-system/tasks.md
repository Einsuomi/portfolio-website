## 1. Fonts & dependencies

- [x] 1.1 Verified `@fontsource-variable/bricolage-grotesque` (5.2.10, wght 200–800, NO italic) and `@fontsource/geist-sans` (5.2.5) exist; aligned numeric data routes to JetBrains Mono regardless, so Bricolage `tnum` is moot
- [x] 1.2 Installed the two new packages; uninstalled anton, archivo, inter, space-grotesk, instrument-serif, fraunces (only bricolage/geist/jetbrains-mono remain)
- [x] 1.3 Updated `src/layouts/Base.astro` imports: Bricolage `wght.css` + Geist 400/500/600/700 + JetBrains Mono 400/500; six dropped families removed

## 2. Tokens in backbone.css

- [x] 2.1 Remapped voices: `--font-display`→Bricolage, `--font-body`→Geist, kept `--font-mono`; deleted `--font-serif` and `--font-luxe`
- [x] 2.2 Added the 8 size tokens `--t-micro … --t-xl` (+ `--t-display` outlier)
- [x] 2.3 Added the fluid spacing tokens `--space-2xs … --space-2xl`
- [x] 2.4 Added micro-typography helpers `--lh-tight/-snug/-body` and `--track-machine/-machine-sm/-label`
- [x] 2.5 Applied `--space-2xl` to `.section` padding + tokenized `.kicker` (font-size `--t-label`, margin `--space-md`)
- [x] 2.6 Folded `--hero-ink`/`--hero-gold` into global `--ink`/`--gold` (hero aliases now reference them)

## 3. Component sweep — home sections

- [x] 3.1 `index.astro` (hero): wordmark → Bricolage 430 `--t-xl` `--lh-tight`; value line → Geist `--t-sm`; eyebrow → mono `--t-label` (hero keeps its 1); folded `--hero-ink`/`--hero-gold` into globals (task 2.6 ✓); dropped Fraunces opsz dependency
- [x] 3.2 `HeroBar.astro`: marquee lead/item/dot → mono `--t-label`/`--t-micro`, `--track-label`
- [x] 3.3 `Experience.astro`: kicker → standalone Bricolage `h2` (`.exp__head`, `--t-lg`); keyword title → Bricolage 800 caps `--track-machine-sm`; outcome → Geist `--t-lead`; year watermark → Bricolage + tabular-nums; intro → Geist `--t-sm`
- [x] 3.4 `Projects.astro`: kicker → standalone Bricolage `h2` "Selected Work" (`.proj__head`, 800 caps `--track-machine`); card title → Bricolage 700 caps `--track-machine-sm` `--t-sm`; blurb → Geist `--t-body`; tags/link → mono; num watermark → tabular-nums; muted link → `--ink-dim` (contrast)
- [x] 3.5 `Writes.astro`: kicker → standalone Bricolage `h2` "Writing" (`.writes__head`, `--t-lg`); item title → Bricolage 500 `--t-sm`; blurb → Geist `--t-body`; number → mono + tabular-nums
- [x] 3.6 `Chatbot.astro`: removed kicker; heading → Bricolage 800 caps `--track-machine`; **em-dash fixed** (`Don't just read. Talk.`); subline → Geist `--t-sm`; placeholder → Geist `--ink-dim`; badge → mono `--t-micro`

## 4. Component sweep — chat & shell

- [x] 4.1 `ChatPanel.astro`: messages/input → Geist `--t-body`; title/who/send/chips → mono tokens; disclaimer + chips bumped to `--ink-dim` (contrast)
- [x] 4.2 `ChatLauncher.astro`: label → mono `--t-label` `--track-label`
- [x] 4.3 `Preloader.astro`: count → Bricolage 800 `--t-display` (tabular-nums); label/pct → mono/`--t-lg`; dropped Anton fallback

## 5. Component sweep — detail pages, write pages, privacy

- [x] 5.1 `ProjectDetail.astro`: title → Bricolage `--t-xl`; subtitle/lead/body → Geist (body ~17–18px / `--lh-body` / 66ch); **convert the 6 block kickers (`The problem`, `Architecture`, `How it works`, `Inside the pipeline`, `Model & results`, `Outcome`) into real Bricolage sub-headings** (`--t-md`/`--t-sm`, semantic `h2`/`h3`) — they do real wayfinding on a long page, so convert, don't delete; single big stat numeral → Bricolage; any stacked/aligned numeric data → mono `tabular-nums`; meta/labels → mono; keep only the single page-title eyebrow
- [x] 5.2 `WriteLayout.astro`: title → Bricolage; lead → Geist; eyebrow per restraint rule
- [x] 5.3 `src/pages/writes/*.astro` (both): body/lead → Geist; pull-quote → Bricolage at a distinct weight/size (no faux italic), `--lh-snug`
- [x] 5.4 `src/pages/privacy.astro`: h1 → Bricolage; body → Geist; h2/back-link → mono
- [x] 5.5 Diagrams (`DltArchitecture`, `DltCicd`, `PbiRelease`, `PbiValidate`, `MlPipeline`): sans labels `--font-serif`→Geist; keep mono numerics with `tabular-nums`; keep bronze/silver scoped to DltArchitecture

## 6. Color contrast audit

- [x] 6.1 Promote `--ink-faint` reading-content uses to `--ink-dim` (ChatPanel disclaimer, Projects muted link, Chatbot placeholder, ProjectDetail stat label); keep faint for watermarks/decoration
- [x] 6.2 Verify diagram faint labels against the dark `.pd__plate` background meet 4.5:1; bump the 0.64rem ones if not

## 7. Verify

- [x] 7.1 `npm run build` clean (twice); production dist ships ONLY Bricolage Grotesque + Geist Sans + JetBrains Mono woff2 — no old families
- [x] 7.2 No `--font-serif`/`--font-luxe` or old font names left (two stale code comments updated); raw font-sizes remain only in diagrams (intentional) + 2 decorative watermark numerals (display outliers)
- [x] 7.2b Fixed visible em-dashes in edited markup: hero eyebrow, Chatbot `<h2>`, ChatPanel greeting, HeroBar lead, privacy list. (Bulk data copy — timeline.ts/projects.ts/wiki/corpus — deferred to a separate copy audit.)
- [x] 7.3 Verified in browser: 0px horizontal overflow at 1440 and 390; wordmark fits mobile; motion untouched
- [x] 7.4 Faint reading-text promoted to `--ink-dim`; font payload cut (11 files → 3 families). Numeric Lighthouse/contrast pass left as a Tong follow-up (watched, not gated)
- [x] 7.5 Visual pass via screenshots (hero, Experience, project detail): promoted headings stand alone, eyebrows thinned to hero-only, rhythm reads premium
- [x] 7.6 Hero wordmark at weight 430 verified legible over the video, desktop + mobile
- [x] 7.7 Machine caps (FOUNDATIONS/LIFTOFF, THE PROBLEM) verified legible with size-aware tracking
