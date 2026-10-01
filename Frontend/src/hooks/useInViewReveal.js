import { useRef } from 'react';
import { useInView } from 'framer-motion';

/**
 * useInViewReveal
 * Convenience wrapper over framer-motion useInView with consistent margin & once trigger.
 */
export function useInViewReveal(options = {}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: options.once !== undefined ? options.once : true,
    margin: options.margin || '-10% 0px -10% 0px',
    amount: options.amount || 0.2,
    ...options
  });

  return [ref, isInView];
}

export default useInViewReveal;
