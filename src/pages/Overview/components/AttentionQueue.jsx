import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { AlertCircle, UserMinus, Radio, AlertTriangle, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AttentionQueue({ items = [] }) {
  const navigate = useNavigate();

  const severityConfig = {
    critical: {
      icon: AlertCircle,
      badgeVariant: 'critical',
      badgeLabel: 'Critical Deficit',
      borderColor: 'rgba(244, 63, 94, 0.4)',
      bg: 'rgba(244, 63, 94, 0.08)'
    },
    dropout: {
      icon: UserMinus,
      badgeVariant: 'warning',
      badgeLabel: 'Volunteer Dropout',
      borderColor: 'rgba(245, 158, 11, 0.35)',
      bg: 'rgba(245, 158, 11, 0.07)'
    },
    incident: {
      icon: Radio,
      badgeVariant: 'critical',
      badgeLabel: 'Live Incident',
      borderColor: 'rgba(244, 63, 94, 0.4)',
      bg: 'rgba(244, 63, 94, 0.08)'
    },
    warning: {
      icon: AlertTriangle,
      badgeVariant: 'warning',
      badgeLabel: 'Staffing Advisory',
      borderColor: 'rgba(245, 158, 11, 0.35)',
      bg: 'rgba(245, 158, 11, 0.07)'
    }
  };

  return (
    <Card variant="default" padding="lg">
      <SectionHeader
        title="Immediate Operations Queue"
        subtitle="Ranked real-time items requiring coordinator intervention or replacement dispatch."
        badge={
          <Badge variant="critical" size="sm" dot pulseDot>
            {items.length} Active Items
          </Badge>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((item) => {
          const config = severityConfig[item.severity] || severityConfig.warning;
          const Icon = config.icon;

          return (
            <div
              key={item.id}
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                background: config.bg,
                border: `1px solid ${config.borderColor}`,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                transition: 'transform var(--transition-fast)'
              }}
              className="pulse-attention-item"
            >
              {/* Left Details */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: '1 1 260px' }}>
                <div
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0, 0, 0, 0.25)',
                    color: item.severity === 'critical' || item.severity === 'incident' ? '#fb7185' : '#fbbf24',
                    marginTop: '2px'
                  }}
                >
                  <Icon size={18} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Badge variant={config.badgeVariant} size="sm">
                      {config.badgeLabel}
                    </Badge>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={11} /> {item.timestamp}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        background: 'rgba(255, 255, 255, 0.06)',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-xs)'
                      }}
                    >
                      {item.zone}
                    </span>
                  </div>

                  <div style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--text-primary)' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {item.detail}
                  </div>
                </div>
              </div>

              {/* Right Action Button */}
              <div>
                <Button
                  variant={item.severity === 'critical' || item.severity === 'incident' ? 'danger' : 'secondary'}
                  size="sm"
                  icon={ArrowRight}
                  iconPosition="right"
                  onClick={() => navigate(item.route)}
                >
                  {item.actionLabel}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
