import React from 'react';
import { UserCheck, UserMinus, Sparkles, Radio, CheckCircle2 } from 'lucide-react';

export function LiveActivityPanel({
  activities = [],
  className = '',
  style = {}
}) {
  const categoryConfig = {
    checkin: {
      color: 'var(--mint)',
      dotColor: 'var(--mint)',
      icon: UserCheck
    },
    dropout: {
      color: 'var(--amber)',
      dotColor: 'var(--amber)',
      icon: UserMinus
    },
    replacement: {
      color: 'var(--indigo)',
      dotColor: 'var(--indigo)',
      icon: Sparkles
    },
    incident: {
      color: 'var(--coral)',
      dotColor: 'var(--coral)',
      icon: Radio
    },
    task: {
      color: 'var(--sky)',
      dotColor: 'var(--sky)',
      icon: CheckCircle2
    }
  };

  const displayedActivities = (activities || []).slice(0, 8);

  return (
    <div
      className={`pulse-live-activity-panel ${className}`}
      style={{
        backgroundColor: 'var(--paper-raised)',
        border: '1px solid var(--line-strong)',
        borderRadius: 'var(--radius)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: '270px',
        ...style
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--paper-raised)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--ink)'
            }}
          >
            LIVE ACTIVITY
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 700,
              padding: '1px 6px',
              backgroundColor: 'var(--mint-bg)',
              color: 'var(--mint-ink)',
              border: '1px solid rgba(31, 160, 110, 0.35)',
              borderRadius: 'var(--radius)'
            }}
          >
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                backgroundColor: 'var(--mint)'
              }}
              aria-hidden="true"
            />
            STREAMING
          </span>
        </div>
      </div>

      {/* Timeline Stream */}
      <div
        aria-live="polite"
        style={{
          flex: 1,
          overflowY: 'auto',
          maxHeight: '230px',
          padding: '14px 18px'
        }}
      >
        {displayedActivities.length === 0 ? (
          <div
            style={{
              padding: '24px 0',
              textAlign: 'center',
              color: 'var(--ink-3)',
              fontSize: '12px'
            }}
          >
            Awaiting real-time on-ground telemetry events...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {displayedActivities.map((act, idx) => {
              const cfg = categoryConfig[act.category] || categoryConfig.checkin;
              const isLast = idx === displayedActivities.length - 1;

              return (
                <div
                  key={act.id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    position: 'relative',
                    paddingBottom: isLast ? '0' : '14px',
                    animation: 'slideInTop 300ms var(--ease-out) forwards'
                  }}
                >
                  {/* Stem line connector */}
                  {!isLast && (
                    <div
                      style={{
                        position: 'absolute',
                        left: '4px',
                        top: '12px',
                        bottom: '0',
                        width: '1px',
                        backgroundColor: 'var(--line)'
                      }}
                      aria-hidden="true"
                    />
                  )}

                  {/* Dot */}
                  <span
                    style={{
                      width: '9px',
                      height: '9px',
                      borderRadius: '50%',
                      backgroundColor: cfg.dotColor,
                      boxShadow: `0 0 6px ${cfg.dotColor}`,
                      marginTop: '3px',
                      flexShrink: 0,
                      position: 'relative',
                      zIndex: 2
                    }}
                    aria-hidden="true"
                  />

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '13px',
                        color: 'var(--ink)',
                        lineHeight: 1.3,
                        fontWeight: 600
                      }}
                    >
                      {act.text}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '3px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: 'var(--ink-3)'
                      }}
                    >
                      <span>{act.time}</span>
                      {act.zone && (
                        <>
                          <span>·</span>
                          <span style={{ color: 'var(--ink-2)' }}>{act.zone}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default LiveActivityPanel;
