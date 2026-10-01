import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionIndex from './primitives/SectionIndex';
import RevealText from './primitives/RevealText';
import { eventZones } from '../../data/eventZones';
import { useReducedMotionSafe } from '../../hooks/useReducedMotionSafe';
import { ledgerRow } from '../../utils/motion';

/**
 * ZoneCoverage (§6.5) — 03 Vector Staffing ("EVERY ZONE. VISIBLE.")
 * Restyled dark:
 * - Data sourced directly from eventZones so numbers always match the strip
 * - Headline revealed line by line in Archivo font
 * - Meter bars fill on entry (red for gaps, white for 100%)
 * - Staggered rise on rows
 * - Thin indigo dividers (#5a3cf0)
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
      className="pulse-section pulse-dark-section"
      style={{
        backgroundColor: '#0a0a10',
        color: '#FFFFFF',
        position: 'relative',
        zIndex: 14,
        paddingTop: 'clamp(5rem, 8vw, 8rem)',
        paddingBottom: 'clamp(5rem, 8vw, 8rem)',
      }}
      aria-labelledby="zone-coverage-title"
    >
      {/* Indigo Divider Rule drawing from left */}
      <motion.div
        initial={shouldReduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{
          height: '1px',
          backgroundColor: '#5a3cf0',
          boxShadow: '0 0 8px rgba(90, 60, 240, 0.35)',
          transformOrigin: 'left',
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />

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
              fontFamily: "'Archivo', 'Archivo Black', sans-serif",
              fontVariationSettings: "'wdth' 125, 'wght' 900",
              fontWeight: 900,
              fontSize: 'clamp(2.4rem, 6.5vw, 6rem)',
              lineHeight: 0.92,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              color: '#FFFFFF',
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
                  borderBottom: '1px solid rgba(90, 60, 240, 0.25)',
                  padding: 'clamp(1.25rem, 2.2vw, 2rem) 0',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? 'rgba(90, 60, 240, 0.06)' : 'transparent',
                  transition: 'background-color 0.2s ease',
                }}
                className={`pulse-dark-zone-row ${isSelected ? 'is-selected' : ''}`}
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
                        color: '#FFFFFF',
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
                          color: 'rgba(255, 255, 255, 0.65)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          padding: '3px 8px',
                          borderRadius: '2px',
                        }}
                      >
                        ✓ 100%
                      </span>
                    ) : (
                      <span
                        className="font-mono"
                        style={{
                          fontSize: '0.72rem',
                          color: '#F5452C',
                          border: '1px solid rgba(245, 69, 44, 0.35)',
                          backgroundColor: 'rgba(245, 69, 44, 0.12)',
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
                    <span style={{ color: isFull ? '#FFFFFF' : '#F5452C' }}>
                      {String(zone.staffed).padStart(2, '0')}
                    </span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                      {' '}/ {String(zone.required).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Meter Bar: 2px, filled to staffed ratio */}
                <div
                  style={{
                    width: '100%',
                    height: '2px',
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
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
                      backgroundColor: isFull ? '#FFFFFF' : '#F5452C',
                      boxShadow: isFull ? 'none' : '0 0 8px #F5452C',
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
                        color: 'rgba(255, 255, 255, 0.7)',
                      }}
                      className="font-mono"
                    >
                      <div>
                        <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>SCOPE: </span>
                        <span>{zone.caption}</span>
                      </div>
                      <div>
                        <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>STATUS: </span>
                        <span style={{ color: isFull ? '#FFFFFF' : '#F5452C', fontWeight: 700 }}>
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
