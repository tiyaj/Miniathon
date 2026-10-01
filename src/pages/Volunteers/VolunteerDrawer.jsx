import React, { useState } from 'react';
import { Drawer } from '../../components/ui/Drawer';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import {
  Mail,
  Phone,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  LogOut,
  UserX,
  UserMinus,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function VolunteerDrawer({
  volunteer,
  isOpen,
  onClose,
  onCheckIn,
  onCheckOut,
  onMarkDropout,
  onMarkNoShow
}) {
  const [confirmModal, setConfirmModal] = useState({ open: false, type: null });
  const navigate = useNavigate();

  if (!volunteer) return null;

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Checked In': return 'healthy';
      case 'Assigned': return 'info';
      case 'Available': return 'accent';
      case 'Dropout': return 'warning';
      case 'No Show': return 'critical';
      case 'Checked Out': return 'neutral';
      default: return 'neutral';
    }
  };

  const handleConfirmDestructive = () => {
    if (confirmModal.type === 'dropout') {
      onMarkDropout(volunteer.id);
    } else if (confirmModal.type === 'noshow') {
      onMarkNoShow(volunteer.id);
    }
    setConfirmModal({ open: false, type: null });
  };

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title="Volunteer Profile"
        subtitle={`ID: ${volunteer.id}`}
        width="520px"
        footer={
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-end' }}>
            {/* Contextual Actions */}
            {volunteer.status !== 'Checked In' && volunteer.status !== 'Dropout' && volunteer.status !== 'No Show' && (
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                onClick={() => onCheckIn(volunteer.id)}
              >
                Check In
              </Button>
            )}

            {volunteer.status === 'Checked In' && (
              <Button
                variant="secondary"
                size="sm"
                icon={LogOut}
                onClick={() => onCheckOut(volunteer.id)}
              >
                Check Out
              </Button>
            )}

            {volunteer.status === 'Available' && (
              <Button
                variant="secondary"
                size="sm"
                icon={Sparkles}
                onClick={() => {
                  onClose();
                  navigate('/assignments');
                }}
              >
                Assign Slot
              </Button>
            )}

            {volunteer.status !== 'Dropout' && (
              <Button
                variant="ghost"
                size="sm"
                icon={UserMinus}
                onClick={() => setConfirmModal({ open: true, type: 'dropout' })}
              >
                Mark Dropout
              </Button>
            )}

            {volunteer.status !== 'No Show' && volunteer.status !== 'Checked In' && (
              <Button
                variant="danger"
                size="sm"
                icon={UserX}
                onClick={() => setConfirmModal({ open: true, type: 'noshow' })}
              >
                Mark No Show
              </Button>
            )}
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Header Card */}
          <div
            style={{
              padding: '18px',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)',
                color: '#ffffff',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)'
              }}
            >
              {volunteer.avatar || 'VO'}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {volunteer.name}
                </h4>
                <Badge variant={getStatusBadgeVariant(volunteer.status)} size="sm" dot>
                  {volunteer.status}
                </Badge>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={13} color="var(--color-primary-light)" /> {volunteer.email}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={13} color="var(--color-primary-light)" /> {volunteer.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Operational Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'rgba(15, 22, 38, 0.6)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Assigned Zone
              </div>
              <div style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="var(--color-primary-light)" />
                {volunteer.assignedZone || 'Not Assigned'}
              </div>
            </div>

            <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'rgba(15, 22, 38, 0.6)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Assigned Role
              </div>
              <div style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} color="#34d399" />
                {volunteer.assignedRole || 'General'}
              </div>
            </div>

            <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'rgba(15, 22, 38, 0.6)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Hours Logged
              </div>
              <div style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)' }}>
                <Clock size={14} color="#fbbf24" />
                {volunteer.hours}h / {volunteer.maxHours}h max
              </div>
            </div>

            <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'rgba(15, 22, 38, 0.6)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Preferred Zone
              </div>
              <div style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                {volunteer.preferredZone || 'Flexible'}
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
              Skills & Qualifications
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {volunteer.skills?.map((skill) => (
                <Badge key={skill} variant="neutral" size="sm">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Shift Availability */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
              Available Shift Windows
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {volunteer.availableShifts?.map((shift) => (
                <Badge key={shift} variant="info" size="sm" icon={Calendar}>
                  {shift} Shift
                </Badge>
              ))}
            </div>
          </div>

          {/* Attendance History */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
              Check-in / Attendance Record
            </div>
            {volunteer.attendanceHistory && volunteer.attendanceHistory.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {volunteer.attendanceHistory.map((rec, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.825rem'
                    }}
                  >
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {rec.shift} Shift
                    </span>
                    <Badge variant={getStatusBadgeVariant(rec.status)} size="sm">
                      {rec.status} at {rec.timestamp}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No check-in entries logged yet today.
              </div>
            )}
          </div>

          {/* Notes */}
          {volunteer.notes && (
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.04em' }}>
                Coordinator Field Notes
              </div>
              <div
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5
                }}
              >
                {volunteer.notes}
              </div>
            </div>
          )}
        </div>
      </Drawer>

      {/* Destructive Action Confirmation Modal */}
      <Modal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, type: null })}
        title={confirmModal.type === 'dropout' ? 'Confirm Volunteer Dropout' : 'Confirm Volunteer No-Show'}
        subtitle="This action updates zone staffing calculations and immediately triggers replacement ranking."
        maxWidth="460px"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmModal({ open: false, type: null })}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDestructive}>
              {confirmModal.type === 'dropout' ? 'Confirm Dropout' : 'Mark as No-Show'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
            <AlertTriangle size={22} />
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Are you sure you want to flag <strong>{volunteer.name}</strong> as{' '}
            {confirmModal.type === 'dropout' ? 'Dropout' : 'No Show'} for the{' '}
            <strong>{volunteer.assignedZone || 'assigned zone'}</strong>?
            <br />
            This will decrement active on-ground coverage and alert the matching coordinator.
          </div>
        </div>
      </Modal>
    </>
  );
}
