import React from 'react';

/**
 * Chip
 * Compact tag for skills, zones, and operational filters.
 */
export function Chip({
  children,
  onClick,
  active = false,
  removable = false,
  onRemove,
  title,
  className = '',
  style = {}
}) {
  const isInteractive = Boolean(onClick);

  return (
    <span
      className={`pulse-chip ${active ? 'pulse-chip-active' : ''} ${className}`}
      onClick={onClick}
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 8px',
        backgroundColor: active ? 'var(--ink)' : 'var(--paper-sunken)',
        color: active ? 'var(--ink-inverse)' : 'var(--ink)',
        border: `1px solid ${active ? 'var(--line-strong)' : 'var(--line)'}`,
        borderRadius: 'var(--radius)',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        lineHeight: 1.2,
        cursor: isInteractive ? 'pointer' : 'default',
        transition: 'all var(--dur-fast) var(--ease-out)',
        ...style
      }}
    >
      <span>{children}</span>
      {removable && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove filter"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: 'inherit',
            display: 'inline-flex',
            alignItems: 'center',
            marginLeft: '2px',
            fontSize: '12px',
            lineHeight: 1
          }}
        >
          &times;
        </button>
      )}
    </span>
  );
}

export default Chip;
