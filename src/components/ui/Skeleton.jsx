import React from 'react';

export function Skeleton({
  width = '100%',
  height = '16px',
  borderRadius = 'var(--radius-xs)',
  variant = 'text', // 'text' | 'rect' | 'circle'
  className = '',
  style = {}
}) {
  const getRadius = () => {
    if (variant === 'circle') return '50%';
    if (borderRadius) return borderRadius;
    return 'var(--radius-xs)';
  };

  return (
    <div
      style={{
        width,
        height,
        borderRadius: getRadius(),
        background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.04) 25%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.04) 75%)',
        backgroundSize: '200% 100%',
        animation: 'pulseGlow 2s infinite ease-in-out',
        ...style
      }}
      className={`pulse-skeleton ${className}`}
      aria-hidden="true"
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div
      style={{
        background: 'rgba(15, 22, 38, 0.6)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width="90px" height="14px" />
        <Skeleton width="28px" height="28px" variant="circle" />
      </div>
      <Skeleton width="70px" height="32px" />
      <Skeleton width="120px" height="12px" />
    </div>
  );
}
