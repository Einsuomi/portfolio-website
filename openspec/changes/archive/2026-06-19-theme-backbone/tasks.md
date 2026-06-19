## 1. Backbone shell & scroll engine

- [x] 1.1 Add `lenis` and `gsap` (with ScrollTrigger) as dependencies
- [x] 1.2 Define backbone theme tokens (near-black canvas, golden edge-rim accent, optional grain/gradient) and apply a persistent canvas below the hero
- [x] 1.3 Build the site-shell layout that composes the body sections in order: Experience → Projects → Writes → Chatbot → Contact
- [x] 1.4 Initialize Lenis smooth scroll and wire GSAP ScrollTrigger; add a reusable reveal-on-enter (slide-up + fade) utility
- [x] 1.5 Implement the hero → backbone dissolve hand-off (fade hero into the canvas on scroll-out, no hard cut)
- [x] 1.6 Add the global reduced-motion / no-JS fallback: disable Lenis and animations, show all content statically, guarantee no page-level horizontal overflow

## 2. Experience timeline

- [x] 2.1 Create a single content source for the five year beats (2021 FOUNDATIONS, 2023 LIFTOFF, 2024 0→1, 2025 SCALE, 2026 GOVERNANCE AT SCALE) with role/employer/stack/one-outcome from the CV
- [x] 2.2 Build the year-beat component (huge keyword + auto-revealed supporting detail, signal-only, no flip/hidden interaction)
- [x] 2.3 Implement the sticky-stack scroll behavior (each year holds, next slides up over it) via ScrollTrigger pin
- [x] 2.4 Add the small quiet certifications strip (DP-700, DP-203, PL-300, Snowflake)
- [x] 2.5 Verify the static vertical fallback under reduced motion / touch with all detail visible

## 3. Projects gallery

- [x] 3.1 Create the content source for the 4 curated cards (Fingrid, AWS DLT, J&D CI/CD Power BI, Heureka BI) with name, summary, stack, link
- [x] 3.2 Build the horizontal-scroll gallery (image-forward cards), self-contained and touch/trackpad/drag scrollable
- [x] 3.3 Assert the gallery never causes page-level horizontal overflow on mobile

## 4. Writes list

- [x] 4.1 Create the content source for the 2 case-study pieces (title, one-line summary, link), extensible to more
- [x] 4.2 Build the vertical editorial list, visually distinct from the Projects gallery

## 5. Chatbot entry

- [x] 5.1 Build the persistent fixed-corner launcher, visible hero-to-contact, non-blocking over content
- [x] 5.2 Build the dedicated climax section before Contact with the "ask the assistant about Tong" invitation
- [x] 5.3 Show a placeholder/"coming soon" state (no working backend, no broken/erroring UI) and degrade the launcher gracefully without JS

## 6. Contact

- [x] 6.1 Build the closing Contact section with email, LinkedIn, GitHub as real HTML links, on the backbone canvas (optional location / Blue Card note)

## 7. Verification & polish

- [x] 7.1 Verify section order, dissolve, reveals, and the rationed sticky-stack beats in-browser (desktop + mobile widths)
- [x] 7.2 Confirm text contrast ≥ 4.5:1 across all sections and no accidental horizontal overflow at any width
- [x] 7.3 Confirm full usability with JS disabled and under reduced motion
- [x] 7.4 Report LCP / JS weight (Lenis + GSAP) as a watched metric
- [x] 7.5 Run `npm run build` / `astro check`, then `npm run check-leaks` before any push
