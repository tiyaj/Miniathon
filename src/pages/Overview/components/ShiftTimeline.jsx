import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { Clock, UserCheck, Calendar } from 'lucide-react';

export function ShiftTimeline({ shifts = [] }) {
  return (
    <Card variant="default" padding="lg">
      <SectionHeader
        title="Shift Staffing Timeline"
        subtitle="Current shift attendance and upcoming rotation readiness."
        badge={
          <Badge variant="info" size="sm" icon={Calendar}>
            3 Planned Shifts
          </Badge>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
        {shifts.map((shift) => {
          const isHealthy = shift.percent >= 85;
          const statusColor = isHealthy ? '#34d399' : '#fbbf24';

          return (
            <div
              key={shift.id}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: shift.activeNow ? 'rgba(99, 102, 241, 0.08)' : 'rgba(15, 22, 38, 0.6)',
                border: shift.activeNow ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-subtle)',
                position: 'relative'
              }}
            >
              {shift.activeNow && (
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  <Badge variant="healthy" size="sm" dot pulseDot>
                    Active Now
                  </Badge>
                </div>
              )}

              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {shift.name}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <Clock size={13} color="var(--color-primary-light)" />
                <span>{shift.time}</span>
              </div>

              {/* Staffing Metric */}
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Staffed:
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {shift.staffed} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ {shift.required}</span>
                  <span style={{ fontSize: '0.8rem', color: statusColor, marginLeft: '6px' }}>
                    ({shift.percent}%)
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 255, 255, 0.06)',
                  marginTop: '8px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${shift.percent}%`,
                    background: isHealthy
                      ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
                      : 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
                    borderRadius: 'var(--radius-full)'
                  }}
                />
              </div>

              {/* Shift Leads */}
              {shift.leads && (
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Leads: </span>
                  {shift.leads.join(', ')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
