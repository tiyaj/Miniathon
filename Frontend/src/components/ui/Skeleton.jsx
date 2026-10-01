import React from 'react';

export function Skeleton({
  width = '100%',
  height = '16px',
  borderRadius = 'var(--radius)',
  variant = 'text', // 'text' | 'rect' | 'circle'
  className = '',
  style = {}
}) {
  const getRadius = () => {
    if (variant === 'circle') return '50%';
    if (borderRadius) return borderRadius;
    return 'var(--radius)';
  };

  return (
    <div
      style={{
        width,
        height,
        borderRadius: getRadius(),
        backgroundColor: 'var(--paper-sunken)',
        backgroundImage: 'linear-gradient(90deg, var(--paper-sunken) 0%, var(--paper-raised) 50%, var(--paper-sunken) 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeletonShimmer 1.5s infinite ease-in-out',
        border: '1px solid var(--line)',
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
        backgroundColor: 'var(--paper-raised)',
        border: '1px solid var(--line-strong)',
        borderRadius: 'var(--radius)',
        padding: '16px',
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

export default Skeleton;
