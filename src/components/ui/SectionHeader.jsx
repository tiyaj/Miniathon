import React from 'react';

export function SectionHeader({
  title,
  subtitle,
  badge,
  action,
  className = '',
  style = {}
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
        ...style
      }}
      className={`pulse-section-header ${className}`}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2
            style={{
              fontSize: '1.45rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              margin: 0
            }}
          >
            {title}
          </h2>
          {badge}
        </div>
        {subtitle && (
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              marginTop: '4px',
              margin: 0,
              maxWidth: '600px'
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {action}
        </div>
      )}
    </div>
  );
}
