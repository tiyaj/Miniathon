import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionIndex from './primitives/SectionIndex';
import RevealText from './primitives/RevealText';
import { useReducedMotionSafe } from '../../hooks/useReducedMotionSafe';

/**
 * VolunteerFlow (§6.6) — Topology / Network Section ("PEOPLE MAKE THE EVENT MOVE.")
 * Restored to original PULSE Cream / Ink / Vermilion styling:
 * - Cream background (#F3F0E8 / var(--paper))
 * - Deep ink text (#17150F / var(--ink))
 * - Vermilion accent (#F5452C / var(--pulse))
 * - 5 nodes with hairline rings echoing the venue layout
 * - Vermilion traveling dots looping smoothly along connection paths
 */
export function VolunteerFlow({
  activeZone = null,
  onHoverZone = () => {},
}) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { margin: '100px 0px' });
  const shouldReduceMotion = useReducedMotionSafe();
  const [hoveredNode, setHoveredNode] = useState(null);

  const currentHighlighted = hoveredNode || activeZone;

  // 5 Nodes synced with eventZones
  const nodes = [
    { id: 'entry-gate',   label: 'ENTRY GATE',   x: 160, y: 250, count: 18, capacity: 20 },
    { id: 'registration', label: 'REGISTRATION', x: 380, y: 130, count: 12, capacity: 12 },
    { id: 'main-stage',   label: 'MAIN STAGE',   x: 620, y: 210, count: 14, capacity: 16 },
    { id: 'food-zone',    label: 'FOOD ZONE',    x: 420, y: 380, count: 9,  capacity: 10 },
    { id: 'backstage',    label: 'BACKSTAGE',    x: 840, y: 250, count: 8,  capacity: 8  },
  ];

  // Orbital curves connecting nodes
  const paths = useMemo(() => [
    { id: 'p-gate-reg',   from: 'entry-gate',   to: 'registration', d: 'M 160 250 C 230 170, 300 135, 380 130' },
    { id: 'p-gate-food',  from: 'entry-gate',   to: 'food-zone',    d: 'M 160 250 C 230 330, 310 380, 420 380' },
    { id: 'p-reg-stage',  from: 'registration', to: 'main-stage',   d: 'M 380 130 C 470 130, 540 170, 620 210' },
    { id: 'p-food-stage', from: 'food-zone',    to: 'main-stage',   d: 'M 420 380 C 510 380, 560 290, 620 210' },
    { id: 'p-stage-back', from: 'main-stage',   to: 'backstage',    d: 'M 620 210 C 690 170, 760 210, 840 250' },
    { id: 'p-back-food',  from: 'backstage',    to: 'food-zone',    d: 'M 840 250 C 750 390, 570 410, 420 380' },
  ], []);

  // Traveling dots animation loop
  const TOKEN_COUNT = 16;
  const pathDOMElements = useRef({});
  const tokenDOMElements = useRef([]);

  useEffect(() => {
    if (shouldReduceMotion || !isInView) return;

    const tokens = [];
    for (let i = 0; i < TOKEN_COUNT; i++) {
      tokens.push({
        pathIdx: i % paths.length,
        progress: (i / TOKEN_COUNT) + (Math.random() * 0.1),
        speed: 0.00065 + (i % 3) * 0.00025,
      });
    }

    let animId;
    const tick = () => {
      tokens.forEach((token, i) => {
        token.progress += token.speed;
        if (token.progress > 1) {
          token.progress = 0;
          token.pathIdx = (token.pathIdx + 1) % paths.length;
        }

        const pathId = paths[token.pathIdx].id;
        const pathEl = pathDOMElements.current[pathId];
        const tokenEl = tokenDOMElements.current[i];

        if (pathEl && tokenEl) {
          const totalLength = pathEl.getTotalLength();
          const point = pathEl.getPointAtLength(token.progress * totalLength);
          tokenEl.setAttribute('cx', point.x.toFixed(1));
          tokenEl.setAttribute('cy', point.y.toFixed(1));
        }
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isInView, shouldReduceMotion, paths]);

  return (
    <section
      ref={containerRef}
      id="volunteer-flow"
      className="pulse-section"
      style={{
        backgroundColor: 'var(--paper, #F3F0E8)',
        color: 'var(--ink, #17150F)',
        position: 'relative',
        zIndex: 14,
        paddingTop: 'clamp(5rem, 8vw, 8rem)',
        paddingBottom: 'clamp(5rem, 8vw, 8rem)',
      }}
      aria-labelledby="flow-title"
    >
      <div className="pulse-container">
        {/* Section Eyebrow */}
        <div style={{ marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
          <SectionIndex index="04" title="TOPOLOGY & NETWORK" />
        </div>

        {/* Section Headline */}
        <div style={{ marginBottom: 'clamp(2.5rem, 5vw, 4.5rem)' }}>
          <RevealText
            as="h2"
            id="flow-title"
            style={{
              fontFamily: "'Archivo', 'Archivo Black', 'Bricolage Grotesque', sans-serif",
              fontVariationSettings: "'wdth' 125, 'wght' 900",
              fontWeight: 900,
              fontSize: 'clamp(2.4rem, 6.5vw, 6rem)',
              lineHeight: 0.92,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              color: 'var(--ink, #17150F)',
              margin: 0,
            }}
          >
            {"PEOPLE MAKE\nTHE EVENT MOVE."}
          </RevealText>
        </div>

        {/* Topology Set-Piece */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            overflow: 'visible',
          }}
        >
          {/* Header Metadata */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--hairline, rgba(23, 21, 15, 0.14))',
              paddingBottom: '14px',
              marginBottom: '20px',
            }}
            className="font-mono"
          >
            <span style={{ fontSize: '0.72rem', color: 'var(--ink-70, rgba(23, 21, 15, 0.70))', letterSpacing: '0.12em' }}>
              TOPOLOGY // 05 ACTIVE SECTORS · {TOKEN_COUNT} IN TRANSIT
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--pulse, #F5452C)', letterSpacing: '0.12em', fontWeight: 700 }}>
              LIVE MESH DISPATCH
            </span>
          </div>

          {/* SVG Orbital Canvas */}
          <svg
            viewBox="0 0 1000 480"
            style={{
              width: '100%',
              height: 'auto',
              overflow: 'visible',
              display: 'block',
            }}
            role="img"
            aria-label="Active volunteer flow graph connecting event zones"
          >
            <defs>
              <filter id="nodeGlowCream" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background Faint Ambient Orbits */}
            <ellipse
              cx="500"
              cy="250"
              rx="460"
              ry="190"
              fill="none"
              stroke="rgba(23, 21, 15, 0.08)"
              strokeWidth="1"
              strokeDasharray="4 6"
            />
            <ellipse
              cx="500"
              cy="250"
              rx="320"
              ry="130"
              fill="none"
              stroke="rgba(23, 21, 15, 0.08)"
              strokeWidth="0.8"
            />

            {/* Connecting Paths */}
            {paths.map((p) => {
              const isConnected = currentHighlighted === p.from || currentHighlighted === p.to;

              return (
                <path
                  key={p.id}
                  id={p.id}
                  ref={(el) => (pathDOMElements.current[p.id] = el)}
                  d={p.d}
                  fill="none"
                  stroke={isConnected ? '#F5452C' : 'rgba(23, 21, 15, 0.20)'}
                  strokeWidth={isConnected ? 2.5 : 1.2}
                  strokeDasharray={isConnected ? 'none' : '4 6'}
                  opacity={isConnected ? 1 : 0.65}
                  style={{
                    transition: 'stroke 0.3s ease, stroke-width 0.3s ease, opacity 0.3s ease',
                  }}
                />
              );
            })}

            {/* Traveling Vermilion Dots */}
            {!shouldReduceMotion &&
              Array.from({ length: TOKEN_COUNT }).map((_, i) => (
                <circle
                  key={i}
                  ref={(el) => (tokenDOMElements.current[i] = el)}
                  r={i % 3 === 0 ? 3.5 : 2.5}
                  cx="-20"
                  cy="-20"
                  fill="#F5452C"
                  filter="drop-shadow(0 0 4px rgba(245, 69, 44, 0.5))"
                />
              ))}

            {/* 5 Sector Nodes */}
            {nodes.map((node) => {
              const isSelected = currentHighlighted === node.id;
              const hasGap = node.count < node.capacity;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseEnter={() => {
                    setHoveredNode(node.id);
                    onHoverZone(node.id);
                  }}
                  onMouseLeave={() => {
                    setHoveredNode(null);
                    onHoverZone(null);
                  }}
                  style={{ cursor: 'pointer' }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${node.label}: ${node.count} of ${node.capacity} staff`}
                >
                  {/* Concentric Node Base Ring */}
                  <circle
                    r={isSelected ? 26 : 20}
                    fill="var(--paper-raised, #ECE8DD)"
                    stroke={isSelected ? '#F5452C' : hasGap ? '#F5452C' : 'var(--hairline-bold, rgba(23, 21, 15, 0.28))'}
                    strokeWidth={isSelected ? 2 : 1}
                  />

                  {/* Pulsing ring on gap nodes */}
                  {hasGap && (
                    <circle
                      r="28"
                      fill="none"
                      stroke="#F5452C"
                      strokeWidth="1"
                      opacity="0.35"
                      className="pulse-live-ring"
                    />
                  )}

                  {/* Center Node Core */}
                  <circle
                    r={isSelected ? 5.5 : 4}
                    fill={hasGap ? '#F5452C' : 'var(--ink, #17150F)'}
                  />

                  {/* Node Mono Label */}
                  <text
                    y={node.y > 280 ? -32 : 36}
                    textAnchor="middle"
                    fill={isSelected ? '#F5452C' : 'var(--ink, #17150F)'}
                    fontFamily="var(--font-mono, monospace)"
                    fontSize="10px"
                    fontWeight="700"
                    letterSpacing="0.12em"
                    style={{ userSelect: 'none', transition: 'fill 0.2s ease' }}
                  >
                    {node.label}
                  </text>

                  {/* Ratio Tag */}
                  <text
                    y={node.y > 280 ? -18 : 50}
                    textAnchor="middle"
                    fill={hasGap ? '#F5452C' : 'var(--ink-70, rgba(23, 21, 15, 0.70))'}
                    fontFamily="var(--font-mono, monospace)"
                    fontSize="9px"
                    fontWeight="600"
                    style={{ userSelect: 'none' }}
                  >
                    {node.count} / {node.capacity}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
}

export default VolunteerFlow;
