import React from 'react';
import { motion } from 'framer-motion';
import { drawLine } from '../../../utils/motion';
import { useReducedMotionSafe } from '../../../hooks/useReducedMotionSafe';

/**
 * Hairline
 * 1px editorial divider that draws across horizontally on scroll-in.
 */
export function Hairline({
  color = 'var(--hairline)',
  className = '',
  style = {},
  origin = 'left',
  delay = 0,
  duration = 1.0,
}) {
  const shouldReduceMotion = useReducedMotionSafe();

  if (shouldReduceMotion) {
    return (
      <div
        className={`pulse-hairline ${className}`}
        style={{
          height: '1px',
          backgroundColor: color,
          width: '100%',
          ...style,
        }}
      />
    );
  }

  return (
    <motion.div
      initial={{ scaleX: 0, transformOrigin: origin }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`pulse-hairline ${className}`}
      style={{
        height: '1px',
        backgroundColor: color,
        width: '100%',
        ...style,
      }}
    />
  );
}

export default Hairline;
