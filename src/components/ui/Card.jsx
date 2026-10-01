import React from 'react';

export function Card({
  children,
  variant = 'default', // 'default' | 'elevated' | 'glowing' | 'subtle'
  padding = 'md', // 'none' | 'sm' | 'md' | 'lg'
  hoverable = true,
  className = '',
  style = {},
  onClick,
  ...props
}) {
  const paddingMap = {
    none: '0',
    sm: 'var(--space-3)',
    md: 'var(--space-5)',
    lg: 'var(--space-6)'
  };

  const variantStyles = {
    default: {
      background: 'var(--paper)',
      border: '1px solid var(--hairline)',
      boxShadow: 'none'
    },
    elevated: {
      background: 'var(--paper-raised)',
      border: '1px solid var(--hairline-bold)',
      boxShadow: 'none'
    },
    glowing: {
      background: 'var(--paper)',
      border: '1px solid var(--pulse-weak)',
      borderLeft: '3px solid var(--pulse)',
      boxShadow: 'none'
    },
    subtle: {
      background: 'transparent',
      border: '1px solid var(--hairline)',
      boxShadow: 'none'
    }
  };

  const cardStyle = {
    borderRadius: 'var(--radius-sm)',
    padding: paddingMap[padding] || paddingMap.md,
    transition: 'transform var(--transition-base), border-color var(--transition-base)',
    cursor: onClick ? 'pointer' : 'default',
    position: 'relative',
    ...variantStyles[variant],
    ...style
  };

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      className={`pulse-card ${hoverable ? 'pulse-card-hoverable' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
