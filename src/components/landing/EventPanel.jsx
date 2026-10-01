import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Calendar, MapPin, Users, Activity, Clock } from 'lucide-react';
import { useRouteWipe } from './RouteWipeTransition';
import LiveDot from './primitives/LiveDot';

/**
 * EventPanel (§6.8)
 * Full-height panel sliding over the page with event details, shift timetable,
 * volunteer count, status, and direct CTA to Live Control.
 * Traps focus, closes on Escape, and locks background scroll while open.
 */
export function EventPanel({ isOpen, onClose, eventData }) {
  const panelRef = useRef(null);
  const { wipeTo } = useRouteWipe();

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  const shifts = [
    { time: '08:00 - 12:00', label: 'MORNING SHIFT', status: 'COMPLETED', count: '42 STAFF' },
    { time: '12:00 - 16:00', label: 'AFTERNOON SHIFT', status: 'ACTIVE', count: '54 STAFF', isCurrent: true },
    { time: '16:00 - 20:00', label: 'EVENING PEAK', status: 'DEPLOYING', count: '32 STAFF' },
    { time: '20:00 - 23:00', label: 'TEARDOWN & EGRESS', status: 'SCHEDULED', count: '18 STAFF' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(5, 5, 8, 0.8)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 200,
            }}
          />

          {/* Full-Height Sliding Drawer (Right-anchored) */}
          <motion.div
            ref={panelRef}
            initial={{ x: '100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'clamp(320px, 40vw, 540px)',
              height: '100vh',
              backgroundColor: '#0d0d14',
              borderLeft: '1px solid rgba(90, 60, 240, 0.35)',
              zIndex: 201,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-20px 0 60px rgba(0, 0, 0, 0.9)',
              overflowY: 'auto',
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Event Details — Techfest 2026"
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '24px 28px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div
                className="font-mono"
                style={{
                  fontSize: '0.75rem',
                  letterSpacing: '0.14em',
                  color: 'rgba(255, 255, 255, 0.6)',
                  textTransform: 'uppercase',
                }}
              >
                LIVE EVENT DOSSIER // 01
              </div>

              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                aria-label="Close event panel"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div style={{ padding: '28px', flex: 1, display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {/* Event Title & Badge */}
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '2px',
                    backgroundColor: 'rgba(245, 69, 44, 0.15)',
                    border: '1px solid rgba(245, 69, 44, 0.3)',
                    color: '#F5452C',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    marginBottom: '14px',
                  }}
                  className="font-mono"
                >
                  <LiveDot size={6} />
                  <span>LIVE ACTIVE NOW</span>
                </div>

                <h2
                  style={{
                    fontFamily: "'Archivo', 'Archivo Black', sans-serif",
                    fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
                    fontWeight: 900,
                    margin: '0 0 10px 0',
                    color: '#FFFFFF',
                    lineHeight: 1.05,
                    letterSpacing: '-0.02em',
                  }}
                >
                  TECHFEST 2026
                </h2>

                <p
                  style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.95rem',
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  Centralized command, automated shift routing, and volunteer crowd orchestration across
                  all five campus zones.
                </p>
              </div>

              {/* Key Info Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(90, 60, 240, 0.25)',
                    borderRadius: '6px',
                    padding: '14px',
                  }}
                >
                  <div style={{ color: '#818cf8', marginBottom: '6px' }}>
                    <MapPin size={16} />
                  </div>
                  <div className="font-mono" style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                    LOCATION
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF', marginTop: '4px' }}>
                    TSEC Campus, Mumbai
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(90, 60, 240, 0.25)',
                    borderRadius: '6px',
                    padding: '14px',
                  }}
                >
                  <div style={{ color: '#818cf8', marginBottom: '6px' }}>
                    <Users size={16} />
                  </div>
                  <div className="font-mono" style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                    VOLUNTEERS
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF', marginTop: '4px' }}>
                    128 On-Ground
                  </div>
                </div>
              </div>

              {/* Shift Timetable in Mono Rows */}
              <div>
                <div
                  className="font-mono"
                  style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.55)',
                    letterSpacing: '0.12em',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  SHIFT TIMETABLE // SCHEDULE
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} className="font-mono">
                  {shifts.map((shift, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '12px 14px',
                        backgroundColor: shift.isCurrent ? 'rgba(245, 69, 44, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                        border: shift.isCurrent ? '1px solid rgba(245, 69, 44, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: shift.isCurrent ? '#F5452C' : '#FFFFFF' }}>
                          {shift.label}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.45)', marginTop: '2px' }}>
                          {shift.time}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: shift.isCurrent ? '#F5452C' : 'rgba(255, 255, 255, 0.8)' }}>
                          {shift.status}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.4)' }}>
                          {shift.count}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                <button
                  onClick={() => {
                    onClose();
                    wipeTo('/dashboard');
                  }}
                  style={{
                    width: '100%',
                    backgroundColor: '#FFFFFF',
                    color: '#07070c',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '16px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    letterSpacing: '0.1em',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'background-color 0.2s ease, color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F5452C';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.color = '#07070c';
                  }}
                >
                  <span>LAUNCH LIVE CONTROL</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default EventPanel;
