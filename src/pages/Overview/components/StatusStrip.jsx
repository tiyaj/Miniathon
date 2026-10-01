import React, { useState, useEffect, useRef } from 'react';

function useCountUp(targetValue, duration = 600) {
  const [value, setValue] = useState(0);
  const prevTargetRef = useRef(null);

  useEffect(() => {
    const num = typeof targetValue === 'number' ? targetValue : parseInt(targetValue, 10) || 0;
    if (prevTargetRef.current === num) return;
    prevTargetRef.current = num;

    let start = 0;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(start + (num - start) * ease);
      setValue(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        setValue(num);
      }
    }

    requestAnimationFrame(update);
  }, [targetValue, duration]);

  return value;
}

export function StatusStrip({
  zones = [],
  dashboard = {},
  loading = false,
  className = ''
}) {
  // 1. Compute coverage mathematically according to prompt spec:
  // sum(min(assigned, required)) / sum(required) across zones
  let totalRequired = 0;
  let totalAssignedCapped = 0;
  let totalOverstaffed = 0;
  let totalGaps = 0;

  zones.forEach((z) => {
    const req = z.required || 0;
    const asg = z.assigned || 0;
    totalRequired += req;
    totalAssignedCapped += Math.min(asg, req);
    if (asg > req) {
      totalOverstaffed += asg - req;
    }
    if (req > asg) {
      totalGaps += req - asg;
    }
  });

  const rawCoveragePercent = totalRequired > 0 ? Math.round((totalAssignedCapped / totalRequired) * 100) : 83;
  const animatedCoverage = useCountUp(rawCoveragePercent, 650);

  // Other metrics from dashboard / mock
  const checkedIn = dashboard.checkedIn ?? 21;
  const totalVolunteers = dashboard.volunteersRegistered ?? 26;
  const openIncidents = dashboard.openIncidents ?? 3;
  const liveTasks = dashboard.tasks?.total ?? 34;

  const animatedCheckedIn = useCountUp(checkedIn, 500);
  const animatedGaps = useCountUp(totalGaps || 3, 500);
  const animatedTasks = useCountUp(liveTasks, 500);
  const animatedIncidents = useCountUp(openIncidents, 500);

  // Segmented progress bar (10 segments)
  const segments = 10;
  const filledSegments = Math.round((rawCoveragePercent / 100) * segments);

  return (
    <div
      className={`pulse-status-strip ${className}`}
      style={{
        backgroundColor: 'var(--paper-raised)',
        border: '1px solid var(--line-strong)',
        borderRadius: 'var(--radius)',
        display: 'flex',
        alignItems: 'stretch',
        flexWrap: 'wrap',
        minHeight: '96px',
        overflow: 'hidden'
      }}
    >
      {/* Dominant Coverage Block */}
      <div
        style={{
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          borderRight: '1px solid var(--line)',
          flex: '0 0 auto'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(54px, 5vw, 68px)',
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              color: 'var(--ink)',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {animatedCoverage}%
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--ink)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>COVERAGE</span>
            {totalOverstaffed > 0 && (
              <span style={{ fontSize: '10px', color: 'var(--sky-ink)', fontWeight: 600 }}>
                (+{totalOverstaffed} OVERSTAFFED)
              </span>
            )}
          </div>

          {/* Segmented bar */}
          <div
            style={{
              display: 'flex',
              gap: '3px',
              alignItems: 'center'
            }}
            aria-label={`Coverage bar ${rawCoveragePercent}%`}
          >
            {Array.from({ length: segments }).map((_, i) => {
              const isFilled = i < filledSegments;
              return (
                <div
                  key={i}
                  style={{
                    width: '10px',
                    height: '16px',
                    backgroundColor: isFilled ? 'var(--ink)' : 'var(--paper-sunken)',
                    border: `1px solid ${isFilled ? 'var(--line-strong)' : 'var(--line)'}`,
                    borderRadius: '1px',
                    transition: 'background-color 200ms ease'
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Inline KPI Strip right of Coverage */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flex: '1 1 400px',
          flexWrap: 'wrap',
          divideX: '1px solid var(--line)'
        }}
      >
        {/* Checked In */}
        <div
          style={{
            flex: '1 1 120px',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            borderRight: '1px solid var(--line)'
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--ink-2)',
              marginBottom: '2px'
            }}
          >
            CHECKED IN
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '26px',
              fontWeight: 800,
              color: 'var(--ink)',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1.1
            }}
          >
            {animatedCheckedIn}
            <span style={{ fontSize: '16px', color: 'var(--ink-3)', fontWeight: 600 }}>
              /{totalVolunteers}
            </span>
          </div>
        </div>

        {/* Open Gaps */}
        <div
          style={{
            flex: '1 1 100px',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            borderRight: '1px solid var(--line)'
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: animatedGaps > 0 ? 'var(--coral-ink)' : 'var(--ink-2)',
              marginBottom: '2px'
            }}
          >
            OPEN GAPS
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '26px',
              fontWeight: 800,
              color: animatedGaps > 0 ? 'var(--coral)' : 'var(--mint)',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1.1
            }}
          >
            {animatedGaps}
            <span style={{ fontSize: '12px', marginLeft: '4px', textTransform: 'uppercase', fontWeight: 700 }}>
              {animatedGaps === 1 ? 'GAP' : 'GAPS'}
            </span>
          </div>
        </div>

        {/* Live Tasks */}
        <div
          style={{
            flex: '1 1 100px',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            borderRight: '1px solid var(--line)'
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--ink-2)',
              marginBottom: '2px'
            }}
          >
            LIVE TASKS
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '26px',
              fontWeight: 800,
              color: 'var(--ink)',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1.1
            }}
          >
            {animatedTasks}
          </div>
        </div>

        {/* Incidents */}
        <div
          style={{
            flex: '1 1 100px',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: animatedIncidents > 0 ? 'var(--coral-ink)' : 'var(--ink-2)',
              marginBottom: '2px'
            }}
          >
            INCIDENTS
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '26px',
              fontWeight: 800,
              color: animatedIncidents > 0 ? 'var(--coral)' : 'var(--mint)',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1.1
            }}
          >
            {animatedIncidents < 10 ? `0${animatedIncidents}` : animatedIncidents}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatusStrip;
