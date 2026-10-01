import React, { useState, useEffect } from 'react';
import {
  Sliders,
  MapPin,
  Calendar,
  Layers,
  Shield,
  Clock,
  Plus,
  Save,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';
import { getStructure, saveEventSetup } from '../../lib/api';
import './EventSetup.css';

export function EventSetup() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [eventName, setEventName] = useState('TSEC TechFest — Main Arena');
  const [venue, setVenue] = useState('Campus Event Grounds');
  const [startDate, setStartDate] = useState('2026-10-01T08:00');
  const [endDate, setEndDate] = useState('2026-10-01T22:00');
  const [eventStatus, setEventStatus] = useState('LIVE SIMULATION');

  const [zones, setZones] = useState([]);
  const [roles, setRoles] = useState([]);
  const [shifts, setShifts] = useState([]);

  // Modals for adding items
  const [modalState, setModalState] = useState({ type: null, open: false });
  const [newZoneName, setNewZoneName] = useState('');
  const [newRoleZone, setNewRoleZone] = useState('');
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [newRoleReq, setNewRoleReq] = useState('2');
  const [newShiftName, setNewShiftName] = useState('');
  const [newShiftTime, setNewShiftTime] = useState('09:00 – 13:00');

  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true);
        const res = await getStructure();
        if (res.data) {
          const { event, zones, roles, shifts } = res.data;
          if (event) {
            setEventName(event.name);
            setVenue(event.venue);
            setEventStatus(event.status);
          }
          if (zones) setZones(zones);
          if (roles) setRoles(roles);
          if (shifts) setShifts(shifts);
        }
      } catch (err) {
        showToast('Failed to load event setup configuration', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSaveSetup = async () => {
    try {
      setSaving(true);
      const payload = {
        event: {
          name: eventName,
          venue,
          status: eventStatus,
          startDate,
          endDate
        },
        zones,
        roles,
        shifts
      };

      const res = await saveEventSetup(undefined, payload);
      if (res.data?.success) {
        showToast('Event configuration and staffing quotas saved successfully.', 'success');
      }
    } catch (err) {
      showToast('Error saving event setup', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddZone = () => {
    if (!newZoneName.trim()) return;
    const newZone = {
      id: `zone-${Date.now()}`,
      name: newZoneName.trim(),
      required: 3,
      assigned: 0,
      gaps: 3,
      status: 'warning',
      statusLabel: 'New Zone'
    };
    setZones([...zones, newZone]);
    setNewZoneName('');
    setModalState({ type: null, open: false });
    showToast(`Zone "${newZone.name}" created.`, 'success');
  };

  const handleAddRole = () => {
    if (!newRoleTitle.trim()) return;
    const newRole = {
      id: `role-${Date.now()}`,
      zone: newRoleZone || (zones[0]?.name || 'Entry Gate'),
      title: newRoleTitle.trim(),
      required: parseInt(newRoleReq, 10) || 2,
      assigned: 0
    };
    setRoles([...roles, newRole]);
    setNewRoleTitle('');
    setModalState({ type: null, open: false });
    showToast(`Role "${newRole.title}" configured for ${newRole.zone}.`, 'success');
  };

  const handleAddShift = () => {
    if (!newShiftName.trim()) return;
    const newShift = {
      id: `shift-${Date.now()}`,
      name: newShiftName.trim(),
      time: newShiftTime.trim(),
      staffed: 0,
      required: 12,
      percent: 0,
      status: 'warning',
      activeNow: false
    };
    setShifts([...shifts, newShift]);
    setNewShiftName('');
    setModalState({ type: null, open: false });
    showToast(`Shift "${newShift.name}" registered.`, 'success');
  };

  const handleDeleteZone = (zoneId) => {
    setZones(zones.filter((z) => z.id !== zoneId));
    showToast('Zone removed from configuration.', 'info');
  };

  return (
    <div className="event-setup-container animate-fade-up">
      {/* Header */}
      <SectionHeader
        title="Event Configuration & Quotas"
        subtitle="Manage boundaries, venue metadata, staffing quotas, and operational shift blocks."
        badge={
          <Badge variant="healthy" size="md" dot>
            Config Mode Active
          </Badge>
        }
        action={
          <Button
            variant="primary"
            icon={Save}
            onClick={handleSaveSetup}
            loading={saving}
          >
            {saving ? 'Saving...' : 'Save Setup'}
          </Button>
        }
      />

      {/* SECTION 1: CORE EVENT METADATA */}
      <Card variant="default" padding="lg">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={18} color="var(--color-primary-light)" />
          Event Details
        </h3>

        <div className="setup-form-grid">
          <div className="setup-field">
            <label className="setup-field-label">Event Name</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="setup-field-input"
            />
          </div>

          <div className="setup-field">
            <label className="setup-field-label">Venue Location</label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="setup-field-input"
            />
          </div>

          <div className="setup-field">
            <label className="setup-field-label">Start Time</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="setup-field-input"
            />
          </div>

          <div className="setup-field">
            <label className="setup-field-label">End Time</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="setup-field-input"
            />
          </div>

          <div className="setup-field">
            <label className="setup-field-label">Operational Mode</label>
            <select
              value={eventStatus}
              onChange={(e) => setEventStatus(e.target.value)}
              className="setup-field-input"
              style={{ background: 'rgba(20, 29, 50, 0.9)' }}
            >
              <option value="LIVE SIMULATION">LIVE SIMULATION</option>
              <option value="ON-GROUND PRODUCTION">ON-GROUND PRODUCTION</option>
              <option value="PRE-EVENT DRY RUN">PRE-EVENT DRY RUN</option>
            </select>
          </div>
        </div>
      </Card>

      {/* SECTION 2: ZONES */}
      <Card variant="default" padding="lg">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="var(--color-accent-cyan)" />
              Event Zones ({zones.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Physical campus zones monitored in real-time.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={() => setModalState({ type: 'zone', open: true })}
          >
            Add Zone
          </Button>
        </div>

        <div className="setup-zones-grid">
          {zones.map((zone) => (
            <div key={zone.id} className="setup-zone-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary-light)'
                  }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--text-primary)' }}>
                    {zone.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Quota: {zone.required} volunteers
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDeleteZone(zone.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                title="Remove Zone"
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fb7185')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* SECTION 3: ROLES & QUOTAS */}
      <Card variant="default" padding="lg">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="#34d399" />
              Role Requirements ({roles.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Staffing quotas by zone and specific operational role.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setNewRoleZone(zones[0]?.name || 'Entry Gate');
              setModalState({ type: 'role', open: true });
            }}
          >
            Add Role
          </Button>
        </div>

        <div className="setup-roles-grid">
          {roles.map((role) => (
            <div key={role.id} className="setup-role-item">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.925rem' }}>
                  {role.title}
                </span>
                <Badge variant="neutral" size="sm">
                  {role.zone}
                </Badge>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>Required Headcount:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {role.required}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* SECTION 4: SHIFTS */}
      <Card variant="default" padding="lg">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#fbbf24" />
              Operational Shift Blocks ({shifts.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Daily rotation windows for on-ground shift handovers.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={() => setModalState({ type: 'shift', open: true })}
          >
            Add Shift
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {shifts.map((shift) => (
            <div
              key={shift.id}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                {shift.name}
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--color-primary-light)', marginTop: '4px' }}>
                {shift.time}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* MODAL: ADD ZONE */}
      <Modal
        isOpen={modalState.open && modalState.type === 'zone'}
        onClose={() => setModalState({ type: null, open: false })}
        title="Add Event Zone"
        subtitle="Define a new operational zone for crowd monitoring and volunteer staffing."
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalState({ type: null, open: false })}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddZone}>
              Create Zone
            </Button>
          </>
        }
      >
        <div className="setup-field">
          <label className="setup-field-label">Zone Name</label>
          <input
            type="text"
            placeholder="e.g. VIP Concourse"
            value={newZoneName}
            onChange={(e) => setNewZoneName(e.target.value)}
            className="setup-field-input"
          />
        </div>
      </Modal>

      {/* MODAL: ADD ROLE */}
      <Modal
        isOpen={modalState.open && modalState.type === 'role'}
        onClose={() => setModalState({ type: null, open: false })}
        title="Add Volunteer Role"
        subtitle="Configure a required volunteer responsibility and staffing quota."
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalState({ type: null, open: false })}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddRole}>
              Create Role
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="setup-field">
            <label className="setup-field-label">Zone</label>
            <select
              value={newRoleZone}
              onChange={(e) => setNewRoleZone(e.target.value)}
              className="setup-field-input"
              style={{ background: 'rgba(20, 29, 50, 0.9)' }}
            >
              {zones.map((z) => (
                <option key={z.id} value={z.name}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          <div className="setup-field">
            <label className="setup-field-label">Role Title</label>
            <input
              type="text"
              placeholder="e.g. Barricade Marshal"
              value={newRoleTitle}
              onChange={(e) => setNewRoleTitle(e.target.value)}
              className="setup-field-input"
            />
          </div>

          <div className="setup-field">
            <label className="setup-field-label">Required Volunteers</label>
            <input
              type="number"
              min="1"
              max="20"
              value={newRoleReq}
              onChange={(e) => setNewRoleReq(e.target.value)}
              className="setup-field-input"
            />
          </div>
        </div>
      </Modal>

      {/* MODAL: ADD SHIFT */}
      <Modal
        isOpen={modalState.open && modalState.type === 'shift'}
        onClose={() => setModalState({ type: null, open: false })}
        title="Add Operational Shift Block"
        subtitle="Set up time boundaries for rotating volunteer crews."
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalState({ type: null, open: false })}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddShift}>
              Register Shift
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="setup-field">
            <label className="setup-field-label">Shift Name</label>
            <input
              type="text"
              placeholder="e.g. Night Shift"
              value={newShiftName}
              onChange={(e) => setNewShiftName(e.target.value)}
              className="setup-field-input"
            />
          </div>

          <div className="setup-field">
            <label className="setup-field-label">Time Window</label>
            <input
              type="text"
              placeholder="e.g. 21:00 – 01:00"
              value={newShiftTime}
              onChange={(e) => setNewShiftTime(e.target.value)}
              className="setup-field-input"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
