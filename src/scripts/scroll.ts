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
import SplitType from 'split-type';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Module-level handles so teardown can dispose exactly what init created.
let lenis: Lenis | null = null;
let tickerFn: ((time: number) => void) | null = null;
let onSpineResize: (() => void) | null = null;

function teardown() {
  ScrollTrigger.getAll().forEach((t) => t.kill());
  if (tickerFn) gsap.ticker.remove(tickerFn);
  if (onSpineResize) window.removeEventListener('resize', onSpineResize);
  onSpineResize = null;
  lenis?.destroy();
  lenis = null;
  (window as Window & { __lenis?: Lenis | null }).__lenis = null;
  tickerFn = null;
}

function init() {
  if (reduce) return;
  // Guard against a double-init (e.g. page-load firing without a prior swap).
  if (lenis) teardown();

  gsap.registerPlugin(ScrollTrigger);

  // Smooth scroll, wired into ScrollTrigger so triggers stay in sync with Lenis.
  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  // Expose the instance so overlays (e.g. the full-screen chat) can pause page
  // scrolling while open, then resume it — otherwise wheel events inside the
  // overlay scroll the page behind it instead of the overlay's own content.
  (window as Window & { __lenis?: Lenis | null }).__lenis = lenis;
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

  initSpine();
  initProjects();
}

/*
 * Projects cards: split each card's index watermark and title into per-letter
 * spans (each carrying its index in --i) so the gold flow can wave across them
 * left→right on hover/focus — the same mechanism as the Experience keywords,
 * but pointer-driven here. The hover trigger itself is pure CSS; this only
 * prepares the letters. Guarded so a re-init never double-wraps.
 */
function initProjects() {
  const cards = gsap.utils.toArray<HTMLElement>('.proj .card');
  cards.forEach((card) => {
    card.querySelectorAll<HTMLElement>('.card__num, .card__name').forEach((el) => {
      if (el.dataset.split) return;
      // 'words, chars' keeps whole words intact so multi-word titles still wrap
      // cleanly at spaces; each char still carries its global index for the wave.
      const split = new SplitType(el, { types: 'words, chars' });
      (split.chars ?? []).forEach((c, i) => c.style.setProperty('--i', String(i)));
      el.dataset.split = '1';
    });
  });
}

/*
 * Experience spine: draw the gold line as the section scrolls and ignite each
 * year's node as the line's tip reaches it. Past beats stay lit, the frontier
 * beat is marked `is-current` (brightest), future beats rest dim. A fine-pointer
 * "reading light" follows the cursor over the hovered beat.
 *
 * Only runs when init() did (i.e. motion is allowed); under reduced motion the
 * CSS leaves every beat fully lit, so this enhancement is purely additive.
 */
