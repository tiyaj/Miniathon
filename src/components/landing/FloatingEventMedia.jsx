import React, { useState } from 'react';
import { motion, useTransform } from 'framer-motion';
import { heroMedia, eventZones } from '../../data/eventZones';
import { useRouteWipe } from './RouteWipeTransition';
import { useReducedMotionSafe } from '../../hooks/useReducedMotionSafe';

/**
 * TUNING CONFIG: Hero Scattered Media Parallax & Bridge
 * Floating cards styled with warm cream / off-white (#F4F1EA) background framing,
 * significantly enlarged dimensions (wider, longer, more prominent),
 * smooth travel distances over the extended black background canvas.
 */
export const MEDIA_MOTION_CONFIG = {
  upperExitSpeed: 1.35,
  naturalScrollSpeed: 1.0,
  bridgeGrowScrollEnd: 0.45,
  hoverScale: 1.035,
  creamBg: '#F4F1EA',
  creamBgLight: '#FAF8F3',
};

export function FloatingEventMedia({ scrollYProgress }) {
  const shouldReduceMotion = useReducedMotionSafe();
  const { wipeTo } = useRouteWipe();
  const [hoveredZoneId, setHoveredZoneId] = useState(null);

  // Global fade-out as the transition into the pinned strip takes over
  const layerOpacity = useTransform(
    scrollYProgress,
    [0.28, 0.52],
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
  const travelDistance = item.speed > 1.1 ? -170 * item.speed : -115 * item.speed;
  const yTranslate = useTransform(
    scrollYProgress,
    [0, 0.52],
    ['0vh', `${travelDistance}vh`]
  );

  // Below-the-fold entrance (small crowd & bridge DJ rise into view)
  const belowFoldTranslate = useTransform(
    scrollYProgress,
    [0, 0.40],
    ['0vh', '-82vh']
  );

  // Bridge DJ growth and center drift
  const bridgeScale = useTransform(
    scrollYProgress,
    [0, 0.42],
    [1.0, 1.85]
  );

  const bridgeX = useTransform(
    scrollYProgress,
    [0, 0.42],
    ['0vw', '-4.5vw']
  );

  const bridgeRadius = useTransform(
    scrollYProgress,
    [0, 0.42],
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
        {/* Floating Card Outer Frame with Warm Cream Background (#F4F1EA) */}
        <motion.div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: isBridge && !shouldReduceMotion ? bridgeRadius : item.radius,
            overflow: 'hidden',
            backgroundColor: MEDIA_MOTION_CONFIG.creamBg, // Warm cream / off-white shade
            padding: '7px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(244, 241, 234, 0.3)',
            transform: isHovered ? `scale(${MEDIA_MOTION_CONFIG.hoverScale})` : 'scale(1)',
            transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Inner Artwork Frame */}
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '6px',
              overflow: 'hidden',
              backgroundColor: '#0c0c14',
              position: 'relative',
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

      {/* Hover/focus mono tag beneath card: preserved text colours */}
      <motion.div
        initial={false}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 6 : -2 }}
        transition={{ duration: 0.18 }}
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          pointerEvents: 'none',
          marginTop: '6px',
          whiteSpace: 'nowrap',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: '#FFFFFF',
          textTransform: 'uppercase',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.95)',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          padding: '3px 8px',
          borderRadius: '2px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
        className="font-mono"
      >
        {zoneInfo.name} · {zoneInfo.staffed}/{zoneInfo.required}
      </motion.div>
    </motion.div>
  );
}

export default FloatingEventMedia;
