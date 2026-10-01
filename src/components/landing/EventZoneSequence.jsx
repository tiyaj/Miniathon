import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { eventZones } from '../../data/eventZones';
import { useRouteWipe } from './RouteWipeTransition';
import { useReducedMotionSafe } from '../../hooks/useReducedMotionSafe';

/**
 * TUNING CONFIG: EventZoneSequence (§5.4, §5.5, §6.3)
 * - Container height: 320vh (pinned stage for cinematic translation)
 * - Cards: 5 varied asymmetric cards (lead 59vw landscape, portrait 38vw, landscape 52vw, portrait 36vw, landscape 50vw)
 * - Radius: 12px
 * - Card Height: ~86vh
 * - Coverage bar: 2px (red for gap, white for 100%)
 * - Arrow button: 42px round white button at bottom-right
 * - Inner Parallax: ±4% opposite to scroll direction
 */
export const STRIP_CONFIG = {
  containerHeight: '320vh',
  leadCardWidthVw: 59,
  cardHeightVh: 86,
  cardRadius: '12px',
  gapVw: 1.5,
  innerParallaxRange: ['-4%', '4%'],
};

export function EventZoneSequence() {
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotionSafe();
  const { wipeTo } = useRouteWipe();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Stage entrance: lead card rises centered (45vw -> left-anchored 59vw)
  const leadCardX = useTransform(
    scrollYProgress,
    [0, 0.18],
    ['calc(50vw - 22.5vw - 5vw)', '0vw']
  );

  const leadCardWidth = useTransform(
    scrollYProgress,
    [0, 0.18],
    ['45vw', '59vw']
  );

  // Horizontal strip translation mapped across scroll progress
  const rawX = useTransform(
    scrollYProgress,
    [0.1, 0.95],
    ['0%', '-68%']
  );

  const springX = useSpring(rawX, {
    stiffness: 90,
    damping: 24,
    mass: 0.3,
  });

  // Inner image parallax (translates opposite to the strip row)
  const innerImgParallax = useTransform(
    scrollYProgress,
    [0, 1],
    STRIP_CONFIG.innerParallaxRange
  );

  return (
    <div
      ref={containerRef}
      id="event-zone-sequence"
      className="pulse-zone-sequence-container"
      style={{
        position: 'relative',
        backgroundColor: '#000000',
        height: shouldReduceMotion ? 'auto' : STRIP_CONFIG.containerHeight,
        zIndex: 12,
      }}
    >
      {/* Sticky 100vh Stage */}
      <div
        className="pulse-sticky-zone-stage"
        style={{
          position: shouldReduceMotion ? 'relative' : 'sticky',
          top: 0,
          left: 0,
          width: '100%',
          height: shouldReduceMotion ? 'auto' : '100vh',
          overflow: 'clip',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: '#000000',
          padding: shouldReduceMotion ? '4rem 1.5rem' : 0,
        }}
      >
        {/* Subtle Top Telemetry Strip */}
        <div
          style={{
            position: 'absolute',
            top: '3vh',
            left: 'clamp(1.5rem, 5vw, 4rem)',
            right: 'clamp(1.5rem, 5vw, 4rem)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10,
            pointerEvents: 'none',
          }}
          className="font-mono"
        >
          <span
            style={{
              fontSize: '0.72rem',
              color: 'rgba(255, 255, 255, 0.45)',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            CHAPTER 02 // SECTOR MONITORING & COVERAGE
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              color: 'rgba(255, 255, 255, 0.45)',
              letterSpacing: '0.14em',
            }}
          >
            05 ACTIVE SECTORS
          </span>
        </div>

        {/* Horizontal Film Strip Track */}
        <motion.div
          style={{
            x: shouldReduceMotion ? 0 : springX,
            display: 'flex',
            alignItems: 'center',
            gap: `${STRIP_CONFIG.gapVw}vw`,
            paddingLeft: 'clamp(1.5rem, 5vw, 5rem)',
            paddingRight: '15vw',
            width: 'max-content',
            willChange: 'transform',
          }}
          className="pulse-zone-strip-track"
        >
          {eventZones.map((zone, idx) => {
            const isFull = zone.staffed >= zone.required;
            const fillPct = Math.min(Math.round((zone.staffed / zone.required) * 100), 100);
            const isLead = idx === 0;

            return (
              <div
                key={zone.id}
                className={`pulse-zone-card ${zone.type === 'portrait' ? 'is-portrait' : 'is-landscape'}`}
                onClick={() => wipeTo(zone.route)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    wipeTo(zone.route);
                  }
                }}
                style={{
                  position: 'relative',
                  width: isLead && !shouldReduceMotion
                    ? `clamp(320px, ${zone.widthVw}vw, 980px)`
                    : `clamp(300px, ${zone.widthVw}vw, ${zone.type === 'portrait' ? '600px' : '980px'})`,
                  height: 'clamp(520px, 86vh, 880px)',
                  borderRadius: STRIP_CONFIG.cardRadius,
                  overflow: 'hidden',
                  flexShrink: 0,
                  backgroundColor: '#0e0e18',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85)',
                  cursor: 'pointer',
                }}
                aria-label={`Open ${zone.name} zone: ${zone.status}`}
              >
                {/* Background Zone Imagery with subtle inner parallax & hover scale */}
                <motion.div
                  style={{
                    position: 'absolute',
                    inset: '-5%',
                    width: '110%',
                    height: '110%',
                    x: shouldReduceMotion ? 0 : innerImgParallax,
                  }}
                  className="pulse-zone-card-img-wrap"
                >
                  <img
                    src={zone.image}
                    alt={zone.name}
                    loading={isLead ? 'eager' : 'lazy'}
                    decoding="async"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    className="pulse-zone-card-img"
                  />
                </motion.div>

                {/* Dark Gradient Scrim (55%) for text legibility (§6.3) */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(10, 10, 16, 0.05) 0%, rgba(10, 10, 16, 0.35) 45%, rgba(10, 10, 16, 0.94) 100%)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Card Content Overlay (§6.3) */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: 'clamp(1.25rem, 3vw, 2.75rem)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    zIndex: 5,
                  }}
                >
                  {/* Left: Eyebrow + Huge Zone Name + Coverage */}
                  <div style={{ maxWidth: '82%' }}>
                    <span
                      className="font-mono"
                      style={{
                        fontSize: '0.72rem',
                        color: 'rgba(255, 255, 255, 0.7)',
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: '6px',
                        fontWeight: 700,
                      }}
                    >
                      ZONE {zone.index}
                    </span>

                    <h3
                      style={{
                        fontFamily: "'Archivo', 'Archivo Black', sans-serif",
                        fontSize: 'clamp(2rem, 3.8vw, 3.8rem)',
                        fontWeight: 900,
                        letterSpacing: '-0.02em',
                        lineHeight: 0.94,
                        color: '#FFFFFF',
                        margin: '0 0 10px 0',
                        textTransform: 'uppercase',
                      }}
                    >
                      {zone.name}
                    </h3>

                    <div
                      className="font-mono"
                      style={{
                        fontSize: 'clamp(0.75rem, 0.9vw, 0.88rem)',
                        color: isFull ? 'rgba(255, 255, 255, 0.85)' : '#ff6b55',
                        letterSpacing: '0.08em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 600,
                      }}
                    >
                      <span>{zone.status}</span>
                    </div>
                  </div>

                  {/* Right: Round White Arrow Button (§6.3) */}
                  <div
                    style={{
                      width: 'clamp(38px, 3.5vw, 48px)',
                      height: 'clamp(38px, 3.5vw, 48px)',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      color: '#0a0a10',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                      transition: 'transform 0.25s ease, background-color 0.25s ease, color 0.25s ease',
                    }}
                    className="pulse-zone-arrow-btn"
                    aria-hidden="true"
                  >
                    <ArrowUpRight size={20} strokeWidth={2.5} />
                  </div>
                </div>

                {/* 2px Coverage Bar at Card's Bottom Edge (§6.3) */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '2px',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    zIndex: 6,
                  }}
                  aria-hidden="true"
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${fillPct}%`,
                      backgroundColor: isFull ? '#FFFFFF' : '#F5452C',
                      boxShadow: isFull ? 'none' : '0 0 6px #F5452C',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

export default EventZoneSequence;
