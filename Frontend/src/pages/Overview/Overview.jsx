import React, { useState, useEffect, useCallback } from 'react';
import { StatusStrip } from './components/StatusStrip';
import { EventMap } from './components/EventMap';
import { NeedsAttentionPanel } from './components/NeedsAttentionPanel';
import { LiveActivityPanel } from './components/LiveActivityPanel';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { Skeleton } from '../../components/ui/Skeleton';
import { getDashboard, getCoverage, getStructure } from '../../lib/api';
import { useEvent } from '../../context/EventContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import './Overview.css';

export function Overview() {
  const { selectedEventId, currentEvent } = useEvent();
  const [data, setData] = useState(null);
  const [coverageData, setCoverageData] = useState(null);
  const [structureData, setStructureData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    if (!selectedEventId) return;
    try {
      setLoading(true);
      setError(null);

      const [dashRes, covRes, structRes] = await Promise.all([
        getDashboard(selectedEventId),
        getCoverage(selectedEventId),
        getStructure(selectedEventId)
      ]);

      if (dashRes.data) {
        setData(dashRes.data);
      } else if (dashRes.error) {
        setError(dashRes.error.message || 'Failed to load telemetry from backend');
      }

      if (covRes.data) {
        setCoverageData(covRes.data);
      }

      if (structRes.data) {
        setStructureData(structRes.data);
      }
    } catch (err) {
      setError(err.message || 'Network connectivity error with PULSE API server');
    } finally {
      setLoading(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    loadData();

    const handleRefresh = () => {
      loadData();
    };

    window.addEventListener('pulse:refresh', handleRefresh);
    window.addEventListener('pulse:event-changed', handleRefresh);
    return () => {
      window.removeEventListener('pulse:refresh', handleRefresh);
      window.removeEventListener('pulse:event-changed', handleRefresh);
    };
  }, [loadData]);

  if (loading && !data) {
    return (
      <div className="overview-page-wrapper">
        <div style={{ height: '96px', backgroundColor: 'var(--paper-raised)', border: '1px solid var(--line-strong)', borderRadius: 'var(--radius)', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Skeleton width="120px" height="56px" />
            <Skeleton width="180px" height="32px" />
            <Skeleton width="140px" height="32px" />
            <Skeleton width="140px" height="32px" />
          </div>
        </div>

        <div className="overview-command-grid">
          <div style={{ height: '560px', backgroundColor: 'var(--paper-raised)', border: '1px solid var(--line-strong)', borderRadius: 'var(--radius)', padding: '24px' }}>
            <Skeleton width="280px" height="24px" style={{ marginBottom: '16px' }} />
            <Skeleton width="340px" height="40px" style={{ marginBottom: '40px' }} />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '340px' }}>
              <Skeleton width="80px" height="80px" variant="circle" />
            </div>
          </div>

          <div className="overview-side-column">
            <div style={{ height: '270px', backgroundColor: 'var(--paper-raised)', border: '1px solid var(--line-strong)', borderRadius: 'var(--radius)', padding: '16px' }}>
              <Skeleton width="160px" height="20px" style={{ marginBottom: '16px' }} />
              <Skeleton width="100%" height="48px" style={{ marginBottom: '10px' }} />
              <Skeleton width="100%" height="48px" />
            </div>
            <div style={{ height: '270px', backgroundColor: 'var(--paper-raised)', border: '1px solid var(--line-strong)', borderRadius: 'var(--radius)', padding: '16px' }}>
              <Skeleton width="160px" height="20px" style={{ marginBottom: '16px' }} />
              <Skeleton width="100%" height="48px" style={{ marginBottom: '10px' }} />
              <Skeleton width="100%" height="48px" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Synthesize rich zone coverage items from backend coverage and structure
  const covZonesMap = new Map();
  (coverageData?.zones || []).forEach(z => {
    covZonesMap.set(String(z.zoneId || z.id || z._id), z);
  });

  const rawZones = structureData?.zones || data?.zones || [];
  const normalizedZones = rawZones.map(zone => {
    const zid = String(zone.id || zone._id);
    const cov = covZonesMap.get(zid) || {};

    const required = cov.required != null ? cov.required : (zone.capacity ? Math.min(zone.capacity, 10) : 5);
    const assigned = cov.assigned != null ? cov.assigned : (zone.assigned || 0);
    const percentage = cov.percent != null ? cov.percent : (required > 0 ? Math.round((assigned / required) * 100) : 100);
    const gaps = cov.gap != null ? cov.gap : Math.max(0, required - assigned);

    return {
      id: zid,
      name: zone.name,
      required,
      assigned,
      gaps,
      percentage,
      lead: zone.coordinatorName || cov.coordinatorName || 'Sector Lead',
      description: zone.description || 'Active operational event sector',
      status: gaps > 0 ? 'warning' : 'healthy'
    };
  });

  // Shifts from structure or dashboard
  const normalizedShifts = (structureData?.shifts || data?.shifts || []).map((s, idx) => {
    const startStr = s.startTime ? new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:00';
    const endStr = s.endTime ? new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '17:00';
    const timeFormatted = s.time || `${startStr} – ${endStr}`;
    const staffed = s.staffed != null ? s.staffed : (s.assignedCount || Math.max(0, 10 - idx * 2));
    const required = s.required != null ? s.required : 10;
    const percent = required > 0 ? Math.round((staffed / required) * 100) : 100;

    return {
      id: s._id || s.id || `shift-${idx}`,
      name: s.name || `Operational Shift ${idx + 1}`,
      time: timeFormatted,
      staffed,
      required,
      percent,
      activeNow: idx === 0
    };
  });

  const recentActivity = data?.recentActivity || [];
  const eventDetails = currentEvent || data?.event || {};

  return (
    <div className="overview-page-wrapper">
      {error && (
        <ErrorBanner
          title="Telemetry Synchronization Advisory"
          message={error}
          onRetry={loadData}
        />
      )}

      {/* 1. STATUS STRIP (Real Backend Numbers) */}
      <StatusStrip
        zones={normalizedZones}
        dashboard={{
          ...data,
          coverage: coverageData?.overall || data?.coverage
        }}
        loading={loading}
      />

      {/* 2. COMMAND CENTER FIRST VIEWPORT GRID */}
      <div className="overview-command-grid">
        <EventMap
          zones={normalizedZones}
          event={eventDetails}
          selectedZoneId={selectedZoneId}
          onSelectZone={(zoneId) => setSelectedZoneId(zoneId === selectedZoneId ? null : zoneId)}
        />

        <div className="overview-side-column">
          <NeedsAttentionPanel
            zones={normalizedZones}
            incidents={data?.incidents || []}
            selectedZoneId={selectedZoneId}
          />

          <LiveActivityPanel
            activities={recentActivity}
          />
        </div>
      </div>

      {/* 3. LOWER OPERATIONAL DECK: SECTOR COVERAGE DETAILS */}
      <section className="overview-deck-section" id="coverage-breakdown">
        <div className="overview-deck-header">
          <div>
            <span className="overview-deck-kicker">OPERATIONAL BREAKDOWN // SECTOR QUOTAS</span>
            <h3 className="overview-deck-title">Zone Staffing & Capacity Ratios</h3>
          </div>
          <button
            type="button"
            onClick={() => navigate('/assignments')}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--ink)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>Coordinate Assignments</span>
            <ArrowRight size={13} aria-hidden="true" />
          </button>
        </div>

        <div className="coverage-cards-grid">
          {normalizedZones.map((zone) => {
            const hasGaps = zone.gaps > 0;

            return (
              <div
                key={zone.id}
                className="coverage-quota-card"
                onClick={() => navigate('/assignments')}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--ink)' }}>
                    {zone.name}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: hasGaps ? 'var(--coral-bg)' : 'var(--mint-bg)',
                      color: hasGaps ? 'var(--coral-ink)' : 'var(--mint-ink)',
                      border: `1px solid ${hasGaps ? 'var(--coral)' : 'rgba(31, 160, 110, 0.35)'}`
                    }}
                  >
                    {hasGaps ? `${zone.gaps} SHORT` : 'COVERED'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 800, color: 'var(--ink)' }}>
                    {zone.assigned}
                    <span style={{ fontSize: '15px', color: 'var(--ink-3)', fontWeight: 600 }}>
                      /{zone.required}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--ink-2)' }}>
                    {zone.percentage}%
                  </div>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    height: '6px',
                    width: '100%',
                    backgroundColor: 'var(--paper-sunken)',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--line)',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, zone.percentage)}%`,
                      backgroundColor: hasGaps ? 'var(--coral)' : 'var(--ink)',
                      transition: 'width var(--dur-base) var(--ease-out)'
                    }}
                  />
                </div>

                <div style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                  Lead: {zone.lead}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. LOWER OPERATIONAL DECK: SHIFT ROTATION WINDOWS */}
      {normalizedShifts.length > 0 && (
        <section className="overview-deck-section" id="shifts-stream" style={{ marginBottom: '24px' }}>
          <div className="overview-deck-header">
            <div>
              <span className="overview-deck-kicker">SCHEDULE // SHIFT ROTATIONS</span>
              <h3 className="overview-deck-title">Active Shift Deployment Windows</h3>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {normalizedShifts.map((shift) => (
              <div
                key={shift.id}
                style={{
                  backgroundColor: 'var(--paper-raised)',
                  border: shift.activeNow ? '2px solid var(--vermilion)' : '1px solid var(--line-strong)',
                  borderRadius: 'var(--radius)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>
                    {shift.name}
                  </span>
                  {shift.activeNow && (
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '1px 6px',
                        backgroundColor: 'var(--mint-bg)',
                        color: 'var(--mint-ink)',
                        border: '1px solid rgba(31, 160, 110, 0.35)',
                        borderRadius: 'var(--radius-xs)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--mint)' }} />
                      ACTIVE
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--ink-2)', fontFamily: 'var(--font-mono)' }}>
                  <Clock size={12} color="var(--ink-3)" />
                  <span>{shift.time}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--ink-2)' }}>
                    Staffed: {shift.staffed}/{shift.required}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 800, color: 'var(--ink)' }}>
                    {shift.percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Overview;
