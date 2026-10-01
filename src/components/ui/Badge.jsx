import React from 'react';

export function Badge({
  children,
  variant = 'neutral', // 'healthy' | 'warning' | 'critical' | 'neutral' | 'info' | 'accent'
  size = 'md', // 'sm' | 'md'
  dot = false,
  pulseDot = false,
  icon: Icon,
  className = '',
  style = {}
}) {
  const variantStyles = {
    healthy: {
      background: 'rgba(21, 128, 61, 0.08)',
      color: '#15803d',
      border: '1px solid rgba(21, 128, 61, 0.25)',
      dotColor: '#15803d'
    },
    warning: {
      background: 'rgba(180, 83, 9, 0.08)',
      color: '#b45309',
      border: '1px solid rgba(180, 83, 9, 0.25)',
      dotColor: '#b45309'
    },
    critical: {
      background: 'var(--pulse-weak)',
      color: 'var(--pulse)',
      border: '1px solid var(--pulse-weak)',
      dotColor: 'var(--pulse)'
    },
    neutral: {
      background: 'var(--paper-raised)',
      color: 'var(--ink-70)',
      border: '1px solid var(--hairline)',
      dotColor: 'var(--ink-45)'
    },
    info: {
      background: 'var(--paper-raised)',
      color: 'var(--ink)',
      border: '1px solid var(--hairline-bold)',
      dotColor: 'var(--ink)'
    },
    accent: {
      background: 'var(--paper-raised)',
      color: 'var(--ink)',
      border: '1px solid var(--ink)',
      dotColor: 'var(--ink)'
    }
  };

  const currentVariant = variantStyles[variant] || variantStyles.neutral;

  const sizeStyles = {
    sm: {
      fontSize: '0.6875rem',
      padding: '2px 8px',
      gap: '5px',
      height: '22px'
    },
    md: {
      fontSize: '0.75rem',
      padding: '3px 10px',
      gap: '6px',
      height: '26px'
    }
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontWeight: 600,
        fontFamily: 'var(--font-mono)',
        borderRadius: 'var(--radius-sm)',
        whiteSpace: 'nowrap',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        ...currentSize,
        background: currentVariant.background,
        color: currentVariant.color,
        border: currentVariant.border,
        ...style
      }}
      className={`pulse-badge pulse-badge-${variant} ${className}`}
    >
      {dot && (
        <span
          style={{
            width: size === 'sm' ? 6 : 7,
            height: size === 'sm' ? 6 : 7,
            borderRadius: '50%',
            backgroundColor: currentVariant.dotColor,
            display: 'inline-block',
            animation: pulseDot ? 'pulse-heartbeat-glow 2s infinite ease-in-out' : 'none'
          }}
        />
      )}
      {Icon && <Icon size={size === 'sm' ? 12 : 14} />}
      {children}
    </span>
  );
}

export default Badge;
