import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, AlertTriangle, Radio, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export function NeedsAttentionPanel({
  zones = [],
  incidents = [],
  selectedZoneId = null,
  className = '',
  style = {}
}) {
  const navigate = useNavigate();

  // 1. Synthesize items: zone gaps first, then incidents
  const attentionItems = [];

  // Zone gaps
  zones.forEach((z) => {
    const gaps = Math.max(0, (z.required || 0) - (z.assigned || 0));
    if (gaps > 0) {
      attentionItems.push({
        id: `gap-${z.id}`,
        zoneId: z.id,
        type: 'gap',
        severity: gaps >= 2 ? 'critical' : 'warning',
        title: `${z.name} — ${gaps} volunteer${gaps > 1 ? 's' : ''} short`,
        zoneName: z.name,
        time: 'Live Deficit',
        actionLabel: 'FIND REPLACEMENT',
        route: '/assignments'
      });
    }
  });

  // Open incidents
  (incidents || []).forEach((inc) => {
    attentionItems.push({
      id: inc.id || `inc-${Math.random()}`,
      zoneId: inc.zoneId,
      type: 'incident',
      severity: inc.severity === 'critical' ? 'critical' : 'warning',
      title: inc.title || 'Operational incident reported',
      zoneName: inc.zone || 'Main Concourse',
      time: inc.timestamp || 'Just now',
      actionLabel: 'OPEN INCIDENT',
      route: '/incidents'
    });
  });

  // Sort by severity (critical first)
  attentionItems.sort((a, b) => {
    if (a.severity === 'critical' && b.severity !== 'critical') return -1;
    if (b.severity === 'critical' && a.severity !== 'critical') return 1;
    return 0;
  });

  return (
    <div
      className={`pulse-attention-panel ${className}`}
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
      {/* Panel Header */}
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
            NEEDS ATTENTION
          </span>
          {attentionItems.length > 0 && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 6px',
                backgroundColor: 'var(--coral-bg)',
                color: 'var(--coral-ink)',
                border: '1px solid var(--coral)',
                borderRadius: 'var(--radius)'
              }}
            >
              {attentionItems.length}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate('/assignments')}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--ink-2)',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          VIEW ALL ›
        </button>
      </div>

      {/* Item List (rows >= 56px, scrollable internally) */}
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: '230px' }}>
        {attentionItems.length === 0 ? (
          <div
            style={{
              padding: '24px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: 'var(--ink-2)',
              gap: '8px'
            }}
          >
            <CheckCircle2 size={24} color="var(--mint)" aria-hidden="true" />
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--ink)' }}>
              All zones covered ✓
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-3)' }}>
              No critical staffing deficits or incidents requiring intervention.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {attentionItems.map((item, idx) => {
              const isSelected = selectedZoneId && item.zoneId === selectedZoneId;
              const isCritical = item.severity === 'critical';

              return (
                <div
                  key={item.id}
                  style={{
                    minHeight: '56px',
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    borderBottom: idx < attentionItems.length - 1 ? '1px solid var(--line)' : 'none',
                    backgroundColor: isSelected
                      ? 'var(--paper-sunken)'
                      : idx % 2 === 0
                      ? 'transparent'
                      : 'rgba(234, 230, 219, 0.3)',
                    borderLeft: isSelected
                      ? '3px solid var(--vermilion)'
                      : isCritical
                      ? '3px solid var(--coral)'
                      : '3px solid var(--amber)',
                    transition: 'background-color var(--dur-fast) var(--ease-out)'
                  }}
                >
                  {/* Left: Dot + Title + Meta */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: isCritical ? 'var(--coral)' : 'var(--amber)',
                        flexShrink: 0
                      }}
                      aria-hidden="true"
                    />

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: 'var(--ink)',
                          lineHeight: 1.2,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {item.title}
                      </div>

                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          color: 'var(--ink-3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginTop: '2px'
                        }}
                      >
                        <span>{item.zoneName}</span>
                        <span>·</span>
                        <span>{item.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Primary action button */}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(item.route)}
                    style={{
                      height: '32px',
                      padding: '0 10px',
                      fontSize: '10px',
                      letterSpacing: '0.1em'
                    }}
                  >
                    <span>{item.actionLabel}</span>
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default NeedsAttentionPanel;
