import React from 'react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { activeEvent } from '../../data/eventMock';

export function TasksPlaceholder() {
  const navigate = useNavigate();

  const mockTasks = [
    { id: 'TSK-01', title: 'Deploy crowd control barricades at Main Entry', zone: 'ENTRY GATE', status: 'IN_PROGRESS', priority: 'HIGH', assignee: 'Devansh N.' },
    { id: 'TSK-02', title: 'Verify QR scanner battery backups at Registration', zone: 'REGISTRATION', status: 'OPEN', priority: 'MEDIUM', assignee: 'Pooja M.' },
    { id: 'TSK-03', title: 'Audio check for keynote speakers stage mic', zone: 'MAIN STAGE', status: 'RESOLVED', priority: 'HIGH', assignee: 'Rohan V.' },
    { id: 'TSK-04', title: 'Replenish volunteer water stations in Food Zone', zone: 'FOOD ZONE', status: 'IN_PROGRESS', priority: 'URGENT', assignee: 'Neha P.' },
    { id: 'TSK-05', title: 'VIP Green Room badge clearance check', zone: 'BACKSTAGE', status: 'OPEN', priority: 'LOW', assignee: 'Aarav S.' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <SectionHeader
        title="Live Tasks Board"
        subtitle="Real-time dispatch, priority routing, and verified field completion."
        badge={
          <Badge variant="healthy" size="md" icon={CheckSquare}>
            {activeEvent.stats.tasks} Active Tasks
          </Badge>
        }
        action={
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Command Overview
          </Button>
        }
      />

      <Card padding="lg" style={{ border: '1px solid var(--hairline)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--hairline)', paddingBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)' }}>
              Ground Operations Task Ledger
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--ink-70)', margin: '4px 0 0 0' }}>
              Synchronized with mobile coordinator radios
            </p>
          </div>
          <Badge variant="accent" size="sm">Phase 2 CRUD Module</Badge>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {mockTasks.map((t) => (
            <div
              key={t.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '90px 1fr 140px 120px 100px',
                alignItems: 'center',
                padding: '12px 16px',
                border: '1px solid var(--hairline)',
                backgroundColor: 'var(--paper-raised)',
                gap: '12px',
              }}
              className="font-mono"
            >
              <span style={{ fontWeight: 700, color: 'var(--ink-70)', fontSize: '0.8rem' }}>{t.id}</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, color: 'var(--ink)' }}>{t.title}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-70)' }}>{t.zone}</span>
              <span style={{ fontSize: '0.75rem', color: t.priority === 'URGENT' ? 'var(--pulse)' : 'var(--ink-70)', fontWeight: t.priority === 'URGENT' ? 700 : 500 }}>
                {t.priority}
              </span>
              <span style={{ fontSize: '0.75rem', color: t.status === 'RESOLVED' ? '#15803d' : 'var(--ink)' }}>
                {t.status}
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
          <Button variant="primary" onClick={() => navigate('/volunteers')}>
            Assign Volunteers
          </Button>
          <Button variant="ghost" onClick={() => navigate('/')}>
            ← Back to Landing
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default TasksPlaceholder;
