/**
 * Dev utility to verify hero cards keep-out zone and collision clearance (§11)
 * Exposed on window.checkHeroOverlap in dev environments.
 */
export function checkHeroOverlap() {
  const r = (s) => document.querySelector(s)?.getBoundingClientRect();
  const hit = (a, b) =>
    a &&
    b &&
    !(
      a.right <= b.left ||
      a.left >= b.right ||
      a.bottom <= b.top ||
      a.top >= b.bottom
    );

  const keep = [
    '[data-hero-headline]',
    '[data-hero-ticker]',
    '[data-hero-stat]',
    '[data-hero-scroll]',
    '[data-menu]',
  ];

  let overlapsFound = 0;
  const cards = document.querySelectorAll('[data-hero-card]');

  cards.forEach((c) => {
    const cr = c.getBoundingClientRect();
    keep.forEach((k) => {
      const kr = r(k);
      if (hit(cr, kr)) {
        overlapsFound++;
        console.warn('OVERLAP DETECTED:', c.dataset.heroCard, '↔', k, {
          cardRect: cr,
          keepRect: kr,
        });
      }
    });
  });

  if (overlapsFound === 0) {
    console.log(
      `✓ Hero layout verified: 0 overlaps across ${cards.length} cards and ${keep.length} protected rectangles.`
    );
  } else {
    console.warn(`✗ ${overlapsFound} overlaps detected!`);
  }

  return overlapsFound === 0;
}

if (typeof window !== 'undefined') {
  window.checkHeroOverlap = checkHeroOverlap;
}

export default checkHeroOverlap;
