import { useReducedMotion } from 'framer-motion';

/**
 * useReducedMotionSafe
 * Hook returning boolean indicating whether the user prefers reduced motion.
 */
export function useReducedMotionSafe() {
  const shouldReduce = useReducedMotion();
  return Boolean(shouldReduce);
}

export default useReducedMotionSafe;
