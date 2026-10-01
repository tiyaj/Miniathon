import React, { useRef, useState, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';
import { useReducedMotionSafe } from '../../../hooks/useReducedMotionSafe';

/**
 * Magnetic
 * Wraps buttons and interactive anchors to create a subtle attraction toward the cursor.
 * Disabled on touch screens and under prefers-reduced-motion.
 */
export function Magnetic({ children, strength = 0.28, className = '', style = {} }) {
  const ref = useRef(null);
  const shouldReduceMotion = useReducedMotionSafe();
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    setCanHover(window.matchMedia('(pointer: fine)').matches);
  }, []);

  const springConfig = { damping: 15, stiffness: 180, mass: 0.2 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  if (shouldReduceMotion || !canHover) {
    return <div className={className} style={style}>{children}</div>;
  }

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const distanceX = (e.clientX - centerX) * strength;
    const distanceY = (e.clientY - centerY) * strength;

    x.set(distanceX);
    y.set(distanceY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y, display: 'inline-block', ...style }}
      className={`pulse-magnetic ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default Magnetic;
