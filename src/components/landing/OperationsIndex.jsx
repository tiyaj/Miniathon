import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ArrowUpRight } from 'lucide-react';
import SectionIndex from './primitives/SectionIndex';
import RevealText from './primitives/RevealText';
import { useRouteWipe } from './RouteWipeTransition';

export function OperationsIndex() {
  const { wipeTo } = useRouteWipe();
  const [expandedKey, setExpandedKey] = useState('assignments');

  const operations = [
    {
      key: 'assignments',
      label: 'ASSIGNMENTS',
      tag: '98% FILL RATE',
      desc: 'Deterministic rule-based matching, real-time conflict prevention, and instant dropout replacement.',
      route: '/assignments',
      isAlert: false,
    },
    {
      key: 'tasks',
      label: 'TASKS',
      tag: '33 LIVE',
      desc: 'Live dispatch checklists, priority queuing, on-ground verification, and automated routing to nearby volunteers.',
      route: '/tasks',
      isAlert: false,
    },
    {
      key: 'incidents',
      label: 'INCIDENTS',
      tag: '02 OPEN',
      desc: 'Emergency issue triage, medical and security escalation channels, and immediate perimeter response alerts.',
      route: '/incidents',
      isAlert: true,
    },
    {
      key: 'announcements',
      label: 'ANNOUNCEMENTS',
      tag: 'ALL CHANNELS ACTIVE',
      desc: 'Targeted broadcast channels to specific zones, roles, or all 128 active volunteers simultaneously.',
      route: '/announcements',
      isAlert: false,
    },
  ];

  return (
    <section
      id="operations"
      className="pulse-section"
      style={{
        backgroundColor: 'var(--paper, #F3F0E8)',
        color: 'var(--ink, #17150F)',
        position: 'relative',
        zIndex: 14,
        paddingTop: 'clamp(5rem, 8vw, 8rem)',
        paddingBottom: 'clamp(5rem, 8vw, 8rem)',
      }}
      aria-labelledby="operations-title"
    >
      <div className="pulse-container">
        {/* Hairline Two-Column Layout (§6.7) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'clamp(3rem, 6vw, 6rem)',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Heading & Sticky Labels */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <SectionIndex index="05" title="OPERATIONAL ARCHITECTURE" />
            </div>

            <RevealText
              as="h2"
              id="operations-title"
              style={{
                fontFamily: "'Archivo', 'Archivo Black', 'Bricolage Grotesque', sans-serif",
                fontVariationSettings: "'wdth' 125, 'wght' 900",
                fontWeight: 900,
                fontSize: 'clamp(2.4rem, 5.2vw, 5rem)',
                lineHeight: 0.94,
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                color: 'var(--ink, #17150F)',
                margin: '0 0 1.5rem 0',
              }}
            >
              {"CONTROL\nTHE CHAOS."}
            </RevealText>

            <p
              style={{
                color: 'var(--ink-70, rgba(23, 21, 15, 0.70))',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                maxWidth: '440px',
                margin: 0,
              }}
            >
              Four unified telemetry layers operating synchronously. Click any operational module to inspect
              live status and launch the corresponding command system.
            </p>

            <div
              className="font-mono"
              style={{
                marginTop: '2.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--hairline, rgba(23, 21, 15, 0.14))',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.75rem',
                color: 'var(--ink-45, rgba(23, 21, 15, 0.45))',
              }}
            >
              <div>SYSTEM: PULSE CORE v2.4</div>
              <div>ENCRYPTION: VERIFIED DIRECTORY</div>
              <div>UPTIME: 100% (LIVE OPS ACTIVE)</div>
            </div>
          </div>

          {/* Right Column: Hairline-Ruled Rows with '+' Icons */}
          <div style={{ borderTop: '1px solid var(--hairline, rgba(23, 21, 15, 0.14))' }}>
            {operations.map((op) => {
              const isExpanded = expandedKey === op.key;
              const isAlert = Boolean(op.isAlert);

              return (
                <div
                  key={op.key}
                  style={{
                    borderBottom: '1px solid var(--hairline, rgba(23, 21, 15, 0.14))',
                    padding: 'clamp(1.5rem, 2.8vw, 2.2rem) 0',
                    transition: 'background-color 0.25s ease',
                  }}
                >
                  {/* Row Header */}
                  <div
                    onClick={() => setExpandedKey((prev) => (prev === op.key ? null : op.key))}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontSize: 'clamp(1.3rem, 2.2vw, 1.9rem)',
                          fontWeight: 700,
                          color: isAlert ? 'var(--pulse, #F5452C)' : 'var(--ink, #17150F)',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {op.label}
                      </span>

                      {/* Tag Badge */}
                      <span
                        className="font-mono"
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '2px',
                          backgroundColor: isAlert ? 'rgba(245, 69, 44, 0.12)' : 'var(--paper-raised, #ECE8DD)',
                          border: isAlert ? '1px solid rgba(245, 69, 44, 0.35)' : '1px solid var(--hairline-bold, rgba(23, 21, 15, 0.28))',
                          color: isAlert ? 'var(--pulse, #F5452C)' : 'var(--ink-70, rgba(23, 21, 15, 0.70))',
                          letterSpacing: '0.08em',
                        }}
                      >
                        {op.tag}
                      </span>
                    </div>

                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: '1px solid var(--hairline-bold, rgba(23, 21, 15, 0.25))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isAlert ? 'var(--pulse, #F5452C)' : 'var(--ink, #17150F)',
                        backgroundColor: 'var(--paper-raised, #ECE8DD)',
                      }}
                    >
                      {isExpanded ? <Minus size={16} /> : <Plus size={16} />}
                    </div>
                  </div>

                  {/* Expandable Description and Launch CTA */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <p
                          style={{
                            color: 'var(--ink-70, rgba(23, 21, 15, 0.70))',
                            fontSize: '0.95rem',
                            lineHeight: 1.6,
                            marginTop: '16px',
                            marginBottom: '18px',
                          }}
                        >
                          {op.desc}
                        </p>

                        <button
                          onClick={() => wipeTo(op.route)}
                          style={{
                            backgroundColor: 'transparent',
                            color: isAlert ? 'var(--pulse, #F5452C)' : 'var(--ink, #17150F)',
                            border: isAlert ? '1px solid var(--pulse, #F5452C)' : '1px solid var(--ink, #17150F)',
                            padding: '10px 18px',
                            borderRadius: '4px',
                            fontFamily: 'var(--font-mono, monospace)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isAlert ? 'var(--pulse, #F5452C)' : 'var(--ink, #17150F)';
                            e.currentTarget.style.color = '#FFFFFF';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = isAlert ? 'var(--pulse, #F5452C)' : 'var(--ink, #17150F)';
                          }}
                        >
                          <span>OPEN {op.label}</span>
                          <ArrowUpRight size={15} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default OperationsIndex;
