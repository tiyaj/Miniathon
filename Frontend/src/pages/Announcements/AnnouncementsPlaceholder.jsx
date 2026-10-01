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
import { getAnnouncements, createAnnouncement, getStructure } from '../../lib/api';
import { Megaphone, Send, Radio, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AnnouncementsPlaceholder() {
  const navigate = useNavigate();
  const { selectedEventId, currentEvent, user } = useEvent();
  const { showToast } = useToast();

  const [announcements, setAnnouncements] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New Broadcast Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('All');
  const [zoneId, setZoneId] = useState('');
  const [priority, setPriority] = useState('Standard');
  const [saving, setSaving] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    if (!selectedEventId) return;
    try {
      setLoading(true);
      setError(null);
      const [annRes, structRes] = await Promise.all([
        getAnnouncements(selectedEventId),
        getStructure(selectedEventId)
      ]);

      if (annRes.data) {
        setAnnouncements(annRes.data);
      } else if (annRes.error) {
        setError(annRes.error.message || 'Failed to load announcements');
      }

      if (structRes.data?.zones) {
        setZones(structRes.data.zones);
        if (!zoneId && structRes.data.zones.length > 0) {
          setZoneId(structRes.data.zones[0]._id || structRes.data.zones[0].id);
        }
      }
    } catch (err) {
      setError(err.message || 'Network error fetching announcements');
    } finally {
      setLoading(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    fetchAnnouncements();
    const handleRefresh = () => fetchAnnouncements();
    window.addEventListener('pulse:refresh', handleRefresh);
    window.addEventListener('pulse:event-changed', handleRefresh);
    return () => {
      window.removeEventListener('pulse:refresh', handleRefresh);
      window.removeEventListener('pulse:event-changed', handleRefresh);
    };
  }, [fetchAnnouncements]);

  const handleCreateBroadcast = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      showToast('Broadcast message content is required', 'warning');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        message: message.trim(),
        audience,
        priority
      };
      if (audience === 'Zone') {
        payload.zoneId = zoneId || (zones[0]?._id || zones[0]?.id);
      }

      const res = await createAnnouncement(selectedEventId, payload);
      if (res.data) {
        showToast('Broadcast transmission dispatched across all volunteer channels.', 'success');
        setIsModalOpen(false);
        setMessage('');
        fetchAnnouncements();
      } else {
        showToast(res.error?.message || 'Failed to dispatch broadcast', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error transmitting broadcast', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <SectionHeader
        title="Broadcast & Live Announcements"
        subtitle={`Targeted radio channels to specific zones, roles, or all active volunteers for ${currentEvent?.name || 'Current Event'}`}
        badge={
          <Badge variant="accent" size="md" icon={Megaphone}>
            Live Radio Channels
          </Badge>
        }
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="primary" icon={Send} onClick={() => setIsModalOpen(true)}>
              Draft New Broadcast
            </Button>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Command Overview
            </Button>
          </div>
        }
      />

      {error && (
        <ErrorBanner
          title="Radio Broadcast Advisory"
          message={error}
          onRetry={fetchAnnouncements}
        />
      )}

      <Card padding="lg" style={{ border: '1px solid var(--line-strong)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--line)', paddingBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
              Recent Field Broadcasts
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--ink-2)', margin: '4px 0 0 0' }}>
              Connected to backend MongoDB announcement logs
            </p>
          </div>
          <Badge variant="healthy" size="sm">{announcements.length} Transmissions</Badge>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} width="100%" height="80px" />
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-2)' }}>
            No radio broadcasts sent for this event yet. Click "Draft New Broadcast" to transmit an alert.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {announcements.map((b) => {
              const annId = b._id || b.id;
              const timeStr = b.createdAt ? new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently';
              const isUrgent = b.priority === 'Urgent';

              return (
                <div
                  key={annId}
                  style={{
                    padding: '16px',
                    border: '1px solid var(--line)',
                    borderLeft: `4px solid ${isUrgent ? 'var(--coral)' : 'var(--indigo)'}`,
                    backgroundColor: 'var(--paper-raised)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="font-mono">
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink-3)' }}>
                        #{String(annId).slice(-4).toUpperCase()}
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          border: '1px solid var(--line)',
                          borderRadius: '2px',
                          backgroundColor: 'var(--paper)',
                          color: 'var(--ink)',
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}
                      >
                        {b.audience || 'ALL CHANNELS'} {b.zone?.name ? `(${b.zone.name})` : ''}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--ink-3)' }}>{timeStr}</span>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--ink)', fontWeight: 500, fontFamily: 'var(--font-ui)' }}>
                    "{b.message}"
                  </p>

                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-3)' }} className="font-mono">
                    DISPATCHED BY: {b.author?.name || b.authorName || 'Lead Coordinator'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modal: Draft Broadcast */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Draft Field Broadcast"
        subtitle="Transmit a notification to on-ground volunteers and coordinators."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Send} loading={saving} onClick={handleCreateBroadcast}>
              Send Broadcast
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>
              Target Audience
            </label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--line-strong)', backgroundColor: 'var(--paper)', color: 'var(--ink)', boxSizing: 'border-box' }}
            >
              <option value="All">All Channels (Entire Event Roster)</option>
              <option value="Zone">Specific Zone</option>
              <option value="Role">Specific Role</option>
            </select>
          </div>

          {audience === 'Zone' && (
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>
                Select Zone
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
          )}

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>
              Priority Level
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--line-strong)', backgroundColor: 'var(--paper)', color: 'var(--ink)', boxSizing: 'border-box' }}
            >
              <option value="Standard">Standard</option>
              <option value="Urgent">Urgent / High Priority</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>
              Message Text *
            </label>
            <textarea
              rows="3"
              placeholder="e.g. VIP convoy arriving at Gate 3 in 15 minutes. Clear south corridor."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--line-strong)', backgroundColor: 'var(--paper)', color: 'var(--ink)', boxSizing: 'border-box' }}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AnnouncementsPlaceholder;
