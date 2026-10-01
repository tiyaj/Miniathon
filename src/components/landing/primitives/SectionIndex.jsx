import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from '../../../utils/motion';
import { useReducedMotionSafe } from '../../../hooks/useReducedMotionSafe';

/**
 * SectionIndex
 * Technical mono eyebrow establishing the editorial chapter rhythm (e.g. "01 — LIVE EVENT").
 */
export function SectionIndex({ index = '01', title = '', children, className = '' }) {
  const shouldReduceMotion = useReducedMotionSafe();
  const text = children || `${index} — ${title}`;

  return (
    <motion.div
      variants={shouldReduceMotion ? {} : fadeUp}
      initial={shouldReduceMotion ? 'visible' : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className={`pulse-section-index font-mono ${className}`}
      style={{
        fontSize: 'var(--fs-label)',
        color: 'var(--ink-45)',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: 'var(--space-4)',
        userSelect: 'none',
      }}
    >
      <span>{text}</span>
    </motion.div>
  );
}

export default SectionIndex;
