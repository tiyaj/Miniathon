import React from 'react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { activeEvent } from '../../data/eventMock';

export function IncidentsPlaceholder() {
  const navigate = useNavigate();

  const mockIncidents = [
    { id: 'INC-01', title: 'Main Gate turnstile scanner offline', zone: 'ENTRY GATE', severity: 'CRITICAL', status: 'DISPATCHED', time: '4m ago' },
    { id: 'INC-02', title: 'Power surge in North audio rack', zone: 'MAIN STAGE', severity: 'HIGH', status: 'ACKNOWLEDGED', time: '12m ago' },
    { id: 'INC-03', title: 'Water replenishment delay at food stall 4', zone: 'FOOD ZONE', severity: 'MEDIUM', status: 'INVESTIGATING', time: '18m ago' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <SectionHeader
        title="Incident Command & Rapid Triage"
        subtitle="Emergency escalation, security routing, and verified field resolutions."
        badge={
          <Badge variant="critical" size="md" icon={ShieldAlert}>
            {activeEvent.stats.incidents} Open Escalations
          </Badge>
        }
        action={
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Command Overview
          </Button>
        }
      />

      <Card padding="lg" style={{ border: '1px solid var(--pulse-weak)', backgroundColor: 'var(--paper)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--hairline)', paddingBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)', color: 'var(--pulse)' }}>
              Active Critical Alerts
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--ink-70)', margin: '4px 0 0 0' }}>
              Automatic broadcast to field coordinators and zone captains
            </p>
          </div>
          <Badge variant="critical" size="sm">Live Triage</Badge>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {mockIncidents.map((inc) => (
            <div
              key={inc.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '90px 1fr 140px 110px 120px 80px',
                alignItems: 'center',
                padding: '14px 18px',
                border: '1px solid var(--hairline)',
                borderLeft: '4px solid var(--pulse)',
                backgroundColor: 'var(--paper-raised)',
                gap: '12px',
              }}
              className="font-mono"
            >
              <span style={{ fontWeight: 700, color: 'var(--pulse)', fontSize: '0.8rem' }}>{inc.id}</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, color: 'var(--ink)' }}>{inc.title}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-70)' }}>{inc.zone}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--pulse)', fontWeight: 700 }}>{inc.severity}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--ink)' }}>{inc.status}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-45)', textAlign: 'right' }}>{inc.time}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
          <Button variant="critical" onClick={() => navigate('/live-ops')}>
            Route Emergency Response
          </Button>
          <Button variant="ghost" onClick={() => navigate('/')}>
            ← Back to Landing
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default IncidentsPlaceholder;
