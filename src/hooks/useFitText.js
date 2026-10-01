import { useEffect, useRef, useState } from 'react';

/**
 * useFitText (§4)
 * Ensures large headline text never overflows or clips at any viewport, zoom, or font variant.
 * Steps down font size by 4% if scrollWidth > clientWidth or scrollHeight > maxHeight.
 */
export function useFitText(options = {}) {
  const { maxReductionSteps = 6, reductionRatio = 0.96 } = options;
  const ref = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const checkFit = () => {
      let currentScale = 1;
      let steps = 0;

      el.style.fontSize = ''; // Reset

      while (
        steps < maxReductionSteps &&
        (el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight * 1.05)
      ) {
        currentScale *= reductionRatio;
        steps++;
        el.style.fontSize = `${(currentScale * 100).toFixed(1)}%`;
      }

      setScale(currentScale);
    };

    checkFit();

    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(checkFit);
      ro.observe(el);
      if (el.parentElement) ro.observe(el.parentElement);
    }

    window.addEventListener('resize', checkFit);

    return () => {
      window.removeEventListener('resize', checkFit);
      if (ro) ro.disconnect();
    };
  }, [maxReductionSteps, reductionRatio]);

  return { ref, scale };
}

export default useFitText;