function initSpine() {
  const spine = document.querySelector<HTMLElement>('.exp__spine');
  if (!spine) return;
  const fill = spine.querySelector<HTMLElement>('.exp__fill');
  const beats = gsap.utils.toArray<HTMLElement>('.exp__beat');
  if (!fill || !beats.length) return;

  spine.classList.add('is-live'); // hand control of the lit/dim state to JS

  // Split each keyword into per-letter spans (carrying their index in --i) so the
  // gold flow can wave across them left→right when the beat is current. Guarded so
  // a re-init (e.g. double page-load) never double-wraps an already-split keyword.
  beats.forEach((b) => {
    const kw = b.querySelector<HTMLElement>('.exp__kw');
    if (!kw || kw.dataset.split) return;
    const split = new SplitType(kw, { types: 'chars' });
    (split.chars ?? []).forEach((c, i) => c.style.setProperty('--i', String(i)));
    kw.dataset.split = '1';
  });

  // Pin the gold line to the SUN in the fixed scene. The sun is a viewport-scaled
  // background, so we measure per layout (load + resize) and translate the whole
  // spine (--exp-shift) so the line lands on the sun — bounded on both sides:
  // never so far left that the year overlaps the intro, nor so far right that the
  // longest (nowrap) keyword runs off the right edge.
  const SUN_FRAC = 0.592; // horizontal centre of the sun disc in graded-loop.jpg (measured, tunable)
  const SCENE_W = 1920, SCENE_H = 1080;
  const sunX = () => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const scale = Math.max(vw / SCENE_W, vh / SCENE_H); // background-size: cover
    return (vw - SCENE_W * scale) / 2 + SUN_FRAC * SCENE_W * scale;
  };
  const node0 = beats[0].querySelector<HTMLElement>('.exp__node');
  const year0 = beats[0].querySelector<HTMLElement>('.exp__year');
  const introEl = document.querySelector<HTMLElement>('.exp__intro');
  const EDGE_PAD = 32; // keep the longest keyword this far clear of the right edge
  const placeLine = () => {
    if (!node0 || !year0) return;
    // The two-column door-pin only applies on the desktop layout; the phone layout
    // (≤48rem) is a single stacked column, so leave it unshifted.
    if (window.matchMedia('(max-width: 48rem)').matches) {
      spine.style.removeProperty('--exp-shift');
      return;
    }
    spine.style.setProperty('--exp-shift', '0px'); // reset to read the natural x
    const lineX = node0.getBoundingClientRect().left + node0.offsetWidth / 2;
    const yearLeft = year0.getBoundingClientRect().left;
    const introRight = introEl ? introEl.getBoundingClientRect().right : 0;
    // widest keyword's right edge at the natural position → cap on rightward shift
    const maxKwRight = Math.max(...beats.map((b) => {
      const kw = b.querySelector<HTMLElement>('.exp__kw');
      return kw ? kw.getBoundingClientRect().left + kw.scrollWidth : 0;
    }));
    const minShift = introRight + 28 - yearLeft;               // year clear of the intro
    const maxShift = window.innerWidth - EDGE_PAD - maxKwRight; // keyword clear of the edge
    let shift = sunX() - lineX;
    shift = Math.min(maxShift, Math.max(minShift, shift));     // right-edge guard wins
    spine.style.setProperty('--exp-shift', `${Math.round(shift)}px`);
  };
  requestAnimationFrame(placeLine); // after layout/fonts settle
  onSpineResize = placeLine;
  window.addEventListener('resize', placeLine, { passive: true });

  // Vertical centre of each beat's node, measured from the spine's top. Cached
  // on refresh because fonts/layout settle after first paint and the sticky
  // intro shifts the column. The fill tip is offset by the track's 0.6rem inset.
  let nodeYs: number[] = [];
  const measure = () => {
    nodeYs = beats.map((b) => {
      const node = b.querySelector<HTMLElement>('.exp__node');
      const ny = node ? node.offsetTop + node.offsetHeight / 2 : 0;
      return b.offsetTop + ny;
    });
  };

  ScrollTrigger.create({
    trigger: spine,
    start: 'top 62%',   // line begins drawing as the spine enters the lower third
    end: 'bottom 52%',  // and completes just past centre
    onRefresh: measure,
    onUpdate: (self) => {
      // Draw the gold line: its tip travels from the top inset to the bottom
      // inset as progress goes 0→1. Height set in px (the spine height is auto).
      const inset = 0.6 * 16;
      const tipY = inset + self.progress * (spine.clientHeight - inset * 2);
      fill.style.height = `${Math.max(0, tipY - inset)}px`;
      let current = -1;
      beats.forEach((b, i) => {
        const lit = nodeYs[i] <= tipY;
        b.classList.toggle('is-lit', lit);
        if (lit) current = i;
      });
      beats.forEach((b, i) => b.classList.toggle('is-current', i === current));
    },
  });

  // Cursor reading-light: write the pointer position (as % of the hovered beat's
  // body) into --gx/--gy; the CSS radial glow follows. Fine-pointer only.
  if (window.matchMedia('(hover: hover)').matches) {
    spine.addEventListener('pointermove', (e) => {
      const body = (e.target as Element | null)?.closest<HTMLElement>('.exp__body');
      if (!body) return;
      const r = body.getBoundingClientRect();
      body.style.setProperty('--gx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
      body.style.setProperty('--gy', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
    }, { passive: true });
  }
}

// Fires on the initial load and after every View Transitions navigation.
document.addEventListener('astro:page-load', init);
// Dispose before the outgoing DOM is swapped out.
document.addEventListener('astro:before-swap', teardown);
