import React from 'react';

/**
 * StatusBadge
 * Single source of truth for semantic status indicators across PULSE.
 * 
 * States:
 * - checked-in: mint (#146b49 on rgba(31,160,110,.12))
 * - assigned:   neutral (#15130f on #fbfaf5, 1px strong border)
 * - available:  sky/indigo (#1d5f9a on rgba(54,150,230,.12))
 * - on-break:   amber (#8a5300 on rgba(232,150,30,.16))
 * - absent:     coral (#a8281a on rgba(228,71,43,.12))
 */
export function StatusBadge({
  status = 'neutral',
  children,
  size = 'md',
  pulse = false,
  className = '',
  style = {}
}) {
  const rawStatus = (children || status || '').toString().trim().toLowerCase();

  // Normalize API and UI status strings
  let normalizedKey = 'neutral';
  let displayLabel = children || status;

  if (rawStatus === 'checked-in' || rawStatus === 'checked in' || rawStatus === 'checkedin') {
    normalizedKey = 'checked-in';
    displayLabel = 'CHECKED IN';
  } else if (rawStatus === 'assigned') {
    normalizedKey = 'assigned';
    displayLabel = 'ASSIGNED';
  } else if (rawStatus === 'available') {
    normalizedKey = 'available';
    displayLabel = 'AVAILABLE';
  } else if (rawStatus === 'on-break' || rawStatus === 'on break' || rawStatus === 'break') {
    normalizedKey = 'on-break';
    displayLabel = 'ON BREAK';
  } else if (
    rawStatus === 'absent' ||
    rawStatus === 'no show' ||
    rawStatus === 'no-show' ||
    rawStatus === 'dropout' ||
    rawStatus === 'critical'
  ) {
    normalizedKey = 'absent';
    displayLabel = rawStatus.toUpperCase();
  } else if (rawStatus === 'checked-out' || rawStatus === 'checked out') {
    normalizedKey = 'neutral';
    displayLabel = 'CHECKED OUT';
  }

  const stateConfigs = {
    'checked-in': {
      bg: 'var(--mint-bg)',
      border: 'rgba(31, 160, 110, 0.35)',
      color: 'var(--mint-ink)',
      dotColor: 'var(--mint)'
    },
    'assigned': {
      bg: 'var(--paper-raised)',
      border: 'var(--line-strong)',
      color: 'var(--ink)',
      dotColor: 'var(--ink-2)'
    },
    'available': {
      bg: 'var(--sky-bg)',
      border: 'rgba(54, 150, 230, 0.35)',
      color: 'var(--sky-ink)',
      dotColor: 'var(--sky)'
    },
    'on-break': {
      bg: 'var(--amber-bg)',
      border: 'rgba(232, 150, 30, 0.35)',
      color: 'var(--amber-ink)',
      dotColor: 'var(--amber)'
    },
    'absent': {
      bg: 'var(--coral-bg)',
      border: 'rgba(228, 71, 43, 0.35)',
      color: 'var(--coral-ink)',
      dotColor: 'var(--coral)'
    },
    'neutral': {
      bg: 'var(--paper-sunken)',
      border: 'var(--line)',
      color: 'var(--ink-2)',
      dotColor: 'var(--ink-3)'
    }
  };

  const current = stateConfigs[normalizedKey] || stateConfigs.neutral;

  const isSmall = size === 'sm';

  return (
    <span
      className={`pulse-status-badge pulse-status-${normalizedKey} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: isSmall ? '2px 8px' : '4px 10px',
        height: isSmall ? '22px' : '26px',
        backgroundColor: current.bg,
        border: `1px solid ${current.border}`,
        borderRadius: 'var(--radius)',
        color: current.color,
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
        ...style
      }}
    >
      <span className="sr-only">Status: </span>
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: current.dotColor,
          flexShrink: 0,
          animation: pulse ? 'pulseGlow 2s infinite ease-in-out' : 'none'
        }}
        aria-hidden="true"
      />
      <span>{displayLabel}</span>
    </span>
  );
}

export default StatusBadge;
