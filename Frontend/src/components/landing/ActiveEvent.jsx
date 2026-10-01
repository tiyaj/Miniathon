import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import SectionIndex from './primitives/SectionIndex';
import RevealText from './primitives/RevealText';
import Hairline from './primitives/Hairline';
import LiveDot from './primitives/LiveDot';
import { useReducedMotionSafe } from '../../hooks/useReducedMotionSafe';
import { fadeUp } from '../../utils/motion';

/**
 * ActiveEvent (§8.3) — "01 — LIVE EVENT"
 * Editorial title page for the active event (TECHFEST 2026).
 * Features masked title reveals, drawing hairline divider,
 * and delicate scroll parallax between title and meta ledger.
 */
export function ActiveEvent({ eventData }) {
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotionSafe();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const titleParallax = useTransform(scrollYProgress, [0, 1], [-20, 20]);
  const metaParallax = useTransform(scrollYProgress, [0, 1], [15, -15]);

  const name = eventData?.name || 'TECHFEST';
  const year = eventData?.year || '2026';
  const venue = eventData?.venue || 'Thadomal Shahani Engineering College';
  const city = eventData?.city || 'Mumbai';

  return (
    <section
      ref={containerRef}
      id="active-event"
      className="pulse-section"
      style={{ borderTop: '1px solid var(--hairline)' }}
      aria-labelledby="active-event-title"
    >
      <div className="pulse-container">
        {/* Section Index Eyebrow */}
        <SectionIndex index="01" title="LIVE EVENT" />

        {/* Giant Title Page */}
        <motion.div
          style={shouldReduceMotion ? {} : { y: titleParallax }}
          className="pulse-active-event-header"
        >
          <RevealText as="h2" id="active-event-title" className="pulse-event-title">
            {`${name}\n${year}`}
          </RevealText>
        </motion.div>

        {/* Drawn Hairline Divider */}
        <Hairline color="var(--hairline-bold)" duration={1.1} />

        {/* Meta Bar */}
        <motion.div
          style={shouldReduceMotion ? {} : { y: metaParallax }}
          variants={shouldReduceMotion ? {} : fadeUp}
          initial={shouldReduceMotion ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={{ once: true }}
          className="pulse-event-meta-bar"
        >
          <div className="pulse-event-venue">
            <span>{venue}</span>
            <span style={{ margin: '0 8px', color: 'var(--ink-25)' }}>·</span>
            <span style={{ color: 'var(--ink-45)' }}>{city}</span>
          </div>

          <div
            className="pulse-status-pill font-mono"
            style={{ padding: '6px 14px', backgroundColor: 'var(--paper-raised)' }}
          >
            <LiveDot size={7} />
            <span style={{ color: 'var(--ink)', fontWeight: 700 }}>
              {eventData?.status || 'LIVE'}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default ActiveEvent;
