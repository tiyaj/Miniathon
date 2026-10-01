import { useState, useEffect } from 'react';
import { useReducedMotionSafe } from './useReducedMotionSafe';

/**
 * useCountUp
 * Smoothly interpolates an integer from 0 to target value using requestAnimationFrame.
 * Automatically respects prefers-reduced-motion.
 */
export function useCountUp(target = 0, startTrigger = true, options = {}) {
  const {
    duration = 1400, // milliseconds
    delay = 0,       // delay before starting
    padStart = 0     // e.g. 2 for "06"
  } = options;

  const shouldReduceMotion = useReducedMotionSafe();
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (!startTrigger) return;

    if (shouldReduceMotion) {
      setCurrentValue(target);
      return;
    }

    let animationFrameId;
    let startTime = null;
    let timerId;

    const startCounting = () => {
      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Exponential out easing: 1 - 2^(-10 * progress)
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const nextValue = Math.floor(easeProgress * target);

        setCurrentValue(nextValue);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        } else {
          setCurrentValue(target);
        }
      };

      animationFrameId = requestAnimationFrame(step);
    };

    if (delay > 0) {
      timerId = setTimeout(startCounting, delay);
    } else {
      startCounting();
    }

    return () => {
      if (timerId) clearTimeout(timerId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [target, startTrigger, duration, delay, shouldReduceMotion]);

  const formatted = padStart > 0
    ? String(currentValue).padStart(padStart, '0')
    : String(currentValue);

  return { value: currentValue, formatted };
}

export default useCountUp;
