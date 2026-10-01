import React from 'react';
import { Link } from 'react-router-dom';
import Ticker from './primitives/Ticker';

/**
 * LandingFooter (§8.9)
 * Minimal editorial footer with app shortcuts, telemetry reprise, and metadata.
 */
export function LandingFooter({ eventData }) {
  const currentYear = new Date().getFullYear();

  const links = [
    { label: 'Command Overview', to: '/dashboard' },
    { label: 'Volunteer Roster', to: '/volunteers' },
    { label: 'Matching Engine', to: '/assignments' },
    { label: 'Live Operations', to: '/tasks' },
    { label: 'Event Setup', to: '/event-setup' },
  ];

  const tickerItems = eventData?.tickerItems || [
    'PULSE LIVE SYSTEM',
    'INK ON PAPER',
    'ZERO ARTIFACT LATENCY',
    'VERMILION SIGNAL ACTIVE',
    'ALL SECTORS MONITORED',
  ];

  return (
    <footer className="pulse-landing-footer" role="contentinfo">
      {/* Telemetry Reprise */}
      <div style={{ marginBottom: 'clamp(2.5rem, 5vw, 4rem)', borderBottom: '1px solid var(--hairline)', paddingBottom: '14px' }}>
        <Ticker items={tickerItems} speed={45} />
      </div>

      <div className="pulse-container">
        <div className="pulse-footer-grid">
          {/* Brand Column */}
          <div>
            <div className="pulse-wordmark" style={{ fontSize: '1.75rem', marginBottom: '14px' }}>
              PULSE
            </div>
            <p style={{ fontSize: 'var(--fs-small)', color: 'var(--ink-70)', maxWidth: '340px', lineHeight: 1.5 }}>
              Centralized nerve center for volunteer coordination, sector staffing, and live event operations.
            </p>
          </div>

          {/* Core Operations Links */}
          <div className="pulse-footer-links">
            <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--ink-45)', letterSpacing: '0.12em' }}>
              OPERATIONS
            </span>
            {links.slice(0, 3).map((l, i) => (
              <Link key={i} to={l.to}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Quick Platform Links */}
          <div className="pulse-footer-links">
            <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--ink-45)', letterSpacing: '0.12em' }}>
              TELEMETRY & SETUP
            </span>
            {links.slice(3).map((l, i) => (
              <Link key={i} to={l.to}>
                {l.label}
              </Link>
            ))}
            <a href="#hero">
              ↑ Back to Top
            </a>
          </div>
        </div>

        {/* Bottom Legal / Timestamp Bar */}
        <div className="pulse-footer-bottom">
          <div>
            © {currentYear} PULSE · LIVE EVENT COORDINATION PLATFORM
          </div>
          <div>
            DESIGNED FOR JUDGES & GROUND OPERATORS · TSEC TECHFEST
          </div>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
