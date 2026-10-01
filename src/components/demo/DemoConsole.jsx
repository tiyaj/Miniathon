import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  UserX,
  RefreshCw,
  X,
  ArrowRight,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';

/**
 * DemoConsole (§11.3)
 * Toggle with Shift+D anywhere in the application.
 * Runs the two required hero flows:
 * 1. Dropout Recovery (Dropout -> Gap detected -> Candidates -> Match -> Coverage restored)
 * 2. Crowd Surge Escalation (Density 61% -> 74% -> 91% -> Surge banner -> Incident -> Actions -> Resolve)
 * 3. Reset Demo (Resets all data to initial seed)
 */
export function DemoConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFlow, setActiveFlow] = useState(null); // 'dropout' | 'surge' | null
  const [surgeState, setSurgeState] = useState(null); // { density, level, bannerVisible }
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateAssigned, setCandidateAssigned] = useState(false);
  const { showToast } = useToast();

  // Listen for Shift+D shortcut globally
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle on Shift+D (not while typing in input/textarea)
      if (
        e.shiftKey &&
        (e.key === 'D' || e.key === 'd') &&
        !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
      ) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Candidate pool for Dropout Recovery flow (§11.1)
  const candidates = [
    { name: 'Aditya Sharma', score: 94, eta: '2 min', status: 'Available', role: 'Stage Support' },
    { name: 'Neel Verma', score: 89, eta: '4 min', status: 'Available', role: 'Crowd Flow' },
    { name: 'Kabir Mehta', score: 81, eta: '7 min', status: 'Available', role: 'Runner' },
  ];

  // 1. Run Dropout Recovery Flow (§11.1)
  const handleRunDropout = () => {
    setActiveFlow('dropout');
    setSelectedCandidate(null);
    setCandidateAssigned(false);
    showToast('Dropout detected: Volunteer marked absent at Main Stage', 'error');

    // Dispatch global event for live listeners
    window.dispatchEvent(
      new CustomEvent('pulse:dropout-simulated', {
        detail: { zoneId: 'main-stage', volunteerName: 'Rohan Gupta' },
      })
    );
  };

  // Assign Replacement Candidate
  const handleAssignCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setCandidateAssigned(true);

    setTimeout(() => {
      showToast(`Replacement assigned: ${candidate.name} routed to Main Stage`, 'success');
      window.dispatchEvent(
        new CustomEvent('pulse:refresh', {
          detail: { replacement: candidate.name, zoneId: 'main-stage' },
        })
      );
      setTimeout(() => {
        setActiveFlow(null);
      }, 1600);
    }, 800);
  };

  // 2. Run Crowd Surge Escalation Flow (§11.2)
  const handleRunSurge = () => {
    setActiveFlow('surge');
    setSurgeState({ density: 61, level: 'NORMAL', bannerVisible: false });

    // Step 1: 61% -> 74% (1.2s)
    setTimeout(() => {
      setSurgeState({ density: 74, level: 'ELEVATED', bannerVisible: false });
      showToast('Crowd density elevated at Main Stage (74%)', 'warning');

      // Step 2: 74% -> 91% (after 0.8s pause)
      setTimeout(() => {
        setSurgeState({ density: 91, level: 'SURGE', bannerVisible: true });
        showToast('CRITICAL SURGE: Main Stage reached 91% capacity threshold', 'error');

        window.dispatchEvent(
          new CustomEvent('pulse:surge-simulated', {
            detail: { zone: 'Main Stage', density: 91 },
          })
        );
      }, 1400);
    }, 1200);
  };

  // Resolve Crowd Surge
  const handleResolveSurge = (actionName) => {
    showToast(`Action dispatched: ${actionName}`, 'success');
    setTimeout(() => {
      setSurgeState({ density: 68, level: 'NORMAL', bannerVisible: false });
      showToast('Crowd density normalized at Main Stage (68%)', 'success');
      setTimeout(() => {
        setActiveFlow(null);
      }, 1200);
    }, 900);
  };

  // 3. Reset Demo State
  const handleResetDemo = () => {
    setActiveFlow(null);
    setSurgeState(null);
    setSelectedCandidate(null);
    setCandidateAssigned(false);
    showToast('Demo state reset to baseline seed', 'info');
    window.dispatchEvent(new CustomEvent('pulse:refresh'));
  };

  return (
    <>
      {/* Crowd Surge Alert Banner (§11.2) */}
      <AnimatePresence>
        {surgeState?.bannerVisible && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            role="alert"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 9990,
              backgroundColor: '#ef4444',
              color: '#ffffff',
              padding: '12px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 4px 20px rgba(239, 68, 68, 0.5)',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldAlert size={20} />
              <span style={{ fontWeight: 700, letterSpacing: '0.06em' }}>
                CROWD SURGE DETECTED — MAIN STAGE DENSITY 91%
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleResolveSurge('Volunteers Redirected to Gate B')}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#ef4444',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 14px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                Redirect Volunteers
              </button>
              <button
                onClick={() => handleResolveSurge('North Turnstiles Opened')}
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '4px',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                Open Gate B
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Demo Console Modal (Shift+D) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              bottom: '30px',
              right: '30px',
              width: 'clamp(340px, 28vw, 420px)',
              backgroundColor: 'rgba(13, 17, 28, 0.92)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              borderRadius: '12px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(99, 102, 241, 0.2)',
              zIndex: 9995,
              color: '#ffffff',
              padding: '20px',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
            role="dialog"
            aria-label="PULSE Demo Console"
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                paddingBottom: '12px',
                marginBottom: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#818cf8" />
                <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>PULSE Demo Console</span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: 'rgba(255, 255, 255, 0.5)',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                  className="font-mono"
                >
                  Shift+D
                </span>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Offline Chip (§11.3) */}
            <div
              className="font-mono"
              style={{
                fontSize: '0.72rem',
                color: '#34d399',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '14px',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34d399' }} />
              <span>Offline demo data active · TSEC TechFest</span>
            </div>

            {/* Main Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              <button
                onClick={handleRunDropout}
                style={{
                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  color: '#fb7185',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserX size={16} />
                  <span>Run Dropout Recovery</span>
                </div>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={handleRunSurge}
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  color: '#fbbf24',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={16} />
                  <span>Run Crowd Surge</span>
                </div>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={handleResetDemo}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  borderRadius: '6px',
                  padding: '9px 14px',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={14} />
                <span>Reset Demo State</span>
              </button>
            </div>

            {/* Interactive Flow Panel (when Dropout is triggered) */}
            {activeFlow === 'dropout' && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: 'rgba(0, 0, 0, 0.35)',
                  borderRadius: '6px',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                }}
              >
                <div
                  className="font-mono"
                  style={{
                    fontSize: '0.75rem',
                    color: '#818cf8',
                    fontWeight: 700,
                    marginBottom: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>RECOMMENDATION ENGINE</span>
                  <span>1 GAP DETECTED</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {candidates.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => handleAssignCandidate(c)}
                      disabled={candidateAssigned}
                      style={{
                        padding: '8px 10px',
                        backgroundColor: selectedCandidate?.name === c.name ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                        border: selectedCandidate?.name === c.name ? '1px solid #34d399' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: '#ffffff',
                        fontSize: '0.78rem',
                        cursor: candidateAssigned ? 'default' : 'pointer',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div className="font-mono" style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                          {c.role} · {c.eta} away
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ color: '#34d399', fontWeight: 700 }}>{c.score}%</span>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', display: 'block' }}>Match</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default DemoConsole;
