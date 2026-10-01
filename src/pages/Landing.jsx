import React, { useState } from 'react';
import '../styles/landing.css';
import { activeEvent } from '../data/eventMock';
import useLandingScroll from '../hooks/useLandingScroll';
import { RouteWipeProvider } from '../components/landing/RouteWipeTransition';

// Preloader & Navigation
import Preloader from '../components/landing/Preloader';
import LandingMenuPill from '../components/landing/LandingMenuPill';
import DemoConsole from '../components/demo/DemoConsole';

// Section 1 & 2: Dark World (Hero, Horizontal Zone Strip, 02 Telemetry Pulse)
import ReferenceHero from '../components/landing/ReferenceHero';
import EventZoneSequence from '../components/landing/EventZoneSequence';
import LiveNumbers from '../components/landing/LiveNumbers';

// Sections 03 Onward: Original Cream World (Restored Cream/Ink/Vermilion Design System)
import ZoneCoverage from '../components/landing/ZoneCoverage';
import VolunteerFlow from '../components/landing/VolunteerFlow';
import OperationsIndex from '../components/landing/OperationsIndex';
import EnterControl from '../components/landing/EnterControl';

/**
 * Landing Page (Route "/")
 * Strictly adheres to Final Page Flow:
 * 1. Dark orbital hero (lower-center headline over globe, scattered photos, Menu pill)
 * 2. Shortened transition into pinned horizontal zone strip (zero blank dark space)
 * 3. Pinned horizontal zone strip (dynamically computed travel, scrub: 1, exact pin release)
 * 4. 02 Telemetry Pulse (stays dark)
 * 5. Hard-edged cream panel entering over dark section with 1px PULSE-red hairline on the seam
 * 6. From 03 Vector Staffing onward: original PULSE cream tokens, text colors, rules, and red accent
 */
export function Landing() {
  const [activeZone, setActiveZone] = useState(null);
  const [showPreloader, setShowPreloader] = useState(true);

  // Initialize smooth scrolling strictly scoped to landing page
  useLandingScroll(true);

  return (
    <RouteWipeProvider>
      <div className="pulse-landing" id="pulse-landing-root">
        {/* Global Demo Console triggered via Shift+D (§11.3) */}
        <DemoConsole />

        {/* Short skippable entrance preloader */}
        {showPreloader && (
          <Preloader onComplete={() => setShowPreloader(false)} />
        )}

        {/* Floating Menu Pill Navigation (Theme-flipped via IntersectionObserver on cream entry) */}
        <LandingMenuPill />

        <main id="main-content">
          {/* =========================================================================
              PART 1: DARK WORLD (HERO + PINNED STRIP + 02 TELEMETRY PULSE)
              ========================================================================= */}
          <div className="pulse-dark-world" id="dark-opening-world">
            {/* HERO: Pure black background, headline over globe, floating cream cards */}
            <ReferenceHero
              eventData={activeEvent}
            />

            {/* PINNED HORIZONTAL ZONE STRIP: Exact travel, scrub:1, peeking neighbors */}
            <EventZoneSequence />

            {/* 02 TELEMETRY PULSE: Stays dark */}
            <LiveNumbers eventData={activeEvent} />
          </div>

          {/* =========================================================================
              PART 2: HARD-EDGED CREAM PANEL (03 VECTOR STAFFING ONWARD)
              Between 02 and 03: 1px PULSE-red hairline on the seam. No gradient fade.
              Original PULSE cream/black/red styling restored completely.
              ========================================================================= */}
          <div
            id="cream-world"
            className="pulse-cream-world"
            style={{
              position: 'relative',
              zIndex: 15,
              backgroundColor: 'var(--paper, #F3F0E8)',
              color: 'var(--ink, #17150F)',
              borderTop: '1px solid var(--pulse, #F5452C)', // 1px PULSE-red hairline on seam
            }}
          >
            {/* 03 VECTOR STAFFING: "EVERY ZONE. VISIBLE." */}
            <ZoneCoverage
              eventData={activeEvent}
              activeZone={activeZone}
              onHoverZone={setActiveZone}
            />

            {/* TOPOLOGY & NETWORK: "PEOPLE MAKE THE EVENT MOVE." */}
            <VolunteerFlow
              eventData={activeEvent}
              activeZone={activeZone}
              onHoverZone={setActiveZone}
            />

            {/* 05 OPERATIONAL ARCHITECTURE: "CONTROL THE CHAOS." */}
            <OperationsIndex eventData={activeEvent} />

            {/* CLOSING CTA WITH FOOTER: "READY WHEN THE EVENT STARTS." */}
            <EnterControl />
          </div>
        </main>
      </div>
    </RouteWipeProvider>
  );
}

export default Landing;
