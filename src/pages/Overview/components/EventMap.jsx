import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowUpRight, UserPlus, Sliders } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export function EventMap({
  zones = [],
  event = {},
  selectedZoneId = null,
  onSelectZone = () => {},
  className = '',
  style = {}
}) {
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const [dimensions, setDimensions] = useState({ width: 800, height: 560 });
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [activePopoverNodeId, setActivePopoverNodeId] = useState(null);

  // ResizeObserver to measure map container accurately
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Handle ESC key to dismiss popovers
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setActivePopoverNodeId(null);
        setHoveredNodeId(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isStackedMobile = dimensions.width < 760;

  // Enriched zone nodes with status semantics
  const enrichedZones = useMemo(() => {
    if (!zones || zones.length === 0) return [];

    return zones.map((zone, idx) => {
      const assigned = zone.assigned ?? 0;
      const required = zone.required ?? 0;
      const gaps = Math.max(0, required - assigned);
      const isOverstaffed = assigned > required;

      let statusType = 'healthy';
      let statusLine = `${assigned}/${required} Staffed (Optimal)`;
      let statusColor = 'var(--on-navy-mint)';
      let glowColor = 'transparent';

      if (gaps >= 2) {
        statusType = 'critical';
        statusLine = `${gaps} Volunteer Gaps`;
        statusColor = 'var(--on-navy-coral)';
        glowColor = 'rgba(255, 122, 107, 0.28)';
      } else if (gaps === 1) {
        statusType = 'warning';
        statusLine = '1 Volunteer Gap';
        statusColor = 'var(--on-navy-amber)';
        glowColor = 'rgba(255, 184, 77, 0.2)';
      } else if (isOverstaffed) {
        statusType = 'overstaffed';
        statusLine = `+${assigned - required} Overstaffed`;
        statusColor = 'var(--on-navy-sky)';
      } else if (zone.name?.toLowerCase().includes('aid')) {
        statusType = 'healthy';
        statusLine = `${assigned}/${required} Emergency Ready`;
        statusColor = 'var(--on-navy-mint)';
      }

      return {
        ...zone,
        assigned,
        required,
        gaps,
        statusType,
        statusLine,
        statusColor,
        glowColor,
        lead: zone.lead || 'Sector Lead',
        desc: zone.description || 'Active operational sector zone.'
      };
    });
  }, [zones]);

  // Node relaxation layout algorithm
  const layoutNodes = useMemo(() => {
    if (isStackedMobile || enrichedZones.length === 0) return [];

    const W = dimensions.width;
    const H = dimensions.height;
    const nodeW = 250;
    const nodeH = 88;
    const pad = 24;

    // Hub center point
    const hub = { x: W * 0.5, y: H * 0.54 };

    // Keep-out zones
    const headerKeepOut = {
      left: 0,
      top: 0,
      right: Math.min(420, W * 0.5),
      bottom: 125
    };

    const hubKeepOut = {
      left: hub.x - 65,
      top: hub.y - 30,
      right: hub.x + 65,
      bottom: hub.y + 55
    };

    // Initial placement on ellipse:
    // Carefully offset starting angles to keep away from top-left header
    // Specific ergonomic angles around hub for up to 6 zones:
    const presetAngles = [
      (200 * Math.PI) / 180, // Mid-left (Entry Gate)
      (330 * Math.PI) / 180, // Top-right (Registration)
      (35 * Math.PI) / 180,  // Bottom-right (Main Stage)
      (150 * Math.PI) / 180, // Bottom-left (Parking)
      (90 * Math.PI) / 180,  // Bottom-center (First Aid)
      (280 * Math.PI) / 180  // Top-center (if 6th)
    ];

    const rx = W * 0.35;
    const ry = H * 0.34;

    // Initial node rects
    let nodes = enrichedZones.map((zone, i) => {
      const angle = presetAngles[i % presetAngles.length];
      const cx = hub.x + rx * Math.cos(angle);
      const cy = hub.y + ry * Math.sin(angle);

      return {
        ...zone,
        x: cx - nodeW / 2,
        y: cy - nodeH / 2,
        w: nodeW,
        h: nodeH
      };
    });

    // Run 22 relaxation passes pushing rects apart
    for (let pass = 0; pass < 22; pass++) {
      // 1. Clamp inside boundary
      for (const node of nodes) {
        node.x = Math.max(pad, Math.min(W - node.w - pad, node.x));
        node.y = Math.max(pad, Math.min(H - node.h - pad, node.y));

        // 2. Push away from header keep-out zone
        if (
          node.x < headerKeepOut.right &&
          node.x + node.w > headerKeepOut.left &&
          node.y < headerKeepOut.bottom &&
          node.y + node.h > headerKeepOut.top
        ) {
          const pushX = headerKeepOut.right - node.x + 8;
          const pushY = headerKeepOut.bottom - node.y + 8;
          if (pushX < pushY) {
            node.x += pushX;
          } else {
            node.y += pushY;
          }
        }

        // 3. Push away from hub & hub label keep-out zone
        if (
          node.x < hubKeepOut.right &&
          node.x + node.w > hubKeepOut.left &&
          node.y < hubKeepOut.bottom &&
          node.y + node.h > hubKeepOut.top
        ) {
          const dx = node.x + node.w / 2 - hub.x;
          const dy = node.y + node.h / 2 - hub.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          node.x += (dx / dist) * 12;
          node.y += (dy / dist) * 12;
        }
      }

      // 4. Push overlapping node pairs apart
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];

          const overlapX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
          const overlapY = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);

          if (overlapX > 0 && overlapY > 0) {
            if (overlapX < overlapY) {
              const shift = (overlapX + 8) / 2;
              if (a.x < b.x) {
                a.x -= shift;
                b.x += shift;
              } else {
                a.x += shift;
                b.x -= shift;
              }
            } else {
              const shift = (overlapY + 8) / 2;
              if (a.y < b.y) {
                a.y -= shift;
                b.y += shift;
              } else {
                a.y += shift;
                b.y -= shift;
              }
            }
          }
        }
      }
    }

    // Final boundary clamp
    return nodes.map((node) => ({
      ...node,
      x: Math.max(pad, Math.min(W - node.w - pad, node.x)),
      y: Math.max(pad, Math.min(H - node.h - pad, node.y))
    }));
  }, [enrichedZones, dimensions, isStackedMobile]);

  // Hub center coordinates
  const hubPos = {
    x: dimensions.width * 0.5,
    y: dimensions.height * 0.54
  };

  if (!zones || zones.length === 0) {
    return (
      <div
        className={`pulse-event-map-empty ${className}`}
        style={{
          height: '560px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--paper-raised)',
          border: '1px solid var(--line-strong)',
          borderRadius: 'var(--radius)',
          padding: '32px',
          textAlign: 'center',
          ...style
        }}
      >
        <Sliders size={36} color="var(--ink-2)" style={{ marginBottom: '14px' }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
          No Event Zones Configured
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', maxWidth: '360px', marginBottom: '20px' }}>
          Initialize zones and volunteer coverage quotas in Event Setup to activate the live operational map.
        </p>
        <Button variant="primary" onClick={() => navigate('/event-setup')}>
          Go to Event Setup
        </Button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`pulse-event-map-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: isStackedMobile ? 'auto' : '560px',
        height: isStackedMobile ? 'auto' : '560px',
        backgroundColor: 'var(--paper-raised)',
        backgroundImage: 'radial-gradient(rgba(21, 19, 15, 0.12) 1.2px, transparent 1.2px)',
        backgroundSize: '20px 20px',
        border: '1px solid var(--line-strong)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        boxSizing: 'border-box',
        ...style
      }}
    >
      {/* Panel Header (Top-Left, left-aligned, never overlapped) */}
      <div
        style={{
          position: isStackedMobile ? 'relative' : 'absolute',
          top: 0,
          left: 0,
          zIndex: 10,
          padding: '20px 24px',
          maxWidth: '440px',
          pointerEvents: 'none'
        }}
      >
        {/* Top Single Mono Status Line */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--ink)',
            marginBottom: '8px'
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: 'var(--mint)',
              boxShadow: '0 0 6px var(--mint)'
            }}
            aria-hidden="true"
          />
          <span>● LIVE SIMULATION</span>
          <span style={{ color: 'var(--line-strong)' }}>·</span>
          <span>{event.name || 'TSEC TECHFEST — MAIN ARENA'}</span>
          <span style={{ color: 'var(--line-strong)' }}>·</span>
          <span style={{ color: 'var(--ink-2)' }}>{event.venue || 'CAMPUS GROUNDS'}</span>
        </div>

        {/* Tagline in display typography */}
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(20px, 2.2vw, 26px)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.025em',
            margin: 0
          }}
        >
          <span style={{ color: 'var(--ink)', display: 'block' }}>Every zone. Every volunteer.</span>
          <span style={{ color: 'var(--vermilion)', display: 'block' }}>One live command center.</span>
        </h2>
      </div>

      {/* SVG Network Vector Canvas (Behind nodes, hub to node connectors) */}
      {!isStackedMobile && (
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 2
          }}
        >
          {/* Faint Concentric Radar Guide Rings */}
          <circle
            cx={hubPos.x}
            cy={hubPos.y}
            r="80"
            fill="none"
            stroke="var(--line)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
          <circle
            cx={hubPos.x}
            cy={hubPos.y}
            r="160"
            fill="none"
            stroke="var(--line)"
            strokeWidth="1"
            strokeDasharray="5 7"
            opacity="0.6"
          />
          <circle
            cx={hubPos.x}
            cy={hubPos.y}
            r="240"
            fill="none"
            stroke="var(--line)"
            strokeWidth="1"
            opacity="0.3"
          />

          {/* Connectors from Hub to Zone Nodes */}
          {layoutNodes.map((node) => {
            const isHovered = hoveredNodeId === node.id || selectedZoneId === node.id;
            const targetX = node.x + node.w / 2;
            const targetY = node.y + node.h / 2;

            return (
              <g key={`connector-${node.id}`}>
                {/* Connector line */}
                <line
                  x1={hubPos.x}
                  y1={hubPos.y}
                  x2={targetX}
                  y2={targetY}
                  stroke={isHovered ? 'var(--line-strong)' : 'var(--line)'}
                  strokeWidth={isHovered ? 2 : 1}
                  strokeDasharray="4 4"
                  className="pulse-flow-line"
                />

                {/* Subtle moving energy pip along connector */}
                <circle r={isHovered ? 3 : 2} fill={node.statusColor} opacity={0.85}>
                  <animateMotion
                    path={`M ${hubPos.x} ${hubPos.y} L ${targetX} ${targetY}`}
                    dur={node.gaps > 0 ? '3s' : '5s'}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}
        </svg>
      )}

      {/* Central Hub Core (28-32px indigo orb with heartbeat + LIVE PULSE below) */}
      {!isStackedMobile && (
        <div
          style={{
            position: 'absolute',
            left: `${hubPos.x}px`,
            top: `${hubPos.y}px`,
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 4,
            pointerEvents: 'none'
          }}
        >
          {/* Soft expanding ring every ~4.2s */}
          <div
            className="pulse-hub-expanding-ring"
            style={{
              position: 'absolute',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '2px solid var(--indigo)',
              animation: 'hubPulseRing 4.2s infinite ease-out'
            }}
          />

          {/* Indigo Orb */}
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--indigo)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(91, 84, 230, 0.45), 0 2px 6px rgba(21, 19, 15, 0.3)',
              position: 'relative',
              zIndex: 2
            }}
          >
            <Activity size={16} aria-hidden="true" />
          </div>

          {/* LIVE PULSE Label in its own clear space below */}
          <div
            style={{
              marginTop: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.14em',
              color: 'var(--indigo)',
              backgroundColor: 'var(--paper-raised)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--line)',
              whiteSpace: 'nowrap'
            }}
          >
            LIVE PULSE
          </div>
        </div>
      )}

      {/* Zone Nodes (Solid --navy, 1px border, min 240x84, interactive buttons) */}
      <div
        style={
          isStackedMobile
            ? {
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '20px'
              }
            : {
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none'
              }
        }
      >
        {(isStackedMobile ? enrichedZones : layoutNodes).map((node, idx) => {
          const isSelected = selectedZoneId === node.id;
          const isHovered = hoveredNodeId === node.id || isSelected;
          const showPopover = activePopoverNodeId === node.id || hoveredNodeId === node.id;
          const hasGaps = node.gaps > 0;

          return (
            <div
              key={node.id}
              style={
                isStackedMobile
                  ? { width: '100%', position: 'relative' }
                  : {
                      position: 'absolute',
                      left: `${node.x}px`,
                      top: `${node.y}px`,
                      width: `${node.w}px`,
                      height: `${node.h}px`,
                      pointerEvents: 'auto',
                      zIndex: isHovered ? 30 : 15,
                      transition: 'transform var(--dur-fast) var(--ease-out)',
                      transform: isHovered ? 'translateY(-2px)' : 'translateY(0)'
                    }
              }
            >
              <button
                type="button"
                onClick={() => {
                  onSelectZone(node.id);
                  setActivePopoverNodeId(activePopoverNodeId === node.id ? null : node.id);
                }}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onFocus={() => setHoveredNodeId(node.id)}
                onBlur={() => setHoveredNodeId(null)}
                aria-label={`${node.name}: ${node.assigned} of ${node.required} volunteers, ${node.statusLine}`}
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: '84px',
                  backgroundColor: 'var(--navy)',
                  color: 'var(--ink-inverse)',
                  border: isSelected
                    ? '2px solid var(--vermilion)'
                    : '1px solid rgba(255, 255, 255, 0.16)',
                  borderRadius: 'var(--radius)',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: hasGaps
                    ? `0 0 20px ${node.glowColor}, var(--shadow-sm)`
                    : '0 4px 12px rgba(19, 26, 43, 0.25)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                className={hasGaps ? 'pulse-gap-breathe' : ''}
              >
                {/* Left: Status Dot + Name + Status Line */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: node.statusColor,
                        flexShrink: 0
                      }}
                      aria-hidden="true"
                    />
                    <span
                      style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: 'var(--ink-inverse)',
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {node.name}
                    </span>
                  </div>

                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: node.statusColor,
                      letterSpacing: '0.04em',
                      lineHeight: 1.2,
                      paddingLeft: '15px'
                    }}
                  >
                    {node.statusLine}
                  </div>
                </div>

                {/* Right: Numerals assigned/required + Pip Row */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '4px',
                    flexShrink: 0
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '22px',
                      fontWeight: 800,
                      color: 'var(--ink-inverse)',
                      lineHeight: 1,
                      fontVariantNumeric: 'tabular-nums',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    <span>{node.assigned}</span>
                    <span style={{ color: 'var(--ink-inverse-2)', margin: '0 2px' }}>/</span>
                    <span style={{ color: 'var(--ink-inverse-2)' }}>{node.required}</span>
                  </div>

                  {/* Pip Row (filled = assigned, hollow = missing) */}
                  <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                    {Array.from({ length: Math.max(node.required, node.assigned) }).map((_, pipIdx) => {
                      const isAssigned = pipIdx < node.assigned;
                      return (
                        <span
                          key={pipIdx}
                          style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            backgroundColor: isAssigned ? node.statusColor : 'transparent',
                            border: `1px solid ${isAssigned ? node.statusColor : 'var(--ink-inverse-2)'}`
                          }}
                          aria-hidden="true"
                        />
                      );
                    })}
                  </div>
                </div>
              </button>

              {/* Hover / Focus Interactive Popover */}
              {showPopover && (
                <div
                  role="tooltip"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '260px',
                    backgroundColor: 'var(--paper-raised)',
                    border: '1px solid var(--line-strong)',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-float)',
                    padding: '14px',
                    zIndex: 50,
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--ink)', marginBottom: '4px' }}>
                    {node.name} Sector
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-2)', lineHeight: 1.4, marginBottom: '8px' }}>
                    {node.desc}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--ink-3)',
                      marginBottom: '12px'
                    }}
                  >
                    Lead: {node.lead} · Quota: {node.assigned}/{node.required}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {hasGaps && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={UserPlus}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/assignments');
                        }}
                      >
                        FIND REPLACEMENT
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={ArrowUpRight}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/assignments');
                      }}
                    >
                      VIEW ASSIGNMENTS
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EventMap;
