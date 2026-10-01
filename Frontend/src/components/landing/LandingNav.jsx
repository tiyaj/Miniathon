import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LiveDot from './primitives/LiveDot';
import Magnetic from './primitives/Magnetic';

/**
 * LandingNav (§8.1 & §2.5 & §6)
 * Minimal fixed navigation header.
 * Automatically flips theme between light-on-dark (over dark opening & zone strip)
 * and ink-on-paper (over cream sections) using an IntersectionObserver on #dark-experience-wrapper.
 */
export function LandingNav({ statusPill = 'EVENT ACTIVE' }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Scroll condense detection
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // IntersectionObserver for dark wrapper (§6)
    const darkWrapper = document.getElementById('dark-experience-wrapper');
    if (!darkWrapper) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When dark wrapper is intersecting the top portion of viewport, nav is dark
        setIsDark(entry.isIntersecting);
      },
      {
        root: null,
        // Trigger right around navbar height
        rootMargin: '-60px 0px 0px 0px',
        threshold: 0,
      }
    );

    observer.observe(darkWrapper);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <header
      className={`pulse-landing-nav ${isScrolled ? 'is-scrolled' : ''} ${isDark ? 'nav-theme-dark' : 'nav-theme-cream'}`}
      role="banner"
      style={{
        zIndex: 100,
        backgroundColor: isScrolled
          ? isDark
            ? 'rgba(7, 7, 12, 0.88)'
            : 'rgba(243, 240, 232, 0.92)'
          : 'transparent',
        borderBottom: isScrolled
          ? isDark
            ? '1px solid rgba(255, 255, 255, 0.12)'
            : '1px solid var(--hairline)'
          : '1px solid transparent',
        backdropFilter: isScrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none',
      }}
    >
      {/* Brand Wordmark */}
      <a
        href="#reference-hero"
        className="pulse-wordmark"
        aria-label="PULSE Home"
        style={{
          color: isDark ? '#FFFFFF' : 'var(--ink)',
          transition: 'color 0.25s ease',
        }}
      >
        PULSE
      </a>

      {/* Right Controls */}
      <div className="pulse-nav-right">
        {/* Live Status Pill */}
        <div
          className="pulse-status-pill"
          aria-label="Event Status: Active"
          style={{
            color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'var(--ink-70)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'var(--hairline)',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(23, 21, 15, 0.02)',
            transition: 'color 0.25s ease, border-color 0.25s ease, background-color 0.25s ease',
          }}
        >
          <LiveDot size={7} />
          <span>{statusPill}</span>
        </div>

        {/* Primary CTA Button */}
        <Magnetic strength={0.22}>
          <Link
            to="/dashboard"
            className="pulse-btn-primary"
            id="nav-enter-control"
            style={{
              backgroundColor: isDark ? '#FFFFFF' : 'var(--ink)',
              color: isDark ? '#07070c' : 'var(--paper)',
              borderColor: isDark ? '#FFFFFF' : 'var(--ink)',
              transition: 'background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease',
            }}
          >
            <span>ENTER LIVE CONTROL</span>
            <span className="pulse-arrow" aria-hidden="true">→</span>
          </Link>
        </Magnetic>
      </div>
    </header>
  );
}

export default LandingNav;
