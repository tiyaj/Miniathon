import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Terminal } from 'lucide-react';
import { useRouteWipe } from './RouteWipeTransition';
import LiveDot from './primitives/LiveDot';

/**
 * EnterControl (§6.9) — Closing CTA & Editorial Finale
 * Restored to original PULSE Cream / Ink / Vermilion styling:
 * - Cream background (#F3F0E8 / var(--paper))
 * - Huge centered heavy display headline in deep ink (#17150F)
 * - Single rounded pill CTA button: solid near-black (#17150F) hovering to vermilion red (#F5452C)
 * - Subtle warm orbital arcs bleeding in from bottom edges
 * - Editorial metadata credit line & navigation links pill
 */
export function EnterControl() {
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
      className="pulse-section"
      style={{
        backgroundColor: 'var(--paper, #F3F0E8)',
        color: 'var(--ink, #17150F)',
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
      {/* Subtle Orbital Arcs Bleeding in From Edges (§6.9) */}
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
          stroke="rgba(23, 21, 15, 0.08)"
          strokeWidth="1.2"
          transform="rotate(-15, 0, 800)"
        />
        <ellipse
          cx="0"
          cy="90%"
          rx="680"
          ry="440"
          fill="none"
          stroke="rgba(245, 69, 44, 0.18)"
          strokeWidth="0.8"
          strokeDasharray="4 8"
        />

        {/* Bottom-Right Orbital Arc */}
        <ellipse
          cx="100%"
          cy="90%"
          rx="560"
          ry="340"
          fill="none"
          stroke="rgba(23, 21, 15, 0.08)"
          strokeWidth="1.2"
          transform="rotate(18, 1200, 800)"
        />
        <ellipse
          cx="100%"
          cy="90%"
          rx="720"
          ry="460"
          fill="none"
          stroke="rgba(23, 21, 15, 0.06)"
          strokeWidth="0.8"
          strokeDasharray="4 8"
        />
      </svg>

      <div className="pulse-container" style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
        {/* Top Status Pill */}
        <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div
            className="font-mono"
            style={{
              fontSize: '0.72rem',
              color: 'var(--ink-70, rgba(23, 21, 15, 0.70))',
              letterSpacing: '0.14em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              border: '1px solid var(--hairline-bold, rgba(23, 21, 15, 0.22))',
              backgroundColor: 'var(--paper-raised, #ECE8DD)',
              borderRadius: '2px',
            }}
          >
            <LiveDot size={6} />
            <span>COMMAND READY // 05 SECTORS SYNCHRONIZED</span>
          </div>
        </div>

        {/* Huge Centered Heavy Display Headline */}
        <div style={{ maxWidth: '1300px', margin: '0 auto clamp(2.5rem, 5vw, 4rem) auto' }}>
          <h2
            id="enter-control-title"
            style={{
              fontFamily: "'Archivo', 'Archivo Black', 'Bricolage Grotesque', sans-serif",
              fontVariationSettings: "'wdth' 125, 'wght' 900",
              fontWeight: 900,
              fontSize: 'clamp(2.8rem, 7.5vw, 7.8rem)',
              lineHeight: 0.9,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              color: 'var(--ink, #17150F)',
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
              backgroundColor: 'var(--ink, #17150F)',
              color: '#FFFFFF',
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
              boxShadow: '0 12px 35px rgba(23, 21, 15, 0.35)',
              transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--pulse, #F5452C)';
              e.currentTarget.style.boxShadow = '0 14px 40px rgba(245, 69, 44, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--ink, #17150F)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(23, 21, 15, 0.35)';
            }}
          >
            {/* White Circular Icon */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
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

      {/* Bottom Footer Line: Credit Left + Compact Links Pill Right */}
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
        <div style={{ fontSize: '0.75rem', color: 'var(--ink-45, rgba(23, 21, 15, 0.45))', letterSpacing: '0.12em' }}>
          <span>THADOMAL SHAHANI ENGINEERING COLLEGE</span>
          <span style={{ margin: '0 8px', opacity: 0.3 }}>·</span>
          <span>MUMBAI</span>
          <span style={{ margin: '0 8px', opacity: 0.3 }}>·</span>
          <span>TECHFEST 2026</span>
        </div>

        {/* Compact Pill of Footer Links Bottom-Right */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            backgroundColor: 'var(--paper-raised, #ECE8DD)',
            border: '1px solid var(--hairline-bold, rgba(23, 21, 15, 0.22))',
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
                  color: 'var(--ink-70, rgba(23, 21, 15, 0.70))',
                  fontSize: '0.72rem',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono, monospace)',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--pulse, #F5452C)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--ink-70, rgba(23, 21, 15, 0.70))';
                }}
              >
                {link.label}
              </button>
              {idx < footerLinks.length - 1 && (
                <span style={{ color: 'var(--ink-25, rgba(23, 21, 15, 0.25))', fontSize: '0.7rem' }}>/</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

export default EnterControl;
