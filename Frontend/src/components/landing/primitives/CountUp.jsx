import React, { useRef } from 'react';
import { useInView } from 'framer-motion';
import { useCountUp } from '../../../hooks/useCountUp';

/**
 * CountUp
 * Typographic counter component driven by rAF interpolation when scrolled into view.
 */
export function CountUp({
  target = 0,
  padStart = 0,
  duration = 1400,
  delay = 0,
  className = '',
  style = {},
}) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-20px' });
  const { formatted } = useCountUp(target, isInView, {
    duration,
    delay,
    padStart,
  });

  return (
    <span
      ref={containerRef}
      className={`pulse-counter font-display ${className}`}
      style={{
        display: 'inline-block',
        fontVariantNumeric: 'tabular-nums',
        ...style,
      }}
    >
      {formatted}
    </span>
  );
}

export default CountUp;
