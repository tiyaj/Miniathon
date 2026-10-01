import React, { useState } from 'react';
import { motion, useTransform } from 'framer-motion';
import { heroMedia, eventZones } from '../../data/eventZones';
import { useRouteWipe } from './RouteWipeTransition';
import { useReducedMotionSafe } from '../../hooks/useReducedMotionSafe';

/**
 * TUNING CONFIG: Hero Scattered Media Parallax & Bridge
 * Floating cards styled with warm cream / off-white (#F4F1EA) background framing,
 * significantly enlarged dimensions (wider, longer, more prominent),
 * smooth travel distances synchronized with the hero exit into the zone strip.
 */
export const MEDIA_MOTION_CONFIG = {
  upperExitSpeed: 1.35,
  naturalScrollSpeed: 1.0,
  bridgeGrowScrollEnd: 0.65,
  hoverScale: 1.035,
  creamBg: '#F4F1EA',
  creamBgLight: '#FAF8F3',
};

export function FloatingEventMedia({ scrollYProgress }) {
  const shouldReduceMotion = useReducedMotionSafe();
  const { wipeTo } = useRouteWipe();
  const [hoveredZoneId, setHoveredZoneId] = useState(null);

  // Global fade-out as the transition into the pinned strip takes over (no empty void)
  const layerOpacity = useTransform(
    scrollYProgress,
    [0.55, 0.85],
    [1, 0]
  );

  return (
    <motion.div
      className="pulse-floating-media-layer"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'box-none',
        zIndex: 5,
        overflow: 'visible',
        opacity: shouldReduceMotion ? 1 : layerOpacity,
      }}
    >
      {heroMedia.map((item) => {
        return (
          <ScatteredCard
            key={item.id}
            item={item}
            scrollYProgress={scrollYProgress}
            shouldReduceMotion={shouldReduceMotion}
            onSelectZone={() => wipeTo(`/assignments?zone=${item.zoneId}`)}
            isHovered={hoveredZoneId === item.id}
            onHoverStart={() => setHoveredZoneId(item.id)}
            onHoverEnd={() => setHoveredZoneId(null)}
          />
        );
      })}
    </motion.div>
  );
}

function ScatteredCard({
  item,
  scrollYProgress,
  shouldReduceMotion,
  onSelectZone,
  isHovered,
  onHoverStart,
  onHoverEnd,
}) {
  const isBridge = Boolean(item.isBridge);
  const zoneInfo = eventZones.find((z) => z.id === item.zoneId) || eventZones[0];

  // Natural scroll baseline with upper photo speed boost
  const travelDistance = item.speed > 1.1 ? -110 * item.speed : -75 * item.speed;
  const yTranslate = useTransform(
    scrollYProgress,
    [0, 0.72],
    ['0vh', `${travelDistance}vh`]
  );

  // Below-the-fold entrance (small crowd & bridge DJ rise into view)
  const belowFoldTranslate = useTransform(
    scrollYProgress,
    [0, 0.65],
    ['0vh', '-65vh']
  );

  // Bridge DJ growth and center drift
  const bridgeScale = useTransform(
    scrollYProgress,
    [0, 0.65],
    [1.0, 1.7]
  );

  const bridgeX = useTransform(
    scrollYProgress,
    [0, 0.65],
    ['0vw', '-4.5vw']
  );

  const bridgeRadius = useTransform(
    scrollYProgress,
    [0, 0.65],
    ['10px', '16px']
  );

  const isBelowFold = !item.initialVisible;

  // Compute final Y translation
  const effectiveY = shouldReduceMotion
    ? 0
    : isBelowFold
    ? belowFoldTranslate
    : yTranslate;

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: item.top,
        left: item.left,
        width: item.width,
        aspectRatio: item.aspectRatio,
        zIndex: item.zIndex,
        y: effectiveY,
        x: isBridge && !shouldReduceMotion ? bridgeX : 0,
        scale: isBridge && !shouldReduceMotion ? bridgeScale : 1,
        pointerEvents: 'auto',
      }}
      className={`pulse-scatter-card-wrap ${isBridge ? 'is-bridge' : ''}`}
    >
      <button
        onClick={onSelectZone}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        onFocus={onHoverStart}
        onBlur={onHoverEnd}
        aria-label={`Open ${zoneInfo.name} sector: ${zoneInfo.staffed} of ${zoneInfo.required} volunteers`}
        style={{
          width: '100%',
          height: '100%',
          padding: 0,
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          display: 'block',
          position: 'relative',
          textAlign: 'left',
        }}
      >
        {/* Warm Cream Card Frame Wrapper */}
        <motion.div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: isBridge && !shouldReduceMotion ? bridgeRadius : item.radius,
            overflow: 'hidden',
            backgroundColor: MEDIA_MOTION_CONFIG.creamBg, // #F4F1EA Warm Cream
            padding: '7px', // Crisp cream border framing
            boxShadow: isHovered
              ? '0 24px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(244, 241, 234, 0.25)'
              : '0 16px 36px rgba(0, 0, 0, 0.65)',
            border: '1px solid rgba(244, 241, 234, 0.35)',
            transform: isHovered ? `scale(${MEDIA_MOTION_CONFIG.hoverScale})` : 'scale(1)',
            transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease',
          }}
        >
          {/* Inner Image Container */}
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '4px',
              overflow: 'hidden',
              backgroundColor: '#121218',
            }}
          >
            <img
              src={item.src}
              alt={item.subject}
              loading={item.initialVisible ? 'eager' : 'lazy'}
              decoding="async"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        </motion.div>
      </button>

      {/* Hover/focus mono tag beneath card */}
      <motion.div
        initial={false}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 5 : -2 }}
        transition={{ duration: 0.18 }}
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          pointerEvents: 'none',
          marginTop: '6px',
          whiteSpace: 'nowrap',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '9.5px',
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: '#F4F1EA',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          padding: '3px 8px',
          borderRadius: '2px',
          border: '1px solid rgba(244, 241, 234, 0.3)',
          textTransform: 'uppercase',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.9)',
        }}
        className="font-mono"
      >
        {zoneInfo.name} · {zoneInfo.staffed}/{zoneInfo.required}
      </motion.div>
    </motion.div>
  );
}

export default FloatingEventMedia;
