import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { useToast } from '../../hooks/useToast';
import { useEvent } from '../../context/EventContext';
import {
  getIncidents,
  createIncident,
  acknowledgeIncident,
  escalateIncident,
  resolveIncident,
  getStructure
} from '../../lib/api';
import { ShieldAlert, Plus, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function IncidentsPlaceholder() {
  const navigate = useNavigate();
  const { selectedEventId, currentEvent } = useEvent();
  const { showToast } = useToast();

  const [incidents, setIncidents] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New Incident Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [severity, setSeverity] = useState('High');
  const [saving, setSaving] = useState(false);

  const fetchIncidents = useCallback(async () => {
    if (!selectedEventId) return;
    try {
      setLoading(true);
      setError(null);
      const [incRes, structRes] = await Promise.all([
        getIncidents(selectedEventId),
        getStructure(selectedEventId)
      ]);

      if (incRes.data) {
        setIncidents(incRes.data);
      } else if (incRes.error) {
        setError(incRes.error.message || 'Failed to load incidents');
      }

      if (structRes.data?.zones) {
        setZones(structRes.data.zones);
        if (!zoneId && structRes.data.zones.length > 0) {
          setZoneId(structRes.data.zones[0]._id || structRes.data.zones[0].id);
        }
      }
    } catch (err) {
      setError(err.message || 'Network error fetching incidents');
    } finally {
      setLoading(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    fetchIncidents();
    const handleRefresh = () => fetchIncidents();
    window.addEventListener('pulse:refresh', handleRefresh);
    window.addEventListener('pulse:event-changed', handleRefresh);
    return () => {
      window.removeEventListener('pulse:refresh', handleRefresh);
      window.removeEventListener('pulse:event-changed', handleRefresh);
    };
  }, [fetchIncidents]);

  const handleAcknowledge = async (id) => {
    const res = await acknowledgeIncident(selectedEventId, id);
    if (res.data) {
      showToast('Incident acknowledged by command center.', 'info');
      fetchIncidents();
    } else {
      showToast(res.error?.message || 'Status updated', 'info');
      fetchIncidents();
    }
  };

  const handleEscalate = async (id) => {
    const res = await escalateIncident(selectedEventId, id, { reason: 'Command center field escalation' });
    if (res.data) {
      showToast('Incident escalated to emergency protocol.', 'warning');
      fetchIncidents();
    } else {
      showToast(res.error?.message || 'Escalation noted', 'warning');
      fetchIncidents();
    }
  };

  const handleResolve = async (id) => {
    const res = await resolveIncident(selectedEventId, id, { resolutionNotes: 'Verified resolved on-ground' });
    if (res.data) {
      showToast('Incident resolved and archived.', 'success');
      fetchIncidents();
    } else {
      showToast(res.error?.message || 'Resolution updated', 'success');
      fetchIncidents();
    }
  };

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Incident title is required', 'warning');
      return;
    }

    try {
      setSaving(true);
      const res = await createIncident(selectedEventId, {
        title: title.trim(),
        description: description.trim(),
        zoneId: zoneId || (zones[0]?._id || zones[0]?.id),
        severity
      });

      if (res.data) {
        showToast('Incident ticket dispatched to on-ground commanders.', 'warning');
        setIsModalOpen(false);
        setTitle('');
        setDescription('');
        fetchIncidents();
      } else {
        showToast(res.error?.message || 'Failed to file incident', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error filing incident', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openCount = incidents.filter((i) => i.status !== 'Resolved' && i.status !== 'resolved').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <SectionHeader
        title="Incident Command & Rapid Triage"
        subtitle={`Emergency escalation, security routing, and verified field resolutions for ${currentEvent?.name || 'Current Event'}`}
        badge={
          <Badge variant="critical" size="md" icon={ShieldAlert}>
            {openCount} Open Escalations
          </Badge>
        }
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="critical" icon={Plus} onClick={() => setIsModalOpen(true)}>
              Report Incident
            </Button>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Command Overview
            </Button>
          </div>
        }
      />

      {error && (
        <ErrorBanner
          title="Incident Command Advisory"
          message={error}
          onRetry={fetchIncidents}
        />
      )}

      <Card padding="lg" style={{ border: '1px solid var(--pulse-weak)', backgroundColor: 'var(--paper)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--line)', paddingBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)', color: 'var(--coral)' }}>
              Active Incident Ledger
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--ink-2)', margin: '4px 0 0 0' }}>
              Connected to backend MongoDB incident routing service
            </p>
          </div>
          <Badge variant="critical" size="sm">Live Triage</Badge>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} width="100%" height="56px" />
            ))}
          </div>
        ) : incidents.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-2)' }}>
            No open incidents reported. All event sectors operating nominally.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {incidents.map((inc) => {
              const incId = inc._id || inc.id;
              const isResolved = inc.status === 'Resolved' || inc.status === 'resolved';
              const isCritical = inc.severity?.toLowerCase() === 'critical';
              const zoneName = inc.zone?.name || inc.zoneName || 'General Concourse';
              const timeStr = inc.createdAt ? new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently';

              return (
                <div
                  key={incId}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr 140px 100px 120px 180px',
                    alignItems: 'center',
                    padding: '14px 18px',
                    border: '1px solid var(--line)',
                    borderLeft: `4px solid ${isResolved ? 'var(--mint)' : isCritical ? 'var(--coral)' : 'var(--amber)'}`,
                    backgroundColor: isResolved ? 'var(--paper-sunken)' : 'var(--paper-raised)',
                    gap: '12px',
                    opacity: isResolved ? 0.75 : 1
                  }}
                  className="font-mono"
                >
                  <span style={{ fontWeight: 700, color: isCritical ? 'var(--coral)' : 'var(--ink-2)', fontSize: '0.8rem' }}>
                    #{String(incId).slice(-4).toUpperCase()}
                  </span>

                  <div>
                    <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, color: 'var(--ink)', fontSize: '13px' }}>
                      {inc.title}
                    </div>
                    {inc.description && (
                      <div style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'var(--font-ui)', marginTop: '2px' }}>
                        {inc.description}
                      </div>
                    )}
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--ink-2)' }}>
                    {zoneName}
                  </span>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: isCritical ? 'var(--coral)' : 'var(--amber-ink)',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}
                  >
                    {inc.severity}
                  </span>

                  <span style={{ fontSize: '0.75rem', color: 'var(--ink)' }}>
                    {inc.status} ({timeStr})
                  </span>

                  <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                    {!isResolved && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAcknowledge(incId)}
                          style={{ padding: '3px 6px', fontSize: '10px', borderRadius: '3px', border: '1px solid var(--line-strong)', backgroundColor: 'var(--paper)', cursor: 'pointer', color: 'var(--ink)' }}
                        >
                          Ack
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEscalate(incId)}
                          style={{ padding: '3px 6px', fontSize: '10px', borderRadius: '3px', border: '1px solid var(--coral)', backgroundColor: 'var(--coral-bg)', cursor: 'pointer', color: 'var(--coral-ink)' }}
                        >
                          Escalate
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolve(incId)}
                          style={{ padding: '3px 6px', fontSize: '10px', borderRadius: '3px', border: '1px solid var(--mint)', backgroundColor: 'var(--mint-bg)', cursor: 'pointer', color: 'var(--mint-ink)' }}
                        >
                          Resolve
                        </button>
                      </>
                    )}
                    {isResolved && (
                      <span style={{ fontSize: '11px', color: 'var(--mint)' }}>Resolved ✓</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modal: Report Incident */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Report Field Incident"
        subtitle="Log an incident ticket with emergency severity triage."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="critical" loading={saving} onClick={handleCreateIncident}>
              Dispatch Incident
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateIncident} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>
              Incident Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Crowd congestion at North turnstiles"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--line-strong)', backgroundColor: 'var(--paper)', color: 'var(--ink)', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>
              Zone
            </label>
            <select
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--line-strong)', backgroundColor: 'var(--paper)', color: 'var(--ink)', boxSizing: 'border-box' }}
            >
              {zones.map((z) => (
                <option key={z._id || z.id} value={z._id || z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>
              Severity
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--line-strong)', backgroundColor: 'var(--paper)', color: 'var(--ink)', boxSizing: 'border-box' }}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>
              Description
            </label>
            <textarea
              rows="2"
              placeholder="Detailed description of on-ground situation"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--line-strong)', backgroundColor: 'var(--paper)', color: 'var(--ink)', boxSizing: 'border-box' }}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default IncidentsPlaceholder;
