import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotionSafe } from '../../hooks/useReducedMotionSafe';
import LiveDot from './primitives/LiveDot';

/**
 * Preloader (§8.0)
 * Rapid, editorial preloader entrance (≤1.0s, skippable).
 * Thin horizontal line draws across while a mono counter ticks 00 → 100,
 * resolving seamlessly into the hero scene.
 */
export function Preloader({ onComplete = () => {} }) {
  const shouldReduceMotion = useReducedMotionSafe();
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion) {
      onComplete();
      return;
    }

    const duration = 850; // ms
    const startTime = performance.now();

    const frame = (now) => {
      const elapsed = now - startTime;
      const pct = Math.min(Math.round((elapsed / duration) * 100), 100);
      setProgress(pct);

      if (pct < 100) {
        requestAnimationFrame(frame);
      } else {
        setTimeout(() => {
          setIsDone(true);
          onComplete();
        }, 120);
      }
    };

    const rAF = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rAF);
  }, [onComplete, shouldReduceMotion]);

  if (shouldReduceMotion) return null;

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
          className="pulse-preloader"
          onClick={() => {
            setIsDone(true);
            onComplete();
          }}
          title="Click to skip"
        >
          {/* Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="pulse-wordmark">PULSE</span>
            <span className="font-mono" style={{ fontSize: 'var(--fs-label)', color: 'var(--ink-45)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LiveDot size={6} />
              SYSTEM INITIALIZING
            </span>
          </div>

          {/* Center Graphic: Giant Mono Ticker & Line */}
          <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
              <span className="font-mono" style={{ fontSize: 'var(--fs-label)', letterSpacing: '0.12em', color: 'var(--ink-70)' }}>
                TELEMETRY LINK
              </span>
              <span className="font-mono font-bold" style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
                {String(progress).padStart(2, '0')}%
              </span>
            </div>

            <div className="pulse-preloader-bar">
              <div
                className="pulse-preloader-progress"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--fs-label)' }} className="font-mono">
            <span style={{ color: 'var(--ink-45)' }}>TECHFEST 2026</span>
            <span style={{ color: 'var(--ink-45)' }}>TAP TO SKIP →</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Preloader;
