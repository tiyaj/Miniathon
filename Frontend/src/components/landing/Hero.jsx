import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import RevealText from './primitives/RevealText';
import LiveDot from './primitives/LiveDot';
import Ticker from './primitives/Ticker';
import Magnetic from './primitives/Magnetic';
import { usePointerParallax } from '../../hooks/usePointerParallax';
import { fadeUp } from '../../utils/motion';
import { useReducedMotionSafe } from '../../hooks/useReducedMotionSafe';

/**
 * Hero (§8.2) — "EVENT OPERATIONS IN MOTION"
 * Oversized typography, asymmetric grid-breaking layout,
 * masked editorial reveals, kinetic "MOTION." styling,
 * cursor parallax, and continuous baseline telemetry ticker.
 */
export function Hero({ eventData }) {
  const parallax = usePointerParallax(14);
  const shouldReduceMotion = useReducedMotionSafe();

  const tickerItems = eventData?.tickerItems || [
    '128 VOLUNTEERS',
    '06 ZONES',
    '34 LIVE TASKS',
    '03 OPEN INCIDENTS',
    'ENTRY GATE 18/20',
    'REGISTRATION 12/12',
    'MAIN STAGE 14/16',
    'FOOD ZONE 09/10',
    'BACKSTAGE 08/08',
  ];

  return (
    <section id="hero" className="pulse-hero" aria-label="Introduction">
      <div className="pulse-container">
        {/* Top Meta Eyebrow */}
        <motion.div
          variants={shouldReduceMotion ? {} : fadeUp}
          initial={shouldReduceMotion ? 'visible' : 'hidden'}
          animate="visible"
          className="font-mono"
          style={{
            fontSize: 'var(--fs-label)',
            letterSpacing: '0.14em',
            color: 'var(--ink-45)',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span>{eventData?.eyebrow || 'LIVE EVENT COORDINATION — 2026'}</span>
          <span style={{ color: 'var(--hairline-bold)' }}>/</span>
          <span style={{ color: 'var(--pulse)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <LiveDot size={6} />
            {eventData?.status || 'LIVE'}
          </span>
        </motion.div>

        {/* Mega Wordmark & Kinetic Parallax Block */}
        <motion.div
          style={shouldReduceMotion ? {} : { x: parallax.x, y: parallax.y }}
          transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        >
          <div className="pulse-hero-mega" aria-label="PULSE">
            PULSE
          </div>

          <div className="pulse-hero-title">
            <RevealText as="div" delay={0.15}>
              EVENT OPERATIONS
            </RevealText>
            <div style={{ overflow: 'hidden' }}>
              <motion.div
                initial={shouldReduceMotion ? { y: 0, opacity: 1 } : { y: '115%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.95, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'flex', alignItems: 'baseline', gap: '0.3em', flexWrap: 'wrap' }}
              >
                <span>IN</span>
                <span className="pulse-motion-word">MOTION.</span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Editorial Subtitle */}
        <motion.p
          variants={shouldReduceMotion ? {} : fadeUp}
          initial={shouldReduceMotion ? 'visible' : 'hidden'}
          animate="visible"
          transition={{ delay: 0.45 }}
          className="pulse-hero-desc"
        >
          Coordinate volunteers. Respond instantly. Keep every zone moving.
        </motion.p>

        {/* Action Row */}
        <motion.div
          variants={shouldReduceMotion ? {} : fadeUp}
          initial={shouldReduceMotion ? 'visible' : 'hidden'}
          animate="visible"
          transition={{ delay: 0.55 }}
          className="pulse-hero-actions"
        >
          <Magnetic strength={0.25}>
            <Link
              to="/dashboard"
              className="pulse-btn-primary"
              id="hero-primary-cta"
            >
              <span>ENTER LIVE CONTROL</span>
              <span className="pulse-arrow" aria-hidden="true">→</span>
            </Link>
          </Magnetic>

          <div
            className="pulse-status-pill"
            style={{ backgroundColor: 'var(--paper-raised)', padding: '10px 18px' }}
          >
            <LiveDot size={8} />
            <span style={{ fontWeight: 600 }}>{eventData?.statusPill || 'EVENT ACTIVE'}</span>
          </div>
        </motion.div>
      </div>

      {/* Telemetry Baseline Marquee */}
      <div className="pulse-hero-ticker-baseline">
        <Ticker items={tickerItems} speed={36} />
      </div>
    </section>
  );
}

export default Hero;
