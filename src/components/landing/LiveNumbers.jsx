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
        {/* Section Eyebrow */}
        <div style={{ marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
          <SectionIndex index="02" title="TELEMETRY PULSE" />
        </div>

        {/* Headline Revealed Line by Line (§6.4) */}
        <div style={{ marginBottom: 'clamp(2.5rem, 5vw, 4.5rem)' }}>
          <RevealText
            as="h2"
            id="live-numbers-title"
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
            {"THE EVENT\nIS MOVING."}
          </RevealText>
        </div>

        {/* Editorial Numbers Ledger */}
        <div className="pulse-numbers-ledger">
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
                  gridTemplateColumns: 'clamp(140px, 20vw, 260px) 1.5fr 2fr',
                  alignItems: 'baseline',
                  padding: 'clamp(1.25rem, 2.5vw, 2.25rem) 0',
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
                    fontSize: 'clamp(3rem, 7vw, 7.5rem)',
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
                    fontSize: 'clamp(0.85rem, 1.2vw, 1.15rem)',
                    color: isAlert ? '#F5452C' : 'rgba(255, 255, 255, 0.9)',
                    letterSpacing: '0.12em',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
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
                        padding: '3px 8px',
                        borderRadius: '2px',
                        fontWeight: 700,
                      }}
                    >
                      ● ATTN REQ
                    </span>
                  )}
                </div>

                {/* Operational Description Right */}
                <div
                  style={{
                    color: 'rgba(255, 255, 255, 0.58)',
                    fontSize: 'clamp(0.85rem, 1vw, 1rem)',
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
    </section>
  );
}

export default LiveNumbers;
