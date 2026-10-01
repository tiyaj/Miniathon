import React from 'react';
import { motion } from 'framer-motion';
import SectionIndex from './primitives/SectionIndex';
import RevealText from './primitives/RevealText';
import CountUp from './primitives/CountUp';
import { useReducedMotionSafe } from '../../hooks/useReducedMotionSafe';
import { ledgerRow } from '../../utils/motion';

/**
 * LiveNumbers (§6.4) — 02 Telemetry Pulse ("THE EVENT IS MOVING.")
 * Restyled dark:
 * - Huge heavy white numerals in Archivo font
 * - 02 in PULSE red (#F5452C) for open incidents
 * - Thin indigo rules (#5a3cf0, 1px) that draw in from the left
 * - Mono labels and operational descriptions
 * - Numbers count up once on entry
 */
export function LiveNumbers({ eventData }) {
  const shouldReduceMotion = useReducedMotionSafe();

  const stats = [
    { id: 'volunteers', value: 128, label: 'VOLUNTEERS', desc: 'Active across all campus sectors', pad: 0, isAlert: false },
    { id: 'zones',      value: 5,   label: 'ACTIVE ZONES', desc: 'Sectors monitored continuously', pad: 2, isAlert: false },
    { id: 'tasks',      value: 33,  label: 'LIVE TASKS', desc: 'Dispatches currently in execution', pad: 0, isAlert: false },
    { id: 'incidents',  value: 2,   label: 'OPEN INCIDENTS', desc: 'Urgent issues under rapid resolution', pad: 2, isAlert: true },
  ];

  return (
    <section
      id="live-numbers"
      className="pulse-section pulse-dark-section"
      style={{
        backgroundColor: '#0a0a10',
        color: '#FFFFFF',
        position: 'relative',
        zIndex: 14,
        paddingTop: 'clamp(5rem, 8vw, 8rem)',
        paddingBottom: 'clamp(5rem, 8vw, 8rem)',
      }}
      aria-labelledby="live-numbers-title"
    >
      {/* Indigo Divider Rule drawing from left (§6.4) */}
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
        {/* 12-Column Editorial Grid Layout (§6) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: 'clamp(2rem, 4vw, 5rem)',
            alignItems: 'start',
          }}
          className="pulse-live-numbers-grid"
        >
          {/* Left Column (Cols 1-5): Section Index + Large Balanced Headline */}
          <div
            style={{
              gridColumn: 'span 5',
              position: 'sticky',
              top: '100px',
            }}
            className="pulse-live-numbers-header-col"
          >
            <div style={{ marginBottom: 'clamp(1.5rem, 2.5vw, 2.2rem)' }}>
              <SectionIndex index="02" title="TELEMETRY PULSE" />
            </div>

            <RevealText
              as="h2"
              id="live-numbers-title"
              style={{
                fontFamily: "'Archivo', 'Archivo Black', sans-serif",
                fontVariationSettings: "'wdth' 125, 'wght' 900",
                fontWeight: 900,
                fontSize: 'clamp(2.6rem, 5vw, 5.4rem)',
                lineHeight: 0.92,
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                color: '#FFFFFF',
                margin: '0 0 1.5rem 0',
                textWrap: 'balance',
              }}
            >
              {"THE EVENT\nIS MOVING."}
            </RevealText>

            <div
              className="font-mono"
              style={{
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.5)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '1.5rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid rgba(90, 60, 240, 0.25)',
                maxWidth: '360px',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 8px #10b981',
                }}
              />
              <span>128 VOLUNTEERS · LIVE TELEMETRY</span>
            </div>
          </div>

          {/* Right Column (Cols 6-12): Editorial Numbers Ledger */}
          <div
            style={{
              gridColumn: 'span 7',
              borderTop: '1px solid rgba(90, 60, 240, 0.25)',
            }}
            className="pulse-numbers-ledger pulse-live-numbers-ledger-col"
          >
            {stats.map((item, idx) => {
              const isAlert = Boolean(item.isAlert);

              return (
                <motion.div
                  key={item.id}
                  variants={shouldReduceMotion ? {} : ledgerRow}
                  initial={shouldReduceMotion ? 'visible' : 'hidden'}
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: idx * 0.1 }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'clamp(100px, 14vw, 170px) 1.2fr 1.6fr',
                    alignItems: 'baseline',
                    padding: 'clamp(1.25rem, 2.2vw, 2rem) 0',
                    borderBottom: '1px solid rgba(90, 60, 240, 0.25)',
                    position: 'relative',
                  }}
                  className={`pulse-dark-num-row ${isAlert ? 'is-alert-row' : ''}`}
                  role="group"
                  aria-label={`${item.value} ${item.label}`}
                >
                  {/* Giant Heavy Numeral in Archivo */}
                  <div
                    style={{
                      fontFamily: "'Archivo', 'Archivo Black', sans-serif",
                      fontWeight: 900,
                      fontSize: 'clamp(2.8rem, 6vw, 6.2rem)',
                      lineHeight: 0.9,
                      color: isAlert ? '#F5452C' : '#FFFFFF',
                      letterSpacing: '-0.03em',
                      textShadow: isAlert ? '0 0 16px rgba(245, 69, 44, 0.4)' : 'none',
                    }}
                  >
                    <CountUp
                      target={item.value}
                      padStart={item.pad}
                      delay={idx * 140}
                      duration={1400}
                    />
                  </div>

                  {/* Mono Label Center */}
                  <div
                    className="font-mono"
                    style={{
                      fontSize: 'clamp(0.8rem, 1.1vw, 1.05rem)',
                      color: isAlert ? '#F5452C' : 'rgba(255, 255, 255, 0.9)',
                      letterSpacing: '0.12em',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>{item.label}</span>
                    {isAlert && (
                      <span
                        style={{
                          fontSize: '0.65em',
                          color: '#F5452C',
                          backgroundColor: 'rgba(245, 69, 44, 0.14)',
                          border: '1px solid rgba(245, 69, 44, 0.35)',
                          padding: '2px 6px',
                          borderRadius: '2px',
                          fontWeight: 700,
                        }}
                      >
                        ● ATTN
                      </span>
                    )}
                  </div>

                  {/* Operational Description Right */}
                  <div
                    style={{
                      color: 'rgba(255, 255, 255, 0.58)',
                      fontSize: 'clamp(0.82rem, 0.95vw, 0.95rem)',
                      lineHeight: 1.5,
                    }}
                  >
                    {item.desc}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default LiveNumbers;
