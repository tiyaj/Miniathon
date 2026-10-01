import { useState, useEffect } from 'react';
import { useReducedMotionSafe } from './useReducedMotionSafe';

/**
 * usePointerParallax
 * Tracks pointer offset from screen center, strictly on devices with pointer: fine (desktop mice).
 * Throttled using requestAnimationFrame and zeroed on touch/reduced-motion.
 */
export function usePointerParallax(intensity = 15) {
  const shouldReduceMotion = useReducedMotionSafe();
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Disable on reduced motion or non-fine pointer (touch screens)
    if (shouldReduceMotion) return;
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    let rAFId = null;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      // Normalized between -1 and 1
      const normX = (e.clientX / innerWidth - 0.5) * 2;
      const normY = (e.clientY / innerHeight - 0.5) * 2;

      targetX = normX * intensity;
      targetY = normY * intensity;

      if (!rAFId) {
        rAFId = requestAnimationFrame(() => {
          setOffset({ x: targetX, y: targetY });
          rAFId = null;
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rAFId) cancelAnimationFrame(rAFId);
    };
  }, [intensity, shouldReduceMotion]);

  return offset;
}

export default usePointerParallax;
