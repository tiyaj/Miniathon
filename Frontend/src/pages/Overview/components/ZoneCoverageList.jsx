import React from 'react';
import { Card } from '../../../components/ui/Card';
import { CoverageBar } from '../../../components/ui/CoverageBar';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { Badge } from '../../../components/ui/Badge';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ZoneCoverageList({ zones = [] }) {
  const navigate = useNavigate();

  return (
    <Card variant="default" padding="lg">
      <SectionHeader
        title="Zone Coverage & Staffing Balance"
        subtitle="Live ratio of on-ground personnel versus designated security & support quotas."
        badge={
          <Badge variant="accent" size="sm" icon={ShieldCheck}>
            5 Active Zones
          </Badge>
        }
        action={
          <button
            onClick={() => navigate('/assignments')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary-light)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            Adjust Staffing <ArrowRight size={14} />
          </button>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {zones.map((zone) => (
          <CoverageBar
            key={zone.id}
            zoneName={zone.name}
            assigned={zone.assigned}
            required={zone.required}
            gaps={zone.gaps}
            overstaffed={zone.overstaffed}
            status={zone.status}
            onClick={() => navigate('/assignments')}
          />
        ))}
      </div>
    </Card>
  );
}
