import React, { useState } from 'react';
import '../styles/landing.css';
import { activeEvent } from '../data/eventMock';
import useLandingScroll from '../hooks/useLandingScroll';
import { RouteWipeProvider } from '../components/landing/RouteWipeTransition';

// Preloader & Menu Pill Navigation
import Preloader from '../components/landing/Preloader';
import LandingMenuPill from '../components/landing/LandingMenuPill';
import EventPanel from '../components/landing/EventPanel';

// Chapter 1: Dark Cinematic Opening & Zone Strip
import ReferenceHero from '../components/landing/ReferenceHero';
import EventZoneSequence from '../components/landing/EventZoneSequence';

// Chapters 2–5: Re-skinned Dark Operational Sections
import LiveNumbers from '../components/landing/LiveNumbers';
import ZoneCoverage from '../components/landing/ZoneCoverage';
import VolunteerFlow from '../components/landing/VolunteerFlow';
import OperationsIndex from '../components/landing/OperationsIndex';
import EnterControl from '../components/landing/EnterControl';

/**
 * Landing Page (Route "/")
 * Cinematic, dark (#0a0a10), photography-led, motion-driven experience:
 * - Scoped Lenis + GSAP ScrollTrigger
 * - ReferenceHero matching scroll-0 frame:
 *   - Lower-center display headline in Archivo 900
 *   - Three.js WebGL CoordinationOrb (wireframe line loops, -23° orbit ring, traveling nodes)
 *   - 6 scattered perimeter photos + 2 below the fold
 *   - Fixed bottom-center Menu pill (+ handle) and top-left PULSE mark
 * - Pinned cinematic asymmetric zone strip with inner parallax
 * - Continuous dark re-skinned operational sections (02 Telemetry, 03 Staffing, Topology, 05 Architecture)
 * - Heavy-type closing with thin indigo orbital arcs
 * - Dark-to-cream wipe transition into the dashboard
 * - EventPanel full-height sliding dossier
 */
export function Landing() {
  const [activeZone, setActiveZone] = useState(null);
  const [showPreloader, setShowPreloader] = useState(true);
  const [isEventPanelOpen, setIsEventPanelOpen] = useState(false);

  // Initialize smooth scrolling wired to ScrollTrigger only on the landing page (§1)
  useLandingScroll(true);

  return (
    <RouteWipeProvider>
      <div className="pulse-landing landing-dark" id="pulse-landing-root">
        {/* Short skippable entrance preloader */}
        {showPreloader && (
          <Preloader onComplete={() => setShowPreloader(false)} />
        )}

        {/* Floating Menu Pill Navigation (§4.4, §6.1) */}
        <LandingMenuPill onOpenEventPanel={() => setIsEventPanelOpen(true)} />

        {/* Sliding Event Panel Drawer (§6.8) */}
        <EventPanel
          isOpen={isEventPanelOpen}
          onClose={() => setIsEventPanelOpen(false)}
          eventData={activeEvent}
        />

        <main id="main-content">
          {/* =========================================================================
              1. DARK ORBITAL HERO (§4, §6.2)
              ========================================================================= */}
          <ReferenceHero
            eventData={activeEvent}
            onOpenEventPanel={() => setIsEventPanelOpen(true)}
          />

          {/* =========================================================================
              2. PINNED CINEMATIC ZONE STRIP (§5.4, §5.5, §6.3)
              ========================================================================= */}
          <EventZoneSequence />

          {/* =========================================================================
              3. 02 TELEMETRY PULSE — DARK (§6.4)
              ========================================================================= */}
          <LiveNumbers eventData={activeEvent} />

          {/* =========================================================================
              4. 03 VECTOR STAFFING — DARK (§6.5)
              ========================================================================= */}
          <ZoneCoverage
            eventData={activeEvent}
            activeZone={activeZone}
            onHoverZone={setActiveZone}
          />

          {/* =========================================================================
              5. TOPOLOGY / NETWORK — ORBITAL MOTIF DARK (§6.6)
              ========================================================================= */}
          <VolunteerFlow
            eventData={activeEvent}
            activeZone={activeZone}
            onHoverZone={setActiveZone}
          />

          {/* =========================================================================
              6. 05 OPERATIONAL ARCHITECTURE — HAIRLINE TWO-COLUMN (§6.7)
              ========================================================================= */}
          <OperationsIndex eventData={activeEvent} />

          {/* =========================================================================
              7. CTA / FOOTER — HEAVY-TYPE CLOSING WITH ORBITAL ARCS (§6.9)
              ========================================================================= */}
          <EnterControl />
        </main>
      </div>
    </RouteWipeProvider>
  );
}

export default Landing;
