import React, { useState } from 'react';
import { motion, useTransform } from 'framer-motion';
import { heroMedia, eventZones } from '../../data/eventZones';
import { useRouteWipe } from './RouteWipeTransition';
import { useReducedMotionSafe } from '../../hooks/useReducedMotionSafe';

/**
 * TUNING CONFIG: Hero Scattered Media Parallax & Bridge (§4.3, §5.1, §5.2, §5.3)
 * Exact reference-measured starting coordinates at scroll 0:
 * - Upper items (#1, #2, #3) exit faster: travelMultiplier ~1.3x-1.45x
 * - Mid & lower items (#4, #5, #6) move 1:1 with natural scroll
 * - Bridge DJ starts at 9vw, scales to 18.9vw, drifts to center
 */
export const MEDIA_MOTION_CONFIG = {
  upperExitSpeed: 1.35,
  naturalScrollSpeed: 1.0,
  bridgeGrowScrollEnd: 0.45,
  bridgeStartWidthVw: 9,
  bridgeEndWidthVw: 18.9,
  hoverScale: 1.03,
};

export function FloatingEventMedia({ scrollYProgress }) {
  const shouldReduceMotion = useReducedMotionSafe();
  const { wipeTo } = useRouteWipe();
  const [hoveredZoneId, setHoveredZoneId] = useState(null);

  // Global fade-out as the transition to the strip takes over
  const layerOpacity = useTransform(
    scrollYProgress,
    [0.26, 0.48],
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

  // Natural scroll baseline with upper photo speed boost (§5.1, §5.2)
  const travelDistance = item.speed > 1.1 ? -160 * item.speed : -110 * item.speed;
  const yTranslate = useTransform(
    scrollYProgress,
    [0, 0.5],
    ['0vh', `${travelDistance}vh`]
  );

  // Below-the-fold entrance (small crowd & bridge DJ rise into view)
  const belowFoldTranslate = useTransform(
    scrollYProgress,
    [0, 0.38],
    ['0vh', '-76vh']
  );

  // Bridge DJ growth and center drift (§5.3)
  const bridgeScale = useTransform(
    scrollYProgress,
    [0, 0.42],
    [1.0, 2.1]
  );

  const bridgeX = useTransform(
    scrollYProgress,
    [0, 0.42],
    ['0vw', '-4.5vw']
  );

  const bridgeRadius = useTransform(
    scrollYProgress,
    [0, 0.42],
    ['6px', '12px']
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
        style={{
          width: '100%',
          height: '100%',
          padding: 0,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          borderRadius: isBridge ? 'inherit' : item.radius,
          overflow: 'hidden',
          display: 'block',
          position: 'relative',
        }}
        aria-label={`Open ${zoneInfo.name} zone`}
      >
        <motion.div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: isBridge && !shouldReduceMotion ? bridgeRadius : item.radius,
            overflow: 'hidden',
            backgroundColor: '#0c0c14',
            transform: isHovered ? `scale(${MEDIA_MOTION_CONFIG.hoverScale})` : 'scale(1)',
            transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
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
        </motion.div>
      </button>

      {/* Hover/focus mono tag beneath card (§7: ENTRY GATE · 18/20) */}
      <motion.div
        initial={false}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 4 : -2 }}
        transition={{ duration: 0.18 }}
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          pointerEvents: 'none',
          marginTop: '4px',
          whiteSpace: 'nowrap',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '9px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: 'rgba(255, 255, 255, 0.85)',
          textTransform: 'uppercase',
          textShadow: '0 2px 6px rgba(0, 0, 0, 0.9)',
        }}
        className="font-mono"
      >
        {zoneInfo.name} · {zoneInfo.staffed}/{zoneInfo.required}
      </motion.div>
    </motion.div>
  );
}

export default FloatingEventMedia;
