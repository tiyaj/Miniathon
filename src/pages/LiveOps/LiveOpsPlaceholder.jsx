import React from 'react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Radio,
  AlertOctagon,
  CheckSquare,
  Megaphone,
  ArrowRight,
  ShieldAlert,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LiveOpsPlaceholder() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <SectionHeader
        title="Live Operations & Incident Escalation"
        subtitle="Developer D Frontend Ownership Module: On-ground incident ticketing, tasks checklist, and radio broadcasts."
        badge={
          <Badge variant="critical" size="md" dot pulseDot icon={Radio}>
            Developer D Module
          </Badge>
        }
        action={
          <Button variant="secondary" onClick={() => navigate('/overview')}>
            Back to Command Overview
          </Button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-5)' }}>
        {/* Card 1: Active Incidents Module */}
        <Card variant="glowing" padding="lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(244, 63, 94, 0.15)',
                color: '#fb7185',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertOctagon size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Incident Escalation Desk
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                1 Critical Surge under investigation
              </p>
            </div>
          </div>

          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              marginBottom: '16px'
            }}
          >
            <strong>Entry Gate Surge:</strong> Security dispatch dispatched 2 queue guides.
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Developer D will provide the incident reporting modal, status tracking, and dispatch logs here.
          </p>
        </Card>

        {/* Card 2: Operations Tasks Checklist */}
        <Card variant="default" padding="lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CheckSquare size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                On-Ground Task Management
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                5 of 8 setup tasks resolved
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#34d399' }}>✓</span> Barricade inspection at Entry Gate
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#34d399' }}>✓</span> First Aid radio connectivity check
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24' }}>
              <span>○</span> Evening shift meal packet distribution
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Developer D will provide the full interactive task delegation and completion workflow here.
          </p>
        </Card>

        {/* Card 3: Announcements & Radio */}
        <Card variant="default" padding="lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Megaphone size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Volunteer Broadcast Radio
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                Push alerts & radio channel sync
              </p>
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
            Channel 2: Security & Entry Gate<br />
            Channel 4: Medical / First Aid Response<br />
            Channel 6: Stage & Audio Crew
          </p>

          <Button variant="secondary" size="sm" onClick={() => navigate('/overview')}>
            Back to Overview
          </Button>
        </Card>
      </div>
    </div>
  );
}
