import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouteWipe } from './RouteWipeTransition';
import LiveDot from './primitives/LiveDot';

/**
 * TUNING CONFIG: Menu Pill & Navigation Panel (§4.4, §6.1, Correction Patch §4)
 * Measured reference values:
 * - Width: ~15.3vw (min 230px, max 290px)
 * - Height: 64px
 * - Bottom offset: 37px above viewport bottom
 * - Radius: 6px
 * - Dark mode: solid #1b1b22 with white text
 * - Cream mode: solid #17150F with white text & crisp paper-contrast shadow
 * - Top PULSE mark flips from #FFFFFF to #17150F via IntersectionObserver
 * - Handle: 50x10px, 1.5px border, 15px above bottom
 */
const MENU_CONFIG = {
  width: 'clamp(230px, 15.3vw, 290px)',
  height: '64px',
  bottomOffset: '37px',
  radius: '6px',
  bgDark: '#1b1b22',
  bgCream: '#17150F',
  handleWidth: '50px',
  handleHeight: '10px',
  handleBottom: '15px',
};

export function LandingMenuPill() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreamInView, setIsCreamInView] = useState(false);
  const pillRef = useRef(null);
  const { wipeTo } = useRouteWipe();

  // IntersectionObserver to flip theme when cream section enters (§4)
  useEffect(() => {
    const creamEl = document.getElementById('cream-world') || document.getElementById('zone-coverage');
    if (!creamEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCreamInView(entry.isIntersecting);
      },
      {
        threshold: 0.05,
        rootMargin: '-60px 0px 0px 0px',
      }
    );

    observer.observe(creamEl);
    return () => observer.disconnect();
  }, []);

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (pillRef.current && !pillRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const navItems = [
    { label: 'EVENT', target: '#reference-hero' },
    { label: 'ZONES', target: '#event-zone-sequence' },
    { label: 'PULSE', target: '#live-numbers' },
    { label: 'STAFFING', target: '#zone-coverage' },
    { label: 'NETWORK', target: '#volunteer-flow' },
    { label: 'CONTROL', target: '#operations' },
    { label: 'DISPATCH', target: '#enter-control' },
  ];

  const handleNavClick = (item) => {
    setIsOpen(false);
    if (item.action) {
      item.action();
      return;
    }

    if (item.target) {
      if (window.__pulse_lenis) {
        window.__pulse_lenis.scrollTo(item.target, { offset: -20, duration: 1.2 });
      } else {
        const targetEl = document.querySelector(item.target);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <>
      {/* Top-Left Fixed PULSE Mark (§4, §6.1) - Theme flipped via IntersectionObserver */}
      <a
        href="#reference-hero"
        onClick={(e) => {
          e.preventDefault();
          if (window.__pulse_lenis) {
            window.__pulse_lenis.scrollTo(0, { duration: 1.2 });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        style={{
          position: 'fixed',
          top: '32px',
          left: 'clamp(1.5rem, 4vw, 3.5rem)',
          zIndex: 80,
          color: isCreamInView ? '#17150F' : '#FFFFFF',
          textDecoration: 'none',
          fontSize: '1.25rem',
          fontWeight: 900,
          letterSpacing: '-0.02em',
          fontFamily: "'Archivo', 'Archivo Black', sans-serif",
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'color 0.3s ease',
        }}
        aria-label="PULSE Home"
      >
        <span>PULSE</span>
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#F5452C',
            boxShadow: '0 0 8px #F5452C',
          }}
        />
      </a>

      {/* Floating Bottom Menu Pill and Handle Wrap */}
      <div
        ref={pillRef}
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 90,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        {/* Expanded Navigation Panel (Expands upward from pill) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.96 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: 'clamp(280px, 22vw, 340px)',
                backgroundColor: isCreamInView ? '#17150F' : '#16161e',
                border: isCreamInView ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: '8px',
                padding: '1.25rem',
                marginBottom: '12px',
                boxShadow: isCreamInView ? '0 20px 50px rgba(23, 21, 15, 0.4)' : '0 20px 50px rgba(0, 0, 0, 0.85)',
                pointerEvents: 'all',
              }}
              role="dialog"
              aria-label="Navigation Menu"
            >
              {/* Header Status in Panel */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '12px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  marginBottom: '12px',
                }}
                className="font-mono"
              >
                <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.55)', letterSpacing: '0.12em' }}>
                  PULSE // MENU
                </span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.72rem',
                    color: '#F5452C',
                    fontWeight: 700,
                  }}
                >
                  <LiveDot size={6} />
                  <span>EVENT ACTIVE</span>
                </div>
              </div>

              {/* Anchors List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {navItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNavClick(item)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'none',
                      border: 'none',
                      color: '#FFFFFF',
                      padding: '10px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      transition: 'background-color 0.2s ease, color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span>{item.label}</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.35)', fontSize: '0.8rem' }} className="font-mono">
                      0{idx + 1}
                    </span>
                  </button>
                ))}
              </div>

              {/* Primary Action Button to Enter Dashboard */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  wipeTo('/dashboard');
                }}
                style={{
                  width: '100%',
                  marginTop: '14px',
                  backgroundColor: '#FFFFFF',
                  color: '#07070c',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '12px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  letterSpacing: '0.12em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s ease, color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F5452C';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.color = '#07070c';
                }}
              >
                <span>ENTER LIVE CONTROL</span>
                <span>→</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fixed Menu Pill (§4.4) */}
        <button
          data-menu="true"
          onClick={() => setIsOpen((prev) => !prev)}
          style={{
            marginBottom: MENU_CONFIG.bottomOffset,
            width: MENU_CONFIG.width,
            height: MENU_CONFIG.height,
            backgroundColor: isCreamInView ? MENU_CONFIG.bgCream : MENU_CONFIG.bgDark,
            borderRadius: MENU_CONFIG.radius,
            border: isCreamInView ? '1px solid rgba(23, 21, 15, 0.25)' : '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: '26px',
            paddingRight: '22px',
            cursor: 'pointer',
            boxShadow: isCreamInView ? '0 12px 30px rgba(23, 21, 15, 0.22)' : '0 16px 36px rgba(0, 0, 0, 0.75)',
            pointerEvents: 'all',
            transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
          }}
          aria-expanded={isOpen}
          aria-label="Toggle navigation menu"
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = isCreamInView ? 'rgba(23, 21, 15, 0.5)' : 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = isCreamInView ? 'rgba(23, 21, 15, 0.25)' : 'rgba(255, 255, 255, 0.12)';
          }}
        >
          {/* "Menu" label left */}
          <span
            style={{
              color: '#FFFFFF',
              fontSize: '20px',
              fontWeight: 600,
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: '-0.01em',
            }}
          >
            Menu
          </span>

          {/* Two-line hamburger icon right: 32px wide, 2px lines, 8px gap */}
          <div
            style={{
              width: '32px',
              height: '14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                width: '32px',
                height: '2px',
                backgroundColor: '#FFFFFF',
                borderRadius: '1px',
                transition: 'transform 0.25s ease',
                transform: isOpen ? 'translateY(6px) rotate(45deg)' : 'none',
              }}
            />
            <span
              style={{
                width: '32px',
                height: '2px',
                backgroundColor: '#FFFFFF',
                borderRadius: '1px',
                transition: 'transform 0.25s ease',
                transform: isOpen ? 'translateY(-6px) rotate(-45deg)' : 'none',
              }}
            />
          </div>
        </button>

        {/* Small bottom handle: outlined pill 50x10px, 1.5px border white at 60%, 15px above bottom */}
        <div
          style={{
            position: 'fixed',
            bottom: MENU_CONFIG.handleBottom,
            left: '50%',
            transform: 'translateX(-50%)',
            width: MENU_CONFIG.handleWidth,
            height: MENU_CONFIG.handleHeight,
            borderRadius: '999px',
            border: isCreamInView ? '1.5px solid rgba(23, 21, 15, 0.45)' : '1.5px solid rgba(255, 255, 255, 0.6)',
            pointerEvents: 'none',
            zIndex: 91,
            transition: 'border-color 0.3s ease',
          }}
          aria-hidden="true"
        />
      </div>
    </>
  );
}

export default LandingMenuPill;
