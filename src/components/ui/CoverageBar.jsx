import React, { useEffect, useState } from 'react';
import { Badge } from './Badge';
import { CheckCircle2, AlertTriangle, AlertCircle, ArrowUpRight } from 'lucide-react';

export function CoverageBar({
  zoneName,
  assigned,
  required,
  gaps = 0,
  overstaffed = false,
  status = 'healthy', // 'healthy' | 'warning' | 'critical' | 'info'
  showDetails = true,
  onClick
}) {
  const [animatedPercent, setAnimatedPercent] = useState(0);

  const rawPercent = required > 0 ? Math.round((assigned / required) * 100) : 0;
  const clampedDisplayPercent = Math.min(rawPercent, 100);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercent(clampedDisplayPercent);
    }, 120);
    return () => clearTimeout(timer);
  }, [clampedDisplayPercent]);

  const statusConfig = {
    critical: {
      badgeVariant: 'critical',
      badgeLabel: `${gaps} Gaps`,
      icon: AlertCircle,
      barGradient: 'linear-gradient(90deg, #f43f5e 0%, #fb7185 100%)',
      textColor: '#fb7185'
    },
    warning: {
      badgeVariant: 'warning',
      badgeLabel: `${gaps} Gap`,
      icon: AlertTriangle,
      barGradient: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
      textColor: '#fbbf24'
    },
    healthy: {
      badgeVariant: 'healthy',
      badgeLabel: 'Optimal',
      icon: CheckCircle2,
      barGradient: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
      textColor: '#34d399'
    },
    info: {
      badgeVariant: 'info',
      badgeLabel: 'Overstaffed (+1)',
      icon: ArrowUpRight,
      barGradient: 'linear-gradient(90deg, #38bdf8 0%, #818cf8 100%)',
      textColor: '#38bdf8'
    }
  };

  const currentStatus = statusConfig[status] || statusConfig.healthy;
  const StatusIcon = currentStatus.icon;

  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px 18px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(15, 22, 38, 0.55)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all var(--transition-fast)'
      }}
      className="pulse-coverage-item"
    >
      {/* Zone Label & Status Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--text-primary)' }}>
            {zoneName}
          </span>
          <Badge variant={currentStatus.badgeVariant} size="sm" icon={StatusIcon}>
            {currentStatus.badgeLabel}
          </Badge>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {assigned}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {required} required
          </span>
          <span
            style={{
              marginLeft: '6px',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: currentStatus.textColor,
              fontFamily: 'var(--font-mono)'
            }}
          >
            ({rawPercent}%)
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div
        style={{
          width: '100%',
          height: '7px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(255, 255, 255, 0.06)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${animatedPercent}%`,
            background: currentStatus.barGradient,
            borderRadius: 'var(--radius-full)',
            transition: 'width 800ms cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: `0 0 10px ${currentStatus.textColor}44`
          }}
        />
      </div>

      {/* Optional sub-details */}
      {showDetails && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>
            {gaps > 0 ? `${gaps} volunteer slot${gaps > 1 ? 's' : ''} vacant` : overstaffed ? '1 volunteer above requirement' : 'Full shift coverage ensured'}
          </span>
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Shift 1 Live
          </span>
        </div>
      )}
    </div>
  );
}
