import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Button
 * Standardized control adhering to the ink-on-paper aesthetic.
 * 
 * Variants:
 * - primary:   --ink fill, --ink-inverse text, 1px --line-strong border
 * - secondary: 1px --line-strong outline, --paper-raised fill, --ink text
 * - ghost:     transparent, --ink text, hover --paper-sunken
 * - danger:    --coral fill/outline, --coral-ink text
 */
export function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'danger'
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
    fontWeight: 700,
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    borderRadius: 'var(--radius)',
    transition: 'transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out), background-color var(--dur-fast) var(--ease-out)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    position: 'relative',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    outline: 'none',
    lineHeight: 1,
    boxSizing: 'border-box'
  };

  const sizeStyles = {
    sm: {
      padding: '0 12px',
      height: '34px',
      minHeight: '34px'
    },
    md: {
      padding: '0 18px',
      height: '44px',
      minHeight: '44px'
    },
    lg: {
      padding: '0 24px',
      height: '48px',
      minHeight: '48px'
    }
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--ink)',
      color: 'var(--ink-inverse)',
      border: '1px solid var(--line-strong)',
      boxShadow: disabled ? 'none' : '0 2px 0 var(--line-strong)'
    },
    secondary: {
      backgroundColor: 'var(--paper-raised)',
      color: 'var(--ink)',
      border: '1px solid var(--line-strong)',
      boxShadow: disabled ? 'none' : '0 2px 0 var(--line)'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--ink)',
      border: '1px solid transparent',
      boxShadow: 'none'
    },
    danger: {
      backgroundColor: 'var(--coral-bg)',
      color: 'var(--coral-ink)',
      border: '1px solid var(--coral)',
      boxShadow: 'none'
    }
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
        ...style
      }}
      className={`pulse-button pulse-button-${variant} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" aria-label="Loading..." />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={14} aria-hidden="true" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon size={14} aria-hidden="true" />}
        </>
      )}
    </button>
  );
}

export default Button;
