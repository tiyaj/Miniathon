import React, { useState, useEffect } from 'react';
import '../styles/landing.css';
import '../pages/Overview/Overview.css';
import { activeEvent } from '../data/eventMock';
import { getDashboard } from '../lib/api';
import useLandingScroll from '../hooks/useLandingScroll';
import { RouteWipeProvider } from '../components/landing/RouteWipeTransition';

// Preloader & Navigation
import Preloader from '../components/landing/Preloader';
import LandingMenuPill from '../components/landing/LandingMenuPill';
import EventPanel from '../components/landing/EventPanel';
import DemoConsole from '../components/demo/DemoConsole';

// Section 1: Black Cinematic Landing Opening & Zone Strip
import ReferenceHero from '../components/landing/ReferenceHero';
import EventZoneSequence from '../components/landing/EventZoneSequence';

// Section 2: Re-skinned Dark Operational Sections
import LiveNumbers from '../components/landing/LiveNumbers';
import ZoneCoverage from '../components/landing/ZoneCoverage';
import VolunteerFlow from '../components/landing/VolunteerFlow';
import OperationsIndex from '../components/landing/OperationsIndex';
import EnterControl from '../components/landing/EnterControl';

// Section 3: Existing Command Center Integration (Pushed naturally below landing)
import { CinematicHero } from '../pages/Overview/components/CinematicHero';
import { LiveMetricsBar } from '../pages/Overview/components/LiveMetricsBar';
import { ZoneCoverageDeck } from '../pages/Overview/components/ZoneCoverageDeck';
import { AttentionDeck } from '../pages/Overview/components/AttentionDeck';
import { ActivityTimelineDeck } from '../pages/Overview/components/ActivityTimelineDeck';

/**
 * Landing Page (Route "/")
 * Meets all Master Prompt and Additional Update Requirements:
 * 1. Black Background (#000000)
 * 2. Prominent Enlarged Warm Cream Floating Cards (#F4F1EA)
 * 3. Extended Scrollable Area with Seamless Animation Choreography
 * 4. Pushes the Entire Existing Website and Command Center Below the Landing Page in Natural Page Flow
 * 5. Full Preservation of Existing Functionality, Components, and Routes
 * 6. Global Shift+D Demo Console with Dropout Recovery & Crowd Surge Escalation flows
 */
