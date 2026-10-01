import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import CoordinationOrb from './CoordinationOrb';
import HeroPhotoCards from './HeroPhotoCards';
import LiveDot from './primitives/LiveDot';
import { useReducedMotionSafe } from '../../hooks/useReducedMotionSafe';
import { useFitText } from '../../hooks/useFitText';
import { eventZones } from '../../data/eventZones';

/**
 * TUNING CONFIG: Reference Hero (§3, §4, §5, §7)
 * Target hero composition (1440×900 reference):
 * - Headline centered both horizontally and vertically (true center)
 * - Widest line ≤ 58vw, block ≤ 42vh, text-wrap: balance, useFitText guard
 * - Real photographic event cards in outer gutters/corners (no gradient/abstract art)
 * - Wireframe CoordinationOrb centered on headline as quiet backdrop
 * - Protected rectangles: [data-hero-ticker], [data-hero-stat], [data-hero-scroll], [data-menu], [data-hero-headline]
 * - Clear >= 24px clearance between cards and all protected UI elements
 */
const HERO_CONFIG = {
  bgColor: '#070913',
  stageHeight: '112vh',
};

export function ReferenceHero() {
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotionSafe();
  const { ref: headlineRef } = useFitText({ maxReductionSteps: 8, reductionRatio: 0.96 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Smooth scroll exit transitions
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

  const metaOpacity = useTransform(
    scrollYProgress,
    [0, 0.35],
    [1, 0]
  );

  // Derive active zones and critical gap count directly from eventZones data (§2 H5, §7)
  const totalZones = eventZones.length;
  const criticalCount = eventZones.filter(
    (z) => (z.gap || (z.required - z.staffed)) > 0
  ).length;

  return (
    <div
      ref={containerRef}
      id="reference-hero"
      className="pulse-reference-hero-container"
      style={{
        position: 'relative',
        backgroundColor: HERO_CONFIG.bgColor,
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
        {/* Layer 1: Background Wireframe Coordination Orb (centered on headline, quiet backdrop) */}
        <motion.div
          style={{
            y: shouldReduceMotion ? 0 : globeY,
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 1, // Layer 1
          }}
        >
          <CoordinationOrb />
        </motion.div>

        {/* Layer 2: Real Documentary Photo Cards in outer gutters/corners (§5, §6) */}
        <HeroPhotoCards />

        {/* Layer 4: Centered Headline Block (§4) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 4, // Layer 4 (above cards layer 2, below HUD layer 5)
          }}
        >
          <motion.div
            style={{
              width: '100%',
              maxWidth: '58vw',
              maxHeight: '42vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              y: shouldReduceMotion ? 0 : masterY,
              opacity: shouldReduceMotion ? 1 : headlineOpacity,
            }}
            data-hero-headline="true"
            className="pulse-hero-headline-wrap"
          >
            <h1
              ref={headlineRef}
              data-hero-headline="true"
              style={{
                fontFamily: "'Archivo', 'Archivo Black', 'Bricolage Grotesque', sans-serif",
                fontVariationSettings: "'wdth' 125, 'wght' 900",
                fontWeight: 900,
                fontSize: 'min(6.4vw, 11vh)',
                lineHeight: 0.94,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                color: '#FFFFFF',
                margin: 0,
                padding: 0,
                whiteSpace: 'pre-line',
                textWrap: 'balance',
                overflowWrap: 'normal',
                hyphens: 'none',
                maxWidth: '58vw',
                textShadow: '0 2px 30px rgba(7, 9, 19, 0.55)',
                display: 'inline-block',
              }}
              className="pulse-hero-display-h1"
            >
              {"EVERY PERSON.\nEVERY ZONE.\nIN SYNC."}
            </h1>
          </motion.div>
        </div>

        {/* Layer 5: HUD Elements (Protected Rectangles) */}

        {/* Top Ticker: LIVE EVENT COORDINATION · TECHFEST 2026 · EVENT ACTIVE */}
        <motion.div
          data-hero-ticker="true"
          style={{
            position: 'absolute',
            top: 'clamp(24px, 4.5vh, 40px)',
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: shouldReduceMotion ? 1 : metaOpacity,
            y: shouldReduceMotion ? 0 : masterY,
            zIndex: 5, // Layer 5
            pointerEvents: 'auto',
          }}
        >
          <div
            className="font-mono pulse-hero-eyebrow"
            style={{
              fontSize: '0.72rem',
              color: 'rgba(255, 255, 255, 0.75)',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 14px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backgroundColor: 'rgba(7, 9, 19, 0.65)',
              backdropFilter: 'blur(8px)',
              borderRadius: '2px',
              userSelect: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <LiveDot size={6} />
            <span>LIVE EVENT COORDINATION · TECHFEST 2026 · EVENT ACTIVE</span>
          </div>
        </motion.div>

        {/* Bottom Stat Line: 128 ACTIVE VOLUNTEERS // 5 ZONES (Derived from eventZones) */}
        <motion.div
          data-hero-stat="true"
          style={{
            position: 'absolute',
            bottom: 'clamp(24px, 3.8vh, 36px)',
            left: 'clamp(1.5rem, 3.5vw, 4rem)',
            zIndex: 5, // Layer 5
            opacity: shouldReduceMotion ? 1 : metaOpacity,
            pointerEvents: 'none',
          }}
          className="font-mono"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', whiteSpace: 'nowrap' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 8px #10b981',
              }}
            />
            <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.75)', letterSpacing: '0.12em' }}>
              {`128 ACTIVE VOLUNTEERS // ${totalZones} ACTIVE ZONES · ${criticalCount} CRITICAL`}
            </span>
          </div>
        </motion.div>

        {/* Scroll Cue: SCROLL TO EXPLORE ZONES ↓ (Positioned cleanly above Menu pill) */}
        <motion.div
          data-hero-scroll="true"
          style={{
            position: 'absolute',
            bottom: '82px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 5, // Layer 5
            opacity: shouldReduceMotion ? 1 : metaOpacity,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
          className="font-mono"
        >
          <span
            style={{
              fontSize: '0.72rem',
              color: 'rgba(255, 255, 255, 0.65)',
              letterSpacing: '0.14em',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
            }}
          >
            SCROLL TO EXPLORE ZONES ↓
          </span>
        </motion.div>
      </div>
    </div>
  );
}

export default ReferenceHero;
