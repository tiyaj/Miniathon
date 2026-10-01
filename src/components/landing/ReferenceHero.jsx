import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import CoordinationOrb from './CoordinationOrb';
import FloatingEventMedia from './FloatingEventMedia';
import LiveDot from './primitives/LiveDot';
import { useReducedMotionSafe } from '../../hooks/useReducedMotionSafe';

/**
 * TUNING CONFIG: Reference Hero (§4, §5.1, §5.4)
 * All measured coordinates from the 1908x795 reference:
 * - Headline Center: (50vw, 62vh)
 * - Headline Font: Archivo 900, 4.7vw (63px cap height at 1908w), line-height 0.94, letter-spacing -0.01em
 * - Globe Center: (49.7vw, 60vh), diameter ~27vw (64vh)
 * - 1:1 Natural scroll base: headline and globe translate synchronously
 */
export const HERO_CONFIG = {
  headlineCenter: { x: '50vw', y: '62vh' },
  fontSizeVw: 4.7,
  lineHeight: 0.94,
  letterSpacing: '-0.01em',
  globeCenter: { x: '49.7vw', y: '60vh' },
  globeDiameterVw: 27,
};

export function ReferenceHero({ onOpenEventPanel }) {
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotionSafe();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // 1:1 Natural scroll translation (§5.1: headline & globe move together within ~2vh)
  const masterY = useTransform(
    scrollYProgress,
    [0, 0.55],
    ['0vh', '-58vh']
  );

  // Globe lags by at most ~2vh from headline (§5.2)
  const globeY = useTransform(
    scrollYProgress,
    [0, 0.55],
    ['0vh', '-56vh']
  );

  const headlineOpacity = useTransform(
    scrollYProgress,
    [0, 0.38],
    [1, 0]
  );

  // Eyebrow and bottom meta exit early with headline
  const metaOpacity = useTransform(
    scrollYProgress,
    [0, 0.22],
    [1, 0]
  );

  return (
    <div
      ref={containerRef}
      id="reference-hero"
      className="pulse-reference-hero-container"
      style={{
        position: 'relative',
        backgroundColor: '#0a0a10',
        color: '#FFFFFF',
        height: shouldReduceMotion ? '100vh' : '200vh',
        width: '100%',
        zIndex: 10,
      }}
    >
      {/* Sticky 100vh Viewport Stage */}
      <div
        className="pulse-dark-stage"
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          overflow: 'clip',
          backgroundColor: '#0a0a10',
        }}
      >
        {/* Layer 1: Background Wireframe Coordination Orb (§4.2) */}
        <motion.div
          style={{
            y: shouldReduceMotion ? 0 : globeY,
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <CoordinationOrb />
        </motion.div>

        {/* Layer 2: Scattered 6 Asymmetric Photos + 2 Below Fold (§4.3) */}
        <FloatingEventMedia scrollYProgress={scrollYProgress} />

        {/* Top Eyebrow: LIVE EVENT COORDINATION · TECHFEST 2026 · EVENT ACTIVE (§4.1) */}
        <motion.div
          style={{
            position: 'absolute',
            top: '7vh',
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: shouldReduceMotion ? 1 : metaOpacity,
            y: shouldReduceMotion ? 0 : masterY,
            zIndex: 15,
            pointerEvents: 'auto',
          }}
        >
          <button
            onClick={onOpenEventPanel}
            className="font-mono pulse-hero-eyebrow"
            style={{
              fontSize: '0.72rem',
              color: 'rgba(255, 255, 255, 0.65)',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 14px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '2px',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease, border-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
            title="Click to view Live Event dossier"
          >
            <span>LIVE EVENT COORDINATION</span>
            <span style={{ opacity: 0.3 }}>·</span>
            <span>TECHFEST 2026</span>
            <span style={{ opacity: 0.3 }}>·</span>
            <span style={{ color: '#F5452C', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <LiveDot size={6} />
              EVENT ACTIVE
            </span>
          </button>
        </motion.div>

        {/* Layer 3: Centered 3-Line Headline (§4.1) */}
        {/* Center at (50vw, 62vh), lower-center of viewport */}
        <motion.div
          style={{
            position: 'absolute',
            top: HERO_CONFIG.headlineCenter.y,
            left: HERO_CONFIG.headlineCenter.x,
            transform: 'translate(-50%, -50%)',
            y: shouldReduceMotion ? 0 : masterY,
            opacity: shouldReduceMotion ? 1 : headlineOpacity,
            zIndex: 10,
            textAlign: 'center',
            width: 'max-content',
            maxWidth: '92vw',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          <h1
            style={{
              fontFamily: "'Archivo', 'Archivo Black', sans-serif",
              fontVariationSettings: "'wdth' 125, 'wght' 900",
              fontWeight: 900,
              fontSize: 'clamp(2.4rem, 4.7vw, 5.6rem)',
              lineHeight: 0.94,
              letterSpacing: '-0.01em',
              color: '#FFFFFF',
              margin: 0,
              textTransform: 'uppercase',
            }}
            className="pulse-reference-headline"
          >
            <span style={{ display: 'block' }}>EVERY PERSON.</span>
            <span style={{ display: 'block' }}>EVERY ZONE.</span>
            <span style={{ display: 'block' }}>IN SYNC.</span>
          </h1>
        </motion.div>

        {/* Bottom Line: THADOMAL SHAHANI ENGINEERING COLLEGE · MUMBAI + LIVE (§4.1) */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: '12vh',
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: shouldReduceMotion ? 1 : metaOpacity,
            y: shouldReduceMotion ? 0 : masterY,
            zIndex: 15,
            width: '100%',
            maxWidth: '1440px',
            paddingLeft: 'clamp(1.5rem, 5vw, 4rem)',
            paddingRight: 'clamp(1.5rem, 5vw, 4rem)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxSizing: 'border-box',
            pointerEvents: 'none',
          }}
          className="font-mono pulse-hero-bottom-meta"
        >
          <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.55)', letterSpacing: '0.12em' }}>
            <span>THADOMAL SHAHANI ENGINEERING COLLEGE</span>
            <span style={{ margin: '0 8px', opacity: 0.35 }}>·</span>
            <span>MUMBAI</span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '2px',
              fontSize: '0.72rem',
              color: '#FFFFFF',
              fontWeight: 700,
            }}
          >
            <LiveDot size={6} />
            <span>LIVE</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ReferenceHero;