export function Landing() {
  const [activeZone, setActiveZone] = useState(null);
  const [showPreloader, setShowPreloader] = useState(true);
  const [isEventPanelOpen, setIsEventPanelOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  // Initialize smooth scrolling strictly scoped to landing page
  useLandingScroll(true);

  // Load live command center data for the integrated section below
  const loadDashboard = async () => {
    try {
      const res = await getDashboard();
      if (res.data) {
        setDashboardData(res.data);
      }
    } catch {
      // Graceful fallback to mock data
    }
  };

  useEffect(() => {
    loadDashboard();

    const handleRefresh = () => {
      loadDashboard();
    };

    window.addEventListener('pulse:refresh', handleRefresh);
    window.addEventListener('pulse:dropout-simulated', handleRefresh);
    window.addEventListener('pulse:surge-simulated', handleRefresh);

    return () => {
      window.removeEventListener('pulse:refresh', handleRefresh);
      window.removeEventListener('pulse:dropout-simulated', handleRefresh);
      window.removeEventListener('pulse:surge-simulated', handleRefresh);
    };
  }, []);

  const handleScrollToDeck = () => {
    const deck = document.getElementById('operational-command-center');
    if (deck) {
      if (window.__pulse_lenis) {
        window.__pulse_lenis.scrollTo(deck, { offset: -20, duration: 1.2 });
      } else {
        deck.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const {
    event = activeEvent,
    zones = [],
    attentionQueue = [],
    shifts = [],
    recentActivity = []
  } = dashboardData || {};

  return (
    <RouteWipeProvider>
      <div className="pulse-landing landing-dark" id="pulse-landing-root">
        {/* Global Demo Console triggered via Shift+D (§11.3) */}
        <DemoConsole />

        {/* Short skippable entrance preloader */}
        {showPreloader && (
          <Preloader onComplete={() => setShowPreloader(false)} />
        )}

        {/* Floating Menu Pill Navigation */}
        <LandingMenuPill onOpenEventPanel={() => setIsEventPanelOpen(true)} />

        {/* Sliding Event Panel Drawer */}
        <EventPanel
          isOpen={isEventPanelOpen}
          onClose={() => setIsEventPanelOpen(false)}
          eventData={activeEvent}
        />

        <main id="main-content">
          {/* =========================================================================
              PART 1: CINEMATIC LANDING PAGE (BLACK BACKGROUND, ENLARGED CREAM CARDS)
              ========================================================================= */}
          <ReferenceHero
            eventData={activeEvent}
            onOpenEventPanel={() => setIsEventPanelOpen(true)}
          />

          {/* PINNED HORIZONTAL ZONE STRIP (EXTENDED AREA) */}
          <EventZoneSequence />

          {/* 02 TELEMETRY PULSE */}
          <LiveNumbers eventData={activeEvent} />

          {/* 03 VECTOR STAFFING */}
          <ZoneCoverage
            eventData={activeEvent}
            activeZone={activeZone}
            onHoverZone={setActiveZone}
          />

          {/* TOPOLOGY & NETWORK */}
          <VolunteerFlow
            eventData={activeEvent}
            activeZone={activeZone}
            onHoverZone={setActiveZone}
          />

          {/* 05 OPERATIONAL ARCHITECTURE */}
          <OperationsIndex eventData={activeEvent} />

          {/* CLOSING CTA WITH ORBITAL ARCS */}
          <EnterControl />

          {/* =========================================================================
              PART 2: INTEGRATED COMMAND CENTER (NATURAL PAGE FLOW DIRECTLY BELOW)
              Continuous, seamless transition into the existing full application.
              Preserves all existing decks, interactions, and metrics.
              ========================================================================= */}
          <section
            id="operational-command-center"
            className="pulse-command-center-flow"
            style={{
              position: 'relative',
              zIndex: 20,
              backgroundColor: 'var(--bg-base, #060911)',
              borderTop: '1px solid #5a3cf0',
              boxShadow: '0 -30px 80px rgba(0, 0, 0, 0.9)',
              paddingTop: 'clamp(3rem, 6vw, 6rem)',
              paddingBottom: 'clamp(4rem, 8vw, 8rem)',
            }}
          >
            {/* Transition Seam Header */}
            <div
              className="pulse-container font-mono"
              style={{
                marginBottom: 'clamp(2rem, 4vw, 3.5rem)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                paddingBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 10px #10b981',
                  }}
                />
                <span style={{ fontSize: '0.82rem', color: '#FFFFFF', fontWeight: 700, letterSpacing: '0.12em' }}>
                  PULSE COMMAND CENTER // LIVE OPS VIEWPORT
                </span>
              </div>

              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '0.1em' }}>
                SEAMLESS APPLICATION CONTINUITY · TSEC TECHFEST
              </span>
            </div>

            <div className="pulse-container">
              {/* Existing Overview Decks Preserved Completely */}
              <div className="overview-page-wrapper" style={{ padding: 0 }}>
                {/* 1. Spatial Event Network Visual */}
                <CinematicHero
                  zones={zones}
                  event={event}
                  onScrollDown={handleScrollToDeck}
                />

                {/* 2. Real-time Telemetry Metrics Bar */}
                <div style={{ marginTop: 'var(--space-6, 24px)' }}>
                  <LiveMetricsBar data={dashboardData} />
                </div>

                {/* 3. Sector Quotas & Zone Coverage Deck */}
                <div style={{ marginTop: 'var(--space-6, 24px)' }}>
                  <ZoneCoverageDeck zones={zones} />
                </div>

                {/* 4. Attention Queue & Activity Timeline Stream */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 'var(--space-6, 24px)',
                    marginTop: 'var(--space-6, 24px)',
                  }}
                >
                  <AttentionDeck items={attentionQueue} />
                  <ActivityTimelineDeck activities={recentActivity} shifts={shifts} />
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </RouteWipeProvider>
  );
}

export default Landing;
