/*
 * Scroll + transition engine for the body.
 *   - Lenis drives smooth scrolling (the "hold" easing between beats).
 *   - GSAP ScrollTrigger drives reveal-on-enter for every [data-reveal] element.
 * The sticky-stack "slide over" (Experience) is pure CSS sticky — no JS needed —
 * so it survives even if this module never runs.
 *
 * Under reduced motion we do NOTHING: no Lenis, no reveals. The CSS already
 * leaves all content visible, native scrolling works, and the page is fully usable.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduce) {
  gsap.registerPlugin(ScrollTrigger);

  // Smooth scroll, wired into ScrollTrigger so triggers stay in sync with Lenis.
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
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
