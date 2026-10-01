import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import CoordinationOrb from './CoordinationOrb';
import FloatingEventMedia from './FloatingEventMedia';
import LiveDot from './primitives/LiveDot';
import { useReducedMotionSafe } from '../../hooks/useReducedMotionSafe';

/**
 * TUNING CONFIG: Reference Hero (§4, §5.1, §5.4)
 * Background: Pure Black (#000000)
 * Tight stage height (~112vh) so the lead stage image of EventZoneSequence
 * enters the viewport while the headline and globe are still leaving.
 * Zero blank dark space.
 * Headline: (50vw, 62vh), Archivo 900
 * Globe: (49.7vw, 60vh), WebGL wireframe line loops & tilted orbit ring
 */
export const HERO_CONFIG = {
  headlineCenter: { x: '50vw', y: '62vh' },
  fontSizeVw: 4.7,
  lineHeight: 0.94,
  letterSpacing: '-0.01em',
  globeCenter: { x: '49.7vw', y: '60vh' },
  globeDiameterVw: 27,
  bgColor: '#0a0a10',
  stageHeight: '112vh',
};

export function ReferenceHero() {
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotionSafe();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // 1:1 Natural scroll translation across the hero exit
  const masterY = useTransform(
    scrollYProgress,
    [0, 0.72],
    ['0vh', '-65vh']
  );

  const globeY = useTransform(
    scrollYProgress,
    [0, 0.72],
    ['0vh', '-62vh']
  );

  const headlineOpacity = useTransform(
    scrollYProgress,
    [0, 0.52],
    [1, 0]
  );

  // Eyebrow and bottom meta exit early with headline
  const metaOpacity = useTransform(
    scrollYProgress,
    [0, 0.35],
    [1, 0]
  );

  return (
    <div
      ref={containerRef}
      id="reference-hero"
      className="pulse-reference-hero-container"
      style={{
        position: 'relative',
        backgroundColor: HERO_CONFIG.bgColor, // Pure Black (#000000)
        color: '#FFFFFF',
        height: shouldReduceMotion ? '100vh' : HERO_CONFIG.stageHeight,
        width: '100%',
        zIndex: 10,
      }}
    >
      {/* Viewport Stage */}
      <div
        className="pulse-dark-stage"
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          overflow: 'clip',
          backgroundColor: HERO_CONFIG.bgColor,
        }}
      >
        {/* Layer 1: Background Wireframe Coordination Orb */}
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

        {/* Layer 2: Scattered Floating Cream Cards & Bridge Media */}
        <FloatingEventMedia scrollYProgress={scrollYProgress} />

        {/* Top Eyebrow: LIVE EVENT COORDINATION · TECHFEST 2026 · EVENT ACTIVE */}
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
          <div
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
              userSelect: 'none',
            }}
          >
            <LiveDot size={6} />
            <span>LIVE EVENT COORDINATION · TECHFEST 2026 · EVENT ACTIVE</span>
          </div>
        </motion.div>

        {/* Layer 3: Lower-Center Display Headline (§4.2, §5.1) */}
        <motion.div
          style={{
            position: 'absolute',
            left: HERO_CONFIG.headlineCenter.x,
            top: HERO_CONFIG.headlineCenter.y,
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            zIndex: 10,
            y: shouldReduceMotion ? 0 : masterY,
            opacity: shouldReduceMotion ? 1 : headlineOpacity,
            pointerEvents: 'none',
            width: '100%',
            maxWidth: '1440px',
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
          }}
          className="pulse-hero-headline-wrap"
        >
          <h1
            style={{
              fontFamily: "'Archivo', 'Archivo Black', 'Bricolage Grotesque', sans-serif",
              fontVariationSettings: "'wdth' 125, 'wght' 900",
              fontWeight: 900,
              fontSize: 'clamp(2.6rem, 4.7vw, 5.2rem)',
              lineHeight: HERO_CONFIG.lineHeight,
              letterSpacing: HERO_CONFIG.letterSpacing,
              textTransform: 'uppercase',
              color: '#FFFFFF',
              margin: 0,
              padding: 0,
              whiteSpace: 'pre-line',
              textShadow: '0 4px 30px rgba(0, 0, 0, 0.9)',
            }}
            className="pulse-hero-display-h1"
          >
            {"EVERY PERSON.\nEVERY ZONE.\nIN SYNC."}
          </h1>
        </motion.div>

        {/* Bottom Meta Line: 128 ACTIVE VOLUNTEERS // 5 CRITICAL ZONES */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: '105px', // Above bottom menu pill
            left: 'clamp(1.5rem, 4vw, 3.5rem)',
            right: 'clamp(1.5rem, 4vw, 3.5rem)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 12,
            opacity: shouldReduceMotion ? 1 : metaOpacity,
            pointerEvents: 'none',
          }}
          className="font-mono pulse-hero-meta-bar"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 8px #10b981',
              }}
            />
            <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.6)', letterSpacing: '0.12em' }}>
              128 ACTIVE VOLUNTEERS // 5 CRITICAL ZONES
            </span>
          </div>

          <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '0.12em' }}>
            SCROLL TO EXPLORE ZONES ↓
          </span>
        </motion.div>
      </div>
    </div>
  );
}

export default ReferenceHero;
