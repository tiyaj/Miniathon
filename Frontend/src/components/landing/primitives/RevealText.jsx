import React from 'react';
import { motion } from 'framer-motion';
import { EASINGS, DURATIONS } from '../../../utils/motion';
import { useReducedMotionSafe } from '../../../hooks/useReducedMotionSafe';

/**
 * RevealText
 * Splits text into lines or words, wraps each in an overflow:hidden container,
 * and animates translateY from 115% to 0% with signature editorial expo-out easing.
 */
export function RevealText({
  children,
  lines,
  as: Component = 'h2',
  className = '',
  lineClassName = '',
  delay = 0,
  stagger = 0.09,
  duration = DURATIONS.reveal,
  once = true,
  style = {},
}) {
  const shouldReduceMotion = useReducedMotionSafe();

  // If explicit lines provided, use them; otherwise split string by newline or whitespace
  let lineArray = lines;
  if (!lineArray) {
    if (typeof children === 'string') {
      lineArray = children.split('\n');
    } else if (Array.isArray(children)) {
      lineArray = children;
    } else {
      lineArray = [children];
    }
  }

  if (shouldReduceMotion) {
    return (
      <Component className={className} style={style}>
        {lineArray.map((line, idx) => (
          <span key={idx} style={{ display: 'block' }} className={lineClassName}>
            {line}
          </span>
        ))}
      </Component>
    );
  }

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const itemVariants = {
    hidden: {
      y: '115%',
      opacity: 0,
    },
    visible: {
      y: '0%',
      opacity: 1,
      transition: {
        duration,
        ease: EASINGS.expoOut,
      },
    },
  };

  return (
    <Component className={className} style={style}>
      <motion.span
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: '-40px' }}
        style={{ display: 'block' }}
      >
        {lineArray.map((line, idx) => (
          <span
            key={idx}
            style={{
              display: 'block',
              overflow: 'hidden',
              paddingBottom: '0.08em',
              marginBottom: '-0.08em',
            }}
          >
            <motion.span
              variants={itemVariants}
              style={{
                display: 'block',
                willChange: 'transform',
              }}
              className={lineClassName}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Component>
  );
}

export default RevealText;
