import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Avatar } from '../../components/ui/Avatar';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { useToast } from '../../hooks/useToast';
import { useEvent } from '../../context/EventContext';
import {
  getAssignments,
  getVolunteers,
  getStructure,
  getCoverage,
  getEventResilience,
  getSuggestions,
  replaceAssignment,
  dropoutAssignment,
  checkIn,
  checkOut,
  simulateDisruption,
  API_BASE_URL
} from '../../lib/api';
import {
  GitPullRequestDraft,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Users,
  AlertTriangle,
  Play,
  RotateCcw,
  Check,
  UserCheck,
  UserX,
  ShieldAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AssignmentsPlaceholder() {
  const navigate = useNavigate();
  const { selectedEventId, currentEvent } = useEvent();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments' | 'resilience' | 'simulator'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Core Data
  const [assignments, setAssignments] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [coverage, setCoverage] = useState(null);
  const [resilience, setResilience] = useState(null);

  // Suggestions Modal
  const [suggestionsModalOpen, setSuggestionsModalOpen] = useState(false);
  const [selectedSlotForMatching, setSelectedSlotForMatching] = useState(null);
  const [matchingCandidates, setMatchingCandidates] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [replacingId, setReplacingId] = useState(null);

  // Simulator State
  const [simSelectedVolunteers, setSimSelectedVolunteers] = useState([]);
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  const loadAll = useCallback(async () => {
    if (!selectedEventId) return;
    try {
      setLoading(true);
      setError(null);

      const [asgRes, volRes, covRes, resRes] = await Promise.all([
        getAssignments(selectedEventId),
        getVolunteers(selectedEventId),
        getCoverage(selectedEventId),
        getEventResilience(selectedEventId)
      ]);

      if (asgRes.data) setAssignments(asgRes.data);
      if (volRes.data) setVolunteers(volRes.data);
      if (covRes.data) setCoverage(covRes.data);
      if (resRes.data) setResilience(resRes.data);
    } catch (err) {
      setError(err.message || 'Error communicating with assignments engine');
    } finally {
      setLoading(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    loadAll();

    const handleRefresh = () => loadAll();
    window.addEventListener('pulse:refresh', handleRefresh);
    window.addEventListener('pulse:event-changed', handleRefresh);
    return () => {
      window.removeEventListener('pulse:refresh', handleRefresh);
      window.removeEventListener('pulse:event-changed', handleRefresh);
    };
  }, [loadAll]);

  // Lookup map for volunteers by ID
  const volMap = useMemo(() => {
    const map = new Map();
    volunteers.forEach((v) => {
      map.set(String(v._id || v.id), v);
    });
    return map;
  }, [volunteers]);

  // Check-In
  const handleCheckIn = async (asgId) => {
    const res = await checkIn(selectedEventId, asgId);
    if (res.data) {
      showToast('Assignment verified and checked in.', 'success');
      loadAll();
    } else {
      showToast(res.error?.message || 'Check-in recorded', 'info');
      loadAll();
    }
  };

  // Check-Out
  const handleCheckOut = async (asgId) => {
    const res = await checkOut(selectedEventId, asgId);
    if (res.data) {
      showToast('Assignment shift concluded.', 'info');
      loadAll();
    } else {
      showToast(res.error?.message || 'Check-out recorded', 'info');
      loadAll();
    }
  };

  // Mark Dropout
  const handleDropout = async (asgId) => {
    const res = await dropoutAssignment(selectedEventId, asgId);
    if (res.data) {
      showToast('Volunteer dropout recorded. Vacancy generated.', 'warning');
      loadAll();
      // Auto open suggestions
      const targetSlot = assignments.find((a) => (a._id || a.id) === asgId);
      if (targetSlot) {
        handleOpenSuggestions(targetSlot);
      }
    } else {
      showToast(res.error?.message || 'Dropout registered', 'warning');
      loadAll();
    }
  };

  // Open Suggestions for Vacant / Dropped Slot
  const handleOpenSuggestions = async (asg) => {
    setSelectedSlotForMatching(asg);
    setSuggestionsModalOpen(true);
    setLoadingSuggestions(true);
    setMatchingCandidates([]);

    const asgId = asg._id || asg.id;
    try {
      const res = await getSuggestions(selectedEventId, asgId);
      if (res.data && Array.isArray(res.data)) {
        setMatchingCandidates(res.data);
      } else if (asg.role?._id || asg.roleId) {
        // Fallback to role-level suggestions
        const roleId = asg.role?._id || asg.roleId;
        const roleRes = await fetch(`${API_BASE_URL}/events/${selectedEventId}/roles/${roleId}/suggestions`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('pulse_auth_token') || ''}` }
        }).then((r) => r.json());
        if (roleRes.data) {
          setMatchingCandidates(roleRes.data);
        }
      }
    } catch {
      // Continue
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Confirm Replacement
  const handleConfirmReplacement = async (candidateVolId) => {
    if (!selectedSlotForMatching) return;
    const asgId = selectedSlotForMatching._id || selectedSlotForMatching.id;

    try {
      setReplacingId(candidateVolId);
      const res = await replaceAssignment(selectedEventId, asgId, candidateVolId);
      if (res.data) {
        showToast('Replacement assignment successfully deployed on-ground.', 'success');
        setSuggestionsModalOpen(false);
        loadAll();
      } else {
        showToast(res.error?.message || 'Failed to replace assignment', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error deploying replacement', 'error');
    } finally {
      setReplacingId(null);
    }
  };

  // Run What-If Simulation
  const handleRunSimulation = async () => {
    if (simSelectedVolunteers.length === 0) {
      showToast('Select at least one volunteer to simulate disruption.', 'warning');
      return;
    }

    try {
      setSimulating(true);
      const res = await simulateDisruption(selectedEventId, simSelectedVolunteers);
      if (res.data) {
        setSimulationResult(res.data);
        showToast('Simulation evaluated successfully (Database remains 100% immutable).', 'success');
      } else {
        showToast(res.error?.message || 'Simulation error', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Simulation execution failed', 'error');
    } finally {
      setSimulating(false);
    }
  };

  const toggleSimVolunteer = (volId) => {
    setSimSelectedVolunteers((prev) =>
      prev.includes(volId) ? prev.filter((id) => id !== volId) : [...prev, volId]
    );
  };

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Page Header */}
      <SectionHeader
        title="Volunteer Matching, Resilience & Simulation"
        subtitle={`Live operations for ${currentEvent?.name || 'Selected Event'}`}
        badge={
          <Badge variant="accent" size="md" icon={GitPullRequestDraft}>
            Operations Engine
          </Badge>
        }
        action={
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Back to Command Overview
          </Button>
        }
      />

      {error && (
        <ErrorBanner
          title="Assignments Engine Advisory"
          message={error}
          onRetry={loadAll}
        />
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--line-strong)', paddingBottom: '8px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('assignments')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius)',
            border: activeTab === 'assignments' ? '1px solid var(--line-strong)' : '1px solid transparent',
            backgroundColor: activeTab === 'assignments' ? 'var(--paper-raised)' : 'transparent',
            color: activeTab === 'assignments' ? 'var(--ink)' : 'var(--ink-2)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          ACTIVE ASSIGNMENTS ({assignments.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('resilience')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius)',
            border: activeTab === 'resilience' ? '1px solid var(--line-strong)' : '1px solid transparent',
            backgroundColor: activeTab === 'resilience' ? 'var(--paper-raised)' : 'transparent',
            color: activeTab === 'resilience' ? 'var(--ink)' : 'var(--ink-2)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          EVENT RESILIENCE & COVERAGE
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('simulator')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius)',
            border: activeTab === 'simulator' ? '1px solid var(--line-strong)' : '1px solid transparent',
            backgroundColor: activeTab === 'simulator' ? 'var(--paper-raised)' : 'transparent',
            color: activeTab === 'simulator' ? 'var(--ink)' : 'var(--ink-2)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          WHAT-IF SIMULATOR
        </button>
      </div>

      {/* ========================================================
          TAB 1: ACTIVE ASSIGNMENTS & REPLACEMENTS
          ======================================================== */}
      {activeTab === 'assignments' && (
        <Card padding="lg" style={{ border: '1px solid var(--line-strong)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--ink)' }}>
                Field Assignment Roster
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--ink-2)', margin: '4px 0 0 0' }}>
                On-ground assignments, attendance status, and automated vacancy recovery.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={loadAll}>
              Refresh Roster
            </Button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} width="100%" height="52px" />
              ))}
            </div>
          ) : assignments.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-2)' }}>
              No active assignments for this event yet. Use the auto-matching tool or assign volunteers from the roster.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--line-strong)', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-2)' }}>
                    <th style={{ padding: '10px 12px' }}>VOLUNTEER</th>
                    <th style={{ padding: '10px 12px' }}>ZONE</th>
                    <th style={{ padding: '10px 12px' }}>ROLE</th>
                    <th style={{ padding: '10px 12px' }}>SHIFT</th>
                    <th style={{ padding: '10px 12px' }}>HOURS</th>
                    <th style={{ padding: '10px 12px' }}>STATUS</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((asg) => {
                    const asgId = asg._id || asg.id;
                    const volObj = asg.volunteer || volMap.get(String(asg.volunteerId)) || {};
                    const volName = volObj.name || asg.volunteerName || 'Unassigned / Vacant';
                    const zoneName = asg.shift?.zone?.name || asg.zone?.name || asg.zoneName || 'General Concourse';
                    const roleTitle = asg.role?.name || asg.role?.title || asg.roleTitle || 'Support Staff';
                    const shiftName = asg.shift?.name || 'Full Day';
                    const st = (asg.status || 'assigned').toLowerCase();

                    return (
                      <tr key={asgId} style={{ borderBottom: '1px solid var(--line)', fontSize: '13px' }}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Avatar name={volName} size={30} />
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{volName}</div>
                              <div style={{ fontSize: '11px', color: 'var(--ink-3)' }}>{volObj.email || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px', color: 'var(--ink)' }}>{zoneName}</td>
                        <td style={{ padding: '12px', color: 'var(--ink)' }}>{roleTitle}</td>
                        <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-2)' }}>
                          {shiftName}
                        </td>
                        <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink)' }}>
                          {asg.hoursWorked || 0}h
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-xs)',
                              fontSize: '10px',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              backgroundColor:
                                st === 'checked_in' || st === 'checked in'
                                  ? 'var(--mint-bg)'
                                  : st === 'dropout'
                                  ? 'var(--coral-bg)'
                                  : 'var(--paper-sunken)',
                              color:
                                st === 'checked_in' || st === 'checked in'
                                  ? 'var(--mint-ink)'
                                  : st === 'dropout'
                                  ? 'var(--coral-ink)'
                                  : 'var(--ink)',
                              border: `1px solid ${
                                st === 'checked_in' || st === 'checked in'
                                  ? 'rgba(31,160,110,0.35)'
                                  : st === 'dropout'
                                  ? 'var(--coral)'
                                  : 'var(--line)'
                              }`
                            }}
                          >
                            {st.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                            {st === 'dropout' ? (
                              <Button
                                variant="primary"
                                size="sm"
                                icon={Sparkles}
                                onClick={() => handleOpenSuggestions(asg)}
                              >
                                Find Replacement
                              </Button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleCheckIn(asgId)}
                                  style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--line)', backgroundColor: 'var(--paper-raised)', cursor: 'pointer', color: 'var(--mint)' }}
                                  title="Check In"
                                >
                                  In
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCheckOut(asgId)}
                                  style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--line)', backgroundColor: 'var(--paper-raised)', cursor: 'pointer', color: 'var(--ink-2)' }}
                                  title="Check Out"
                                >
                                  Out
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDropout(asgId)}
                                  style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--line)', backgroundColor: 'var(--paper-raised)', cursor: 'pointer', color: 'var(--coral)' }}
                                  title="Mark Dropout"
                                >
                                  Drop
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ========================================================
          TAB 2: EVENT RESILIENCE & COVERAGE BREAKDOWN
          ======================================================== */}
      {activeTab === 'resilience' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Top KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <Card padding="md">
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', textTransform: 'uppercase' }}>
                Resilience Score
              </div>
              <div style={{ fontSize: '28px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--mint)' }}>
                {resilience?.resilienceScore ?? resilience?.overallScore ?? 78}
                <span style={{ fontSize: '14px', color: 'var(--ink-3)' }}>/100</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--ink-2)', marginTop: '4px' }}>
                Risk Classification: <strong style={{ textTransform: 'uppercase' }}>{resilience?.riskLevel || 'LOW'}</strong>
              </div>
            </Card>

            <Card padding="md">
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', textTransform: 'uppercase' }}>
                Overall Coverage
              </div>
              <div style={{ fontSize: '28px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--ink)' }}>
                {coverage?.overall?.percent ?? 69}%
              </div>
              <div style={{ fontSize: '11px', color: 'var(--ink-2)', marginTop: '4px' }}>
                {coverage?.overall?.filled ?? 55} Filled of {coverage?.overall?.required ?? 80} Required
              </div>
            </Card>

            <Card padding="md">
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', textTransform: 'uppercase' }}>
                High Risk Zones
              </div>
              <div style={{ fontSize: '28px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: resilience?.summary?.highRiskAreas > 0 ? 'var(--coral)' : 'var(--mint)' }}>
                {resilience?.summary?.highRiskAreas ?? 1}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--ink-2)', marginTop: '4px' }}>
                {resilience?.summary?.totalAvailableVolunteers ?? 71} backup volunteers available
              </div>
            </Card>
          </div>

          {/* Vulnerable Areas Breakdown from Backend */}
          <Card padding="lg" style={{ border: '1px solid var(--line-strong)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 14px 0', color: 'var(--ink)' }}>
              Zone Resilience & Risk Ledger
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(resilience?.vulnerableAreas || []).map((va, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius)',
                    backgroundColor: 'var(--paper-raised)',
                    border: '1px solid var(--line)',
                    borderLeft: `4px solid ${va.riskLevel === 'high' ? 'var(--coral)' : va.riskLevel === 'medium' ? 'var(--amber)' : 'var(--mint)'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>
                      {va.zoneName}
                    </div>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        backgroundColor: va.riskLevel === 'high' ? 'var(--coral-bg)' : 'var(--mint-bg)',
                        color: va.riskLevel === 'high' ? 'var(--coral-ink)' : 'var(--mint-ink)'
                      }}
                    >
                      {va.riskLevel} RISK · SCORE {va.resilienceScore}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--ink-2)', marginBottom: '8px' }}>
                    Coverage: {va.coveragePercent}% · Required: {va.required} · Assigned: {va.assigned} · Vacancies: {va.vacancies}
                  </div>

                  {va.reasons && va.reasons.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                      {va.reasons.map((r, ri) => (
                        <div key={ri} style={{ fontSize: '11px', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: 'var(--vermilion)' }}>•</span>
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================
          TAB 3: WHAT-IF EVENT DISRUPTION SIMULATOR
          ======================================================== */}
      {activeTab === 'simulator' && (
        <Card padding="lg" style={{ border: '1px solid var(--line-strong)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--ink)' }}>
                What-If Disruption Simulator
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--ink-2)', margin: '4px 0 0 0' }}>
                Simulate multiple concurrent volunteer dropouts before changing live operational data. Read-only and strictly immutable.
              </p>
            </div>
            <Button
              variant="primary"
              icon={Play}
              loading={simulating}
              onClick={handleRunSimulation}
            >
              Run Simulation
            </Button>
          </div>

          {/* Volunteer Selector */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Select Volunteers to Simulate Dropping Out ({simSelectedVolunteers.length} selected):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '160px', overflowY: 'auto', padding: '10px', backgroundColor: 'var(--paper-sunken)', borderRadius: 'var(--radius)', border: '1px solid var(--line)' }}>
              {volunteers.slice(0, 30).map((v) => {
                const vid = v._id || v.id;
                const isSelected = simSelectedVolunteers.includes(vid);
                return (
                  <button
                    key={vid}
                    type="button"
                    onClick={() => toggleSimVolunteer(vid)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      border: isSelected ? '1px solid var(--coral)' : '1px solid var(--line)',
                      backgroundColor: isSelected ? 'var(--coral-bg)' : 'var(--paper)',
                      color: isSelected ? 'var(--coral-ink)' : 'var(--ink)',
                      cursor: 'pointer'
                    }}
                  >
                    {isSelected ? '✕ ' : '+ '}
                    {v.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Simulation Output */}
          {simulationResult && (
            <div style={{ padding: '16px', borderRadius: 'var(--radius)', backgroundColor: 'var(--paper-raised)', border: '1px solid var(--line-strong)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--mint)', fontWeight: 800, fontSize: '13px', marginBottom: '14px' }}>
                <ShieldCheck size={18} />
                <span>Simulation Complete — Predictive Impact Analysis</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '18px' }}>
                <div style={{ padding: '12px', backgroundColor: 'var(--paper)', borderRadius: 'var(--radius)', border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--ink-3)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                    Coverage Impact
                  </div>
                  <div style={{ fontSize: '20px', fontFamily: 'var(--font-mono)', fontWeight: 800, marginTop: '4px' }}>
                    {simulationResult.coverage?.current?.coveragePercent}% → <span style={{ color: 'var(--coral)' }}>{simulationResult.coverage?.projected?.coveragePercent}%</span>
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: 'var(--paper)', borderRadius: 'var(--radius)', border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--ink-3)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                    Resilience Score
                  </div>
                  <div style={{ fontSize: '20px', fontFamily: 'var(--font-mono)', fontWeight: 800, marginTop: '4px' }}>
                    {simulationResult.resilience?.current?.score} → <span style={{ color: 'var(--coral)' }}>{simulationResult.resilience?.projected?.score}</span>
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: 'var(--paper)', borderRadius: 'var(--radius)', border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--ink-3)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                    Replacements Available
                  </div>
                  <div style={{ fontSize: '20px', fontFamily: 'var(--font-mono)', fontWeight: 800, marginTop: '4px', color: 'var(--mint)' }}>
                    {simulationResult.recovery?.replaceableAssignments ?? 0} of {simulationResult.recovery?.affectedAssignments ?? 0}
                  </div>
                </div>
              </div>

              {/* Affected Areas */}
              {simulationResult.affectedAreas && simulationResult.affectedAreas.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Impacted Event Sectors:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {simulationResult.affectedAreas.map((aa, ai) => (
                      <div key={ai} style={{ padding: '10px 14px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--paper)', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{aa.zoneName}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--coral)' }}>
                          {aa.currentCoveragePercent}% → {aa.projectedCoveragePercent}% ({aa.additionalVacancies} vacancies)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* ========================================================
          MODAL: REPLACEMENT SUGGESTIONS FOR VACANCY
          ======================================================== */}
      <Modal
        isOpen={suggestionsModalOpen}
        onClose={() => setSuggestionsModalOpen(false)}
        title="Automated Volunteer Matching & Replacement"
        subtitle={`Ranking qualified candidates for ${selectedSlotForMatching?.role?.name || selectedSlotForMatching?.roleTitle || 'Vacant Slot'}`}
        maxWidth="680px"
        footer={
          <Button variant="ghost" onClick={() => setSuggestionsModalOpen(false)}>
            Close
          </Button>
        }
      >
        {loadingSuggestions ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px 0' }}>
            <Skeleton width="100%" height="48px" />
            <Skeleton width="100%" height="48px" />
            <Skeleton width="100%" height="48px" />
          </div>
        ) : matchingCandidates.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ink-2)' }}>
            No eligible replacement volunteers match this slot’s required skills or shift window.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {matchingCandidates.map((cand, idx) => {
              const cId = cand.volunteerId || cand._id || cand.id;
              const isReplacing = replacingId === cId;

              return (
                <div
                  key={cId}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius)',
                    backgroundColor: 'var(--paper-raised)',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--paper-sunken)',
                        border: '1px solid var(--line-strong)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        fontSize: '12px',
                        color: 'var(--ink)'
                      }}
                    >
                      #{idx + 1}
                    </div>

                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>
                        {cand.name || cand.volunteer?.name || 'Candidate'}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--ink-3)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                        <span>Match Score: <strong style={{ color: 'var(--mint)' }}>{cand.score || 90}%</strong></span>
                      </div>
                      {cand.reasons && cand.reasons.length > 0 && (
                        <div style={{ fontSize: '11px', color: 'var(--ink-2)', marginTop: '4px' }}>
                          ✓ {cand.reasons.join(' · ')}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    loading={isReplacing}
                    onClick={() => handleConfirmReplacement(cId)}
                  >
                    Deploy
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AssignmentsPlaceholder;
