import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'danger' | 'critical'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  type = 'button',
  style = {},
  ...props
}) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 600,
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    borderRadius: 'var(--radius-sm)',
    transition: 'all var(--transition-fast)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    position: 'relative',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    outline: 'none',
  };

  const sizeStyles = {
    sm: {
      padding: '5px 12px',
      fontSize: '0.75rem',
      height: '30px',
    },
    md: {
      padding: '8px 16px',
      fontSize: '0.8125rem',
      height: '38px',
    },
    lg: {
      padding: '12px 24px',
      fontSize: '0.9rem',
      height: '46px',
    },
  };

  const variantStyles = {
    primary: {
      background: 'var(--ink)',
      color: 'var(--paper)',
      border: '1px solid var(--ink)',
    },
    secondary: {
      background: 'var(--paper-raised)',
      color: 'var(--ink)',
      border: '1px solid var(--hairline-bold)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--ink-70)',
      border: '1px solid transparent',
    },
    danger: {
      background: 'var(--pulse-weak)',
      color: 'var(--pulse)',
      border: '1px solid var(--pulse)',
    },
    critical: {
      background: 'var(--pulse)',
      color: '#FFFFFF',
      border: '1px solid var(--pulse)',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.primary;
  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={{
        ...baseStyles,
        ...currentSize,
        ...currentVariant,
        ...style,
      }}
      className={`pulse-button pulse-button-${variant} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === 'sm' ? 14 : 16} style={{ animation: 'spin 1s linear infinite' }} />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 16} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : 16} />}
        </>
      )}
    </button>
  );
}

export default Button;
