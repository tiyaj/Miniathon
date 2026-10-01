import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionIndex from './primitives/SectionIndex';
import RevealText from './primitives/RevealText';
import { eventZones } from '../../data/eventZones';
import { useReducedMotionSafe } from '../../hooks/useReducedMotionSafe';
import { ledgerRow } from '../../utils/motion';

/**
 * ZoneCoverage (§6.5) — 03 Vector Staffing ("EVERY ZONE. VISIBLE.")
 * Restored to original PULSE Cream / Ink / Vermilion styling:
 * - Cream background (#F3F0E8 / var(--paper))
 * - Deep ink text (#17150F / var(--ink))
 * - Vermilion accent (#F5452C / var(--pulse)) for gaps
 * - 1px hairline rules and clean ledger table layout
 * - Synchronized live data from eventZones
 */
export function ZoneCoverage({
  activeZone = null,
  onHoverZone = () => {},
}) {
  const shouldReduceMotion = useReducedMotionSafe();
  const [expandedZoneId, setExpandedZoneId] = useState(null);

  const handleToggleExpand = (zoneId) => {
    setExpandedZoneId((prev) => (prev === zoneId ? null : zoneId));
  };

  return (
    <section
      id="zone-coverage"
      className="pulse-section"
      style={{
        backgroundColor: 'var(--paper, #F3F0E8)',
        color: 'var(--ink, #17150F)',
        position: 'relative',
        zIndex: 14,
        paddingTop: 'clamp(5rem, 8vw, 8rem)',
        paddingBottom: 'clamp(5rem, 8vw, 8rem)',
      }}
      aria-labelledby="zone-coverage-title"
    >
      <div className="pulse-container">
        {/* Section Eyebrow */}
        <div style={{ marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
          <SectionIndex index="03" title="VECTOR STAFFING" />
        </div>

        {/* Section Headline */}
        <div style={{ marginBottom: 'clamp(2.5rem, 5vw, 4.5rem)' }}>
          <RevealText
            as="h2"
            id="zone-coverage-title"
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
            {"EVERY ZONE.\nVISIBLE."}
          </RevealText>
        </div>

        {/* Coverage Ledger Table */}
        <div className="pulse-coverage-ledger">
          {eventZones.map((zone, idx) => {
            const isFull = zone.staffed >= zone.required;
            const percentage = Math.min(Math.round((zone.staffed / zone.required) * 100), 100);
            const isExpanded = expandedZoneId === zone.id;
            const isSelected = activeZone === zone.id;
            const gap = zone.required - zone.staffed;

            return (
              <motion.div
                key={zone.id}
                variants={shouldReduceMotion ? {} : ledgerRow}
                initial={shouldReduceMotion ? 'visible' : 'hidden'}
                whileInView="visible"
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: idx * 0.08 }}
                onClick={() => handleToggleExpand(zone.id)}
                onMouseEnter={() => onHoverZone(zone.id)}
                onMouseLeave={() => onHoverZone(null)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggleExpand(zone.id);
                  }
                }}
                style={{
                  borderBottom: '1px solid var(--hairline, rgba(23, 21, 15, 0.14))',
                  padding: 'clamp(1.25rem, 2.2vw, 2rem) 0',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? 'rgba(23, 21, 15, 0.04)' : 'transparent',
                  transition: 'background-color 0.2s ease',
                }}
                className={`pulse-zone-ledger-row ${isSelected ? 'is-selected' : ''}`}
                aria-expanded={isExpanded}
                aria-label={`${zone.name}: ${zone.staffed} of ${zone.required} volunteers`}
              >
                {/* Main Row: Zone Name + Status Badge + Ratio */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: 'clamp(1.4rem, 2.5vw, 2.2rem)',
                        fontWeight: 700,
                        color: 'var(--ink, #17150F)',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {zone.name}
                    </span>

                    {/* Gap / 100% Badge */}
                    {isFull ? (
                      <span
                        className="font-mono"
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--ink-70, rgba(23, 21, 15, 0.70))',
                          border: '1px solid var(--hairline-bold, rgba(23, 21, 15, 0.28))',
                          backgroundColor: 'var(--paper-raised, #ECE8DD)',
                          padding: '3px 8px',
                          borderRadius: '2px',
                          fontWeight: 600,
                        }}
                      >
                        ✓ 100% COVERED
                      </span>
                    ) : (
                      <span
                        className="font-mono"
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--pulse, #F5452C)',
                          border: '1px solid rgba(245, 69, 44, 0.35)',
                          backgroundColor: 'rgba(245, 69, 44, 0.10)',
                          padding: '3px 8px',
                          borderRadius: '2px',
                          fontWeight: 700,
                        }}
                      >
                        GAP: -{gap}
                      </span>
                    )}
                  </div>

                  {/* Ratio Numbers */}
                  <div
                    className="font-mono"
                    style={{
                      fontSize: 'clamp(1.1rem, 2vw, 1.8rem)',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                    }}
                  >
                    <span style={{ color: isFull ? 'var(--ink, #17150F)' : 'var(--pulse, #F5452C)' }}>
                      {String(zone.staffed).padStart(2, '0')}
                    </span>
                    <span style={{ color: 'var(--ink-45, rgba(23, 21, 15, 0.45))' }}>
                      {' '}/ {String(zone.required).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Meter Bar: 2px, filled to staffed ratio */}
                <div
                  style={{
                    width: '100%',
                    height: '2px',
                    backgroundColor: 'rgba(23, 21, 15, 0.10)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  aria-hidden="true"
                >
                  <motion.div
                    initial={shouldReduceMotion ? { width: `${percentage}%` } : { width: '0%' }}
                    whileInView={{ width: `${percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      height: '100%',
                      backgroundColor: isFull ? 'var(--ink, #17150F)' : 'var(--pulse, #F5452C)',
                      boxShadow: isFull ? 'none' : '0 0 6px rgba(245, 69, 44, 0.35)',
                    }}
                  />
                </div>

                {/* Expandable Detail Drawer */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        paddingTop: '16px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '12px',
                        fontSize: '0.82rem',
                        color: 'var(--ink-70, rgba(23, 21, 15, 0.70))',
                      }}
                      className="font-mono"
                    >
                      <div>
                        <span style={{ color: 'var(--ink-45, rgba(23, 21, 15, 0.45))' }}>SCOPE: </span>
                        <span>{zone.caption}</span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--ink-45, rgba(23, 21, 15, 0.45))' }}>STATUS: </span>
                        <span style={{ color: isFull ? 'var(--ink, #17150F)' : 'var(--pulse, #F5452C)', fontWeight: 700 }}>
                          {zone.status}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ZoneCoverage;
