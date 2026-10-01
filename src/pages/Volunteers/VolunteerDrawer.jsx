import React, { useState } from 'react';
import { Drawer } from '../../components/ui/Drawer';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Avatar } from '../../components/ui/Avatar';
import { Chip } from '../../components/ui/Chip';
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
  AlertTriangle
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            {/* Contextual Actions */}
            {volunteer.status !== 'Checked In' && volunteer.status !== 'Dropout' && volunteer.status !== 'No Show' && (
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                onClick={() => onCheckIn(volunteer.id)}
              >
                CHECK IN
              </Button>
            )}

            {volunteer.status === 'Checked In' && (
              <Button
                variant="secondary"
                size="sm"
                icon={LogOut}
                onClick={() => onCheckOut(volunteer.id)}
              >
                CHECK OUT
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
                ASSIGN SLOT
              </Button>
            )}

            {volunteer.status !== 'Dropout' && (
              <Button
                variant="ghost"
                size="sm"
                icon={UserMinus}
                onClick={() => setConfirmModal({ open: true, type: 'dropout' })}
              >
                MARK DROPOUT
              </Button>
            )}

            {volunteer.status !== 'No Show' && volunteer.status !== 'Checked In' && (
              <Button
                variant="danger"
                size="sm"
                icon={UserX}
                onClick={() => setConfirmModal({ open: true, type: 'noshow' })}
              >
                MARK NO SHOW
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
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--paper-sunken)',
              border: '1px solid var(--line-strong)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <Avatar
              name={volunteer.name}
              initials={volunteer.avatar}
              size={52}
            />

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
                  {volunteer.name}
                </h4>
                <StatusBadge status={volunteer.status} size="sm" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '12px', color: 'var(--ink-2)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={13} color="var(--ink-3)" /> {volunteer.email}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={13} color="var(--ink-3)" /> {volunteer.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Operational Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div
              style={{
                padding: '14px',
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--paper-raised)',
                border: '1px solid var(--line-strong)'
              }}
            >
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>
                Assigned Zone
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="var(--vermilion)" />
                {volunteer.assignedZone || 'Not Assigned'}
              </div>
            </div>

            <div
              style={{
                padding: '14px',
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--paper-raised)',
                border: '1px solid var(--line-strong)'
              }}
            >
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>
                Assigned Role
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} color="var(--mint)" />
                {volunteer.assignedRole || 'General'}
              </div>
            </div>

            <div
              style={{
                padding: '14px',
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--paper-raised)',
                border: '1px solid var(--line-strong)'
              }}
            >
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>
                Hours Logged
              </div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)' }}>
                <Clock size={14} color="var(--amber)" />
                {volunteer.hours}h / {volunteer.maxHours}h max
              </div>
            </div>

            <div
              style={{
                padding: '14px',
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--paper-raised)',
                border: '1px solid var(--line-strong)'
              }}
            >
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>
                Preferred Zone
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginTop: '4px' }}>
                {volunteer.preferredZone || 'Flexible'}
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.12em' }}>
              Skills & Qualifications
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {volunteer.skills?.map((skill) => (
                <Chip key={skill}>{skill}</Chip>
              ))}
            </div>
          </div>

          {/* Shift Availability */}
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.12em' }}>
              Available Shift Windows
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {volunteer.availableShifts?.map((shift) => (
                <span
                  key={shift}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius)',
                    backgroundColor: 'var(--paper-raised)',
                    border: '1px solid var(--line-strong)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--ink)'
                  }}
                >
                  <Calendar size={12} color="var(--ink-2)" />
                  {shift} Shift
                </span>
              ))}
            </div>
          </div>

          {/* Attendance History */}
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.12em' }}>
              Check-in / Attendance Record
            </div>
            {volunteer.attendanceHistory && volunteer.attendanceHistory.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {volunteer.attendanceHistory.map((rec, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius)',
                      backgroundColor: 'var(--paper-sunken)',
                      border: '1px solid var(--line)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '13px'
                    }}
                  >
                    <span style={{ color: 'var(--ink)', fontWeight: 700 }}>
                      {rec.shift} Shift
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-3)' }}>
                        {rec.timestamp}
                      </span>
                      <StatusBadge status={rec.status} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: 'var(--ink-3)', fontStyle: 'italic', padding: '8px 0' }}>
                No check-in entries logged yet today.
              </div>
            )}
          </div>

          {/* Notes */}
          {volunteer.notes && (
            <div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.12em' }}>
                Coordinator Field Notes
              </div>
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius)',
                  backgroundColor: 'var(--paper-sunken)',
                  border: '1px solid var(--line)',
                  fontSize: '13px',
                  color: 'var(--ink)',
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
              CANCEL
            </Button>
            <Button variant="danger" onClick={handleConfirmDestructive}>
              {confirmModal.type === 'dropout' ? 'CONFIRM DROPOUT' : 'MARK AS NO-SHOW'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div
            style={{
              padding: '8px',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--coral-bg)',
              color: 'var(--coral)',
              border: '1px solid var(--coral)',
              flexShrink: 0
            }}
          >
            <AlertTriangle size={20} />
          </div>
          <div style={{ fontSize: '13px', color: 'var(--ink-2)', lineHeight: 1.5 }}>
            Are you sure you want to flag <strong>{volunteer.name}</strong> as{' '}
            <span style={{ color: 'var(--coral-ink)', fontWeight: 700 }}>
              {confirmModal.type === 'dropout' ? 'Dropout' : 'No Show'}
            </span>{' '}
            for the <strong>{volunteer.assignedZone || 'assigned zone'}</strong>?
            <br />
            This will decrement active on-ground coverage and alert the matching coordinator.
          </div>
        </div>
      </Modal>
    </>
  );
}

export default VolunteerDrawer;
