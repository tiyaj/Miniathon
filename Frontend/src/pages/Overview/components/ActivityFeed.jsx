import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { Activity, Radio, CheckCircle2, UserCheck, UserMinus, Sparkles } from 'lucide-react';

export function ActivityFeed({ activities = [] }) {
  const categoryConfig = {
    checkin: {
      dotColor: '#34d399',
      badgeVariant: 'healthy',
      icon: UserCheck
    },
    dropout: {
      dotColor: '#fbbf24',
      badgeVariant: 'warning',
      icon: UserMinus
    },
    replacement: {
      dotColor: '#818cf8',
      badgeVariant: 'accent',
      icon: Sparkles
    },
    incident: {
      dotColor: '#fb7185',
      badgeVariant: 'critical',
      icon: Radio
    },
    task: {
      dotColor: '#38bdf8',
      badgeVariant: 'info',
      icon: CheckCircle2
    }
  };

  return (
    <Card variant="default" padding="lg">
      <SectionHeader
        title="Live Operations Log"
        subtitle="Chronological audit stream of attendance, incident escalation, and dispatch actions."
        badge={
          <Badge variant="healthy" size="sm" dot pulseDot>
            Live Stream
          </Badge>
        }
      />

      <div style={{ position: 'relative', paddingLeft: '16px' }}>
        {/* Vertical subtle timeline line */}
        <div
          style={{
            position: 'absolute',
            left: '6px',
            top: '8px',
            bottom: '8px',
            width: '1px',
            background: 'linear-gradient(to bottom, rgba(99, 102, 241, 0.4), rgba(255, 255, 255, 0.05))'
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {activities.map((item) => {
            const config = categoryConfig[item.category] || categoryConfig.checkin;
            const Icon = config.icon;

            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  position: 'relative'
                }}
              >
                {/* Timeline Node Dot */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-14px',
                    top: '4px',
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    backgroundColor: config.dotColor,
                    boxShadow: `0 0 8px ${config.dotColor}`,
                    border: '2px solid var(--bg-surface)'
                  }}
                />

                {/* Content */}
                <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.text}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                      ({item.zone})
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Badge variant={config.badgeVariant} size="sm" icon={Icon}>
                      {item.badge}
                    </Badge>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      {item.time}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
