/*
 * Pointer spotlight — one shared listener that lights up whichever
 * [data-spotlight] card the cursor is over. It writes element-local CSS vars
 * (--x/--y in px, --xp normalized) that the card's gold spotlight gradient
 * reads in backbone.css.
 *
 * Compositor-only on move: the hovered card's rect is cached when the pointer
 * first enters it (and refreshed on scroll/resize, since the sticky-stack moves
 * cards under a smooth-scrolling viewport), so moving the mouse only updates CSS
 * vars and never forces layout. Hover-only by nature — touch devices never fire
 * these, and the reduced-motion guard lives in CSS.
 */

// Only wire up on devices with a real hover pointer; touch never gets the glow.
if (window.matchMedia('(hover: hover)').matches) {
  let current: HTMLElement | null = null; // card under the pointer right now
  let rect: DOMRect | null = null; // its cached bounds

  const onMove = (e: PointerEvent) => {
    const card =
      (e.target as Element | null)?.closest<HTMLElement>('[data-spotlight]') ?? null;

    // Re-cache bounds only when the pointer crosses into a different card.
    if (card !== current) {
      current = card;
      rect = card ? card.getBoundingClientRect() : null;
    }
    if (!card || !rect) return;

    // Element-local coordinates so the spotlight tracks correctly even inside
    // the sticky-stack's transformed / fixed-backdrop parents.
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--x', x.toFixed(1));
    card.style.setProperty('--y', y.toFixed(1));
    card.style.setProperty('--xp', (x / rect.width).toFixed(3));
  };

  // The cached rect goes stale when the page scrolls or resizes mid-hover.
  const refresh = () => {
    rect = current ? current.getBoundingClientRect() : null;
  };

  document.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('scroll', refresh, { passive: true });
  window.addEventListener('resize', refresh, { passive: true });
}
