import React from 'react';

/**
 * LiveDot
 * Rhythmic pulsing signal dot representing the living pulse of the event.
 */
export function LiveDot({ size = 8, color = 'var(--pulse)', ring = true, className = '' }) {
  return (
    <span
      className={`pulse-live-dot-wrap ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: `${size * 2}px`,
        height: `${size * 2}px`,
        verticalAlign: 'middle',
      }}
      aria-hidden="true"
    >
      {ring && (
        <span
          className="pulse-live-ring"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            backgroundColor: color,
            opacity: 0.4,
          }}
        />
      )}
      <span
        className="pulse-live-core"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          backgroundColor: color,
          display: 'block',
          position: 'relative',
          zIndex: 1,
        }}
      />
    </span>
  );
}

export default LiveDot;
