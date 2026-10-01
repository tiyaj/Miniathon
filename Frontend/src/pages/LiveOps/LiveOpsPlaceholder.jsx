import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { useEvent } from '../../context/EventContext';
import { getIncidents, getTasks, getAnnouncements } from '../../lib/api';
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
  const { selectedEventId, currentEvent } = useEvent();

  const [incidents, setIncidents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLiveOpsData = useCallback(async () => {
    if (!selectedEventId) return;
    try {
      setLoading(true);
      setError(null);
      const [incRes, taskRes, annRes] = await Promise.all([
        getIncidents(selectedEventId),
        getTasks(selectedEventId),
        getAnnouncements(selectedEventId)
      ]);

      if (incRes.data) setIncidents(incRes.data);
      if (taskRes.data) setTasks(taskRes.data);
      if (annRes.data) setAnnouncements(annRes.data);
    } catch (err) {
      setError(err.message || 'Error loading live operations streams');
    } finally {
      setLoading(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    fetchLiveOpsData();
    const handleRefresh = () => fetchLiveOpsData();
    window.addEventListener('pulse:refresh', handleRefresh);
    window.addEventListener('pulse:event-changed', handleRefresh);
    return () => {
      window.removeEventListener('pulse:refresh', handleRefresh);
      window.removeEventListener('pulse:event-changed', handleRefresh);
    };
  }, [fetchLiveOpsData]);

  const criticalIncidents = incidents.filter((i) => i.severity?.toLowerCase() === 'critical');
  const completedTasksCount = tasks.filter((t) => t.status === 'Completed' || t.status === 'Resolved').length;

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <SectionHeader
        title="Live Operations & Escalation Center"
        subtitle={`Real-time field telemetry, incident triage, and broadcast coordination for ${currentEvent?.name || 'Current Event'}`}
        badge={
          <Badge variant="critical" size="md" dot pulseDot icon={Radio}>
            Live Operations Active
          </Badge>
        }
        action={
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Command Overview
          </Button>
        }
      />

      {error && (
        <ErrorBanner
          title="Live Operations Feed Error"
          message={error}
          onRetry={fetchLiveOpsData}
        />
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-5)' }}>
          <Skeleton height="260px" />
          <Skeleton height="260px" />
          <Skeleton height="260px" />
        </div>
      ) : (
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
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
                  Incident Escalation Desk
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--ink-2)', margin: 0 }}>
                  {criticalIncidents.length} Critical Alert{criticalIncidents.length === 1 ? '' : 's'} Active
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', maxHeight: '160px', overflowY: 'auto' }}>
              {incidents.slice(0, 3).map((inc) => (
                <div
                  key={inc._id || inc.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--paper-sunken)',
                    border: '1px solid var(--line)',
                    borderLeft: `3px solid ${inc.severity === 'Critical' ? 'var(--coral)' : 'var(--amber)'}`,
                    fontSize: '0.85rem',
                    color: 'var(--ink)'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '12px' }}>{inc.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-3)', marginTop: '2px' }}>
                    {inc.zone?.name || inc.zoneName || 'General'} · Status: {inc.status}
                  </div>
                </div>
              ))}
            </div>

            <Button variant="critical" size="sm" onClick={() => navigate('/incidents')}>
              Open Incident Command Desk
            </Button>
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
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
                  On-Ground Task Progress
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--ink-2)', margin: 0 }}>
                  {completedTasksCount} of {tasks.length} tasks resolved
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.825rem', color: 'var(--ink-2)', marginBottom: '16px', maxHeight: '160px', overflowY: 'auto' }}>
              {tasks.slice(0, 4).map((t) => {
                const done = t.status === 'Completed' || t.status === 'Resolved';
                return (
                  <div key={t._id || t.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: done ? 'var(--mint)' : 'var(--amber)' }}>
                      {done ? '✓' : '○'}
                    </span>
                    <span style={{ textDecoration: done ? 'line-through' : 'none', color: done ? 'var(--ink-3)' : 'var(--ink)' }}>
                      {t.title}
                    </span>
                  </div>
                );
              })}
            </div>

            <Button variant="secondary" size="sm" onClick={() => navigate('/tasks')}>
              Manage Field Tasks
            </Button>
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
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
                  Volunteer Radio Broadcasts
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--ink-2)', margin: 0 }}>
                  {announcements.length} Dispatched transmissions
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', maxHeight: '160px', overflowY: 'auto' }}>
              {announcements.slice(0, 2).map((a) => (
                <div key={a._id || a.id} style={{ padding: '8px 10px', backgroundColor: 'var(--paper-sunken)', borderRadius: 'var(--radius-xs)', fontSize: '12px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--ink)' }}>"{a.message}"</div>
                  <div style={{ fontSize: '10px', color: 'var(--ink-3)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    Target: {a.audience || 'ALL'} · {a.author?.name || 'Coordinator'}
                  </div>
                </div>
              ))}
            </div>

            <Button variant="secondary" size="sm" onClick={() => navigate('/announcements')}>
              Draft Radio Broadcast
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}

export default LiveOpsPlaceholder;
