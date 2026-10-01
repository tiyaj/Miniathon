import React, { useRef } from 'react';
import { useInView } from 'framer-motion';
import { useReducedMotionSafe } from '../../../hooks/useReducedMotionSafe';

/**
 * Ticker
 * Seamless mono telemetry marquee scrolling operational stats across the screen.
 * Pauses automatically when offscreen or when reduced motion is requested.
 */
export function Ticker({
  items = [],
  speed = 40, // duration in seconds for one full loop
  separator = ' · ',
  className = '',
  style = {},
}) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { margin: '100px 0px 100px 0px' });
  const shouldReduceMotion = useReducedMotionSafe();

  const content = items.join(separator) + separator;

  return (
    <div
      ref={containerRef}
      className={`pulse-ticker-container ${className}`}
      style={{
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        width: '100%',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        ...style,
      }}
      aria-label="Operational Telemetry Stream"
    >
      <div
        className="pulse-ticker-track"
        style={{
          display: 'inline-flex',
          willChange: 'transform',
          animation: (!isInView || shouldReduceMotion)
            ? 'none'
            : `pulse-ticker-scroll ${speed}s linear infinite`,
        }}
      >
        <span className="font-mono pulse-ticker-text" style={{ paddingRight: '2rem' }}>
          {content}
        </span>
        <span className="font-mono pulse-ticker-text" style={{ paddingRight: '2rem' }} aria-hidden="true">
          {content}
        </span>
        <span className="font-mono pulse-ticker-text" style={{ paddingRight: '2rem' }} aria-hidden="true">
          {content}
        </span>
      </div>
    </div>
  );
}

export default Ticker;
