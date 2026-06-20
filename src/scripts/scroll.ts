/*
 * Scroll + transition engine for the body.
 *   - Lenis drives smooth scrolling (the "hold" easing between beats).
 *   - GSAP ScrollTrigger drives reveal-on-enter for every [data-reveal] element.
 * The sticky-stack "slide over" (Experience) is pure CSS sticky — no JS needed —
 * so it survives even if this module never runs.
 *
 * With View Transitions enabled, this module loads once but must (re)initialize
 * on every page — so init runs on `astro:page-load` (fires on first load AND
 * after each client-side navigation) and tears down on `astro:before-swap` so
 * Lenis instances and ScrollTriggers never leak across navigations.
 *
 * Under reduced motion we do NOTHING: no Lenis, no reveals. The CSS already
 * leaves all content visible, native scrolling works, and the page is fully usable.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Module-level handles so teardown can dispose exactly what init created.
let lenis: Lenis | null = null;
let tickerFn: ((time: number) => void) | null = null;

function teardown() {
  ScrollTrigger.getAll().forEach((t) => t.kill());
  if (tickerFn) gsap.ticker.remove(tickerFn);
  lenis?.destroy();
  lenis = null;
  tickerFn = null;
}

function init() {
  if (reduce) return;
  // Guard against a double-init (e.g. page-load firing without a prior swap).
  if (lenis) teardown();

  gsap.registerPlugin(ScrollTrigger);

  // Smooth scroll, wired into ScrollTrigger so triggers stay in sync with Lenis.
  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  tickerFn = (time) => lenis!.raf(time * 1000);
  gsap.ticker.add(tickerFn);
  gsap.ticker.lagSmoothing(0);

  // Reveal-on-enter: each element slides up + fades in once as it enters view.
  const items = gsap.utils.toArray<HTMLElement>('[data-reveal]');
  items.forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });
}

// Fires on the initial load and after every View Transitions navigation.
document.addEventListener('astro:page-load', init);
// Dispose before the outgoing DOM is swapped out.
document.addEventListener('astro:before-swap', teardown);
