import React from 'react';
import { Card } from './Card';

export function StatCard({
  label,
  value,
  secondaryText,
  icon: Icon,
  variant = 'default', // 'default' | 'healthy' | 'warning' | 'critical' | 'info'
  trend,
  onClick,
  className = ''
}) {
  const iconColors = {
    default: { color: 'var(--color-primary-light)', bg: 'rgba(99, 102, 241, 0.12)' },
    healthy: { color: 'var(--color-healthy-light)', bg: 'rgba(16, 185, 129, 0.12)' },
    warning: { color: 'var(--color-warning-light)', bg: 'rgba(245, 158, 11, 0.12)' },
    critical: { color: 'var(--color-critical-light)', bg: 'rgba(244, 63, 94, 0.14)' },
    info: { color: 'var(--color-accent-cyan)', bg: 'rgba(56, 189, 248, 0.12)' }
  };

  const currentTheme = iconColors[variant] || iconColors.default;

  const isCritical = variant === 'critical';

  return (
    <Card
      variant={isCritical ? 'glowing' : 'default'}
      padding="md"
      hoverable={true}
      onClick={onClick}
      className={`pulse-stat-card ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '136px',
        borderColor: isCritical ? 'rgba(244, 63, 94, 0.4)' : undefined,
        boxShadow: isCritical ? 'var(--shadow-critical)' : undefined
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <span
          style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            letterSpacing: '0.02em',
            textTransform: 'uppercase'
          }}
        >
          {label}
        </span>
        {Icon && (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: currentTheme.bg,
              color: currentTheme.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Icon size={16} />
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div style={{ marginTop: '10px' }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            fontWeight: 700,
            lineHeight: 1.1,
            color: isCritical ? '#fb7185' : 'var(--text-primary)',
            letterSpacing: '-0.03em'
          }}
        >
          {value}
        </div>
      </div>

      {/* Supporting Text / Sub-metric */}
      {(secondaryText || trend) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginTop: '8px'
          }}
        >
          {secondaryText && <span>{secondaryText}</span>}
          {trend && (
            <span style={{ color: currentTheme.color, fontWeight: 600, marginLeft: 'auto' }}>
              {trend}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
