import React from 'react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  GitPullRequestDraft,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AssignmentsPlaceholder() {
  const navigate = useNavigate();

  const matchingRules = [
    { rule: 'Skill Competency', desc: 'Direct match between role requirements and verified volunteer skills' },
    { rule: 'Shift Availability', desc: 'Active availability during the exact gap window' },
    { rule: 'Schedule Conflicts', desc: 'Zero overlapping commitments or double bookings' },
    { rule: 'Preferred Zone Proximity', desc: 'Prioritizes volunteers already situated or requesting this sector' },
    { rule: 'Workload Fairness', desc: 'Balances logged hours to prevent volunteer exhaustion' }
  ];

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <SectionHeader
        title="Volunteer Matching & Replacement Engine"
        subtitle="Developer D Frontend Ownership Module: Rule-based ranking and replacement workflow."
        badge={
          <Badge variant="accent" size="md" icon={GitPullRequestDraft}>
            Developer D Module
          </Badge>
        }
        action={
          <Button variant="secondary" onClick={() => navigate('/overview')}>
            Back to Command Overview
          </Button>
        }
      />

      {/* Architecture Spec Card */}
      <Card variant="glowing" padding="lg">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(99, 102, 241, 0.2)',
              color: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Deterministic Rule-Based Matching Workflow
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Transparent algorithmic ranking (No black-box AI)
            </p>
          </div>
        </div>

        {/* Workflow Diagram */}
        <div
          style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(9, 13, 24, 0.8)',
            border: '1px solid var(--border-medium)',
            marginBottom: '20px'
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-accent-cyan)', marginBottom: '8px' }}>
            Core Event Workflow:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
            <span style={{ color: '#fb7185', fontWeight: 600 }}>Volunteer Dropout</span>
            <ArrowRight size={14} color="var(--text-muted)" />
            <span style={{ color: '#fbbf24', fontWeight: 600 }}>Slot Becomes Vacant</span>
            <ArrowRight size={14} color="var(--text-muted)" />
            <span style={{ color: '#fb7185', fontWeight: 600 }}>Coverage Gap Appears</span>
            <ArrowRight size={14} color="var(--text-muted)" />
            <span style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>Eligible Replacements Ranked</span>
            <ArrowRight size={14} color="var(--text-muted)" />
            <span style={{ color: '#34d399', fontWeight: 600 }}>Coordinator Confirms</span>
            <ArrowRight size={14} color="var(--text-muted)" />
            <span style={{ color: '#34d399', fontWeight: 700 }}>Coverage Instantly Updates</span>
          </div>
        </div>

        {/* Rule Criteria List */}
        <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
          Rule-Based Ranking Criteria:
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {matchingRules.map((r, i) => (
            <div
              key={i}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                <CheckCircle2 size={14} color="#34d399" />
                {r.rule}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                {r.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Navigations */}
        <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
          <Button variant="primary" onClick={() => navigate('/volunteers')}>
            Explore Volunteers Roster
          </Button>
          <Button variant="ghost" onClick={() => navigate('/overview')}>
            View Live Coverage Stats
          </Button>
        </div>
      </Card>
    </div>
  );
}
