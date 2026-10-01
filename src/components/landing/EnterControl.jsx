import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Terminal } from 'lucide-react';
import { useRouteWipe } from './RouteWipeTransition';
import LiveDot from './primitives/LiveDot';
import { useReducedMotionSafe } from '../../hooks/useReducedMotionSafe';

/**
 * EnterControl (§6.9) — Closing CTA & Orbital Finale
 * - Huge centered heavy white statement in Archivo 900
 * - Single rounded pill CTA below it (white circular icon + text linking to Live Control via route wipe)
 * - Large thin indigo orbital arcs (#5a3cf0) bleeding in from bottom-left and right edges
 * - Small mono credit line bottom-left
 * - Compact pill of existing footer links bottom-right
 */
export function EnterControl() {
  const shouldReduceMotion = useReducedMotionSafe();
  const { wipeTo } = useRouteWipe();

  const footerLinks = [
    { label: 'OVERVIEW', path: '/dashboard' },
    { label: 'VOLUNTEERS', path: '/volunteers' },
    { label: 'ASSIGNMENTS', path: '/assignments' },
    { label: 'TASKS', path: '/tasks' },
  ];

  return (
    <section
      id="enter-control"
      className="pulse-section pulse-dark-section"
      style={{
        backgroundColor: '#0a0a10',
        color: '#FFFFFF',
        position: 'relative',
        zIndex: 14,
        minHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingTop: 'clamp(6rem, 10vw, 10rem)',
        paddingBottom: 'clamp(3rem, 6vw, 5rem)',
        overflow: 'hidden',
      }}
      aria-labelledby="enter-control-title"
    >
      {/* Large Thin Indigo Orbital Arcs Bleeding in From Edges (§6.9) */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          overflow: 'visible',
          zIndex: 1,
        }}
        aria-hidden="true"
      >
        {/* Bottom-Left Orbital Arc */}
        <ellipse
          cx="0"
          cy="90%"
          rx="520"
          ry="320"
          fill="none"
          stroke="#5a3cf0"
          strokeWidth="1.2"
          opacity="0.32"
          transform="rotate(-15, 0, 800)"
        />
        <ellipse
          cx="0"
          cy="90%"
          rx="680"
          ry="440"
          fill="none"
          stroke="#5a3cf0"
          strokeWidth="0.8"
          strokeDasharray="4 8"
          opacity="0.22"
        />

        {/* Bottom-Right Orbital Arc */}
        <ellipse
          cx="100%"
          cy="90%"
          rx="560"
          ry="340"
          fill="none"
          stroke="#5a3cf0"
          strokeWidth="1.2"
          opacity="0.32"
          transform="rotate(18, 1200, 800)"
        />
        <ellipse
          cx="100%"
          cy="90%"
          rx="720"
          ry="460"
          fill="none"
          stroke="#5a3cf0"
          strokeWidth="0.8"
          strokeDasharray="4 8"
          opacity="0.2"
        />
      </svg>

      <div className="pulse-container" style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
        {/* Top Status Pill */}
        <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div
            className="font-mono"
            style={{
              fontSize: '0.72rem',
              color: 'rgba(255, 255, 255, 0.6)',
              letterSpacing: '0.14em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              border: '1px solid rgba(90, 60, 240, 0.3)',
              backgroundColor: 'rgba(90, 60, 240, 0.08)',
              borderRadius: '2px',
            }}
          >
            <LiveDot size={6} />
            <span>COMMAND READY // 05 SECTORS SYNCHRONIZED</span>
          </div>
        </div>

        {/* Huge Centered Heavy White Statement (§6.9) */}
        <div style={{ maxWidth: '1300px', margin: '0 auto clamp(2.5rem, 5vw, 4rem) auto' }}>
          <h2
            id="enter-control-title"
            style={{
              fontFamily: "'Archivo', 'Archivo Black', sans-serif",
              fontVariationSettings: "'wdth' 125, 'wght' 900",
              fontWeight: 900,
              fontSize: 'clamp(2.8rem, 7.5vw, 7.8rem)',
              lineHeight: 0.9,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              color: '#FFFFFF',
              margin: 0,
            }}
          >
            READY WHEN THE
            <br />
            EVENT STARTS.
          </h2>
        </div>

        {/* Single Rounded Pill CTA Button (§6.9) */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          style={{ display: 'inline-block' }}
        >
          <button
            onClick={() => wipeTo('/dashboard')}
            id="enter-control-cta-pill"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#0a0a10',
              border: 'none',
              borderRadius: '999px',
              padding: 'clamp(14px, 1.8vw, 20px) clamp(28px, 3.5vw, 44px)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '14px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(0.95rem, 1.2vw, 1.2rem)',
              letterSpacing: '0.02em',
              boxShadow: '0 12px 35px rgba(0, 0, 0, 0.6), 0 0 24px rgba(255, 255, 255, 0.25)',
              transition: 'background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F5452C';
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(245, 69, 44, 0.5), 0 0 24px rgba(245, 69, 44, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.color = '#0a0a10';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.6), 0 0 24px rgba(255, 255, 255, 0.25)';
            }}
          >
            {/* White Circular Icon */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#0a0a10',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Terminal size={16} />
            </div>

            <span>ENTER LIVE CONTROL</span>
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>

      {/* Bottom Footer Line: Credit Left + Compact Links Pill Right (§6.9) */}
      <div
        className="pulse-container font-mono"
        style={{
          position: 'relative',
          zIndex: 10,
          marginTop: 'auto',
          paddingTop: 'clamp(3rem, 5vw, 5rem)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        {/* Credit Line Bottom-Left */}
        <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.12em' }}>
          <span>THADOMAL SHAHANI ENGINEERING COLLEGE</span>
          <span style={{ margin: '0 8px', opacity: 0.3 }}>·</span>
          <span>MUMBAI</span>
          <span style={{ margin: '0 8px', opacity: 0.3 }}>·</span>
          <span>TECHFEST 2026</span>
        </div>

        {/* Compact Pill of Existing Footer Links Bottom-Right */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(90, 60, 240, 0.3)',
            borderRadius: '999px',
          }}
        >
          {footerLinks.map((link, idx) => (
            <React.Fragment key={link.label}>
              <button
                onClick={() => wipeTo(link.path)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontSize: '0.72rem',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono, monospace)',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
                }}
              >
                {link.label}
              </button>
              {idx < footerLinks.length - 1 && (
                <span style={{ color: 'rgba(255, 255, 255, 0.2)', fontSize: '0.7rem' }}>/</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

export default EnterControl;
