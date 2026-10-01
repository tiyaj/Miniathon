import React from 'react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Megaphone, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AnnouncementsPlaceholder() {
  const navigate = useNavigate();

  const mockBroadcasts = [
    { id: 'BC-01', channel: 'ALL CHANNELS', message: 'Main keynote starting in 15 minutes. Prepare crowd flow at Main Stage.', time: '10:45 AM', sender: 'Operations Director' },
    { id: 'BC-02', channel: 'ZONE: ENTRY GATE', message: 'Heavy crowd surge arriving from North metro exit. Reinforce scanning lanes.', time: '10:12 AM', sender: 'Lead Coordinator' },
    { id: 'BC-03', channel: 'ROLE: SECURITY & ESCORT', message: 'VIP convoy arriving at Gate 3 at 11:15 AM. Clear south corridor.', time: '09:50 AM', sender: 'Security Lead' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <SectionHeader
        title="Broadcast & Live Announcements"
        subtitle="Targeted broadcast channels to specific zones, roles, or all active volunteers simultaneously."
        badge={
          <Badge variant="accent" size="md" icon={Megaphone}>
            Radio Channels Live
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
              Recent Field Broadcasts
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--ink-70)', margin: '4px 0 0 0' }}>
              Logged on frequency 142.85 MHz
            </p>
          </div>
          <Badge variant="healthy" size="sm">3 Transmissions</Badge>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mockBroadcasts.map((b) => (
            <div
              key={b.id}
              style={{
                padding: '16px',
                border: '1px solid var(--hairline)',
                backgroundColor: 'var(--paper-raised)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="font-mono">
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink)' }}>{b.id}</span>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', border: '1px solid var(--hairline)', backgroundColor: 'var(--paper)', color: 'var(--ink-70)' }}>
                    {b.channel}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--ink-45)' }}>{b.time}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--ink)', fontWeight: 500, fontFamily: 'var(--font-ui)' }}>
                "{b.message}"
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-45)' }} className="font-mono">
                DISPATCHED BY: {b.sender}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
          <Button variant="primary" icon={Send} onClick={() => alert('Broadcast simulated: Message queued for all active field radios.')}>
            Draft New Broadcast
          </Button>
          <Button variant="ghost" onClick={() => navigate('/')}>
            ← Back to Landing
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default AnnouncementsPlaceholder;
