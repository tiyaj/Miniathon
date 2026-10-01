import React, { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import { eventZones } from '../../data/eventZones';
import { useRouteWipe } from './RouteWipeTransition';
import { useReducedMotionSafe } from '../../hooks/useReducedMotionSafe';
import ZoneCaption from './ZoneCaption';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * TUNING CONFIG: EventZoneSequence (§5.4, §5.5, §6.3, Correction Patch §3)
 * - Container height: travel + window.innerHeight (dynamically computed, zero guesswork)
 * - Cards: 5 varied asymmetric cards (lead 58vw landscape, portrait 38vw, landscape 52vw, portrait 38vw, landscape 50vw)
 * - Radius: 1.5vw
 * - Card Height: clamp(580px, 98vh, 1080px)
 * - Gap: 4vw (3-5vw)
 * - Smoothness: GSAP ScrollTrigger scrub: 1 mapped linearly from 0 to -travel
 * - Last card ends flush with right edge; pin releases immediately after.
 * - Mobile / prefers-reduced-motion fallback to vertical stack.
 */
export function EventZoneSequence() {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const rowRef = useRef(null);
  const shouldReduceMotion = useReducedMotionSafe();
  const { wipeTo } = useRouteWipe();

  const [travelDistance, setTravelDistance] = useState(0);
  const [containerHeight, setContainerHeight] = useState('100vh');
  const [isMobile, setIsMobile] = useState(false);

  // Exact measurement of travel distance: row.scrollWidth - window.innerWidth
  const updateMetrics = useCallback(() => {
    if (typeof window === 'undefined') return;

    const mobileCheck = window.innerWidth < 768;
    setIsMobile(mobileCheck);

    if (mobileCheck || shouldReduceMotion) {
      setTravelDistance(0);
      setContainerHeight('auto');
      return;
    }

    if (!rowRef.current || !containerRef.current) return;

    const rowWidth = rowRef.current.scrollWidth;
    const windowW = window.innerWidth;
    const windowH = window.innerHeight;

    const travel = Math.max(0, rowWidth - windowW);
    setTravelDistance(travel);
    setContainerHeight(`${travel + windowH}px`);

    ScrollTrigger.refresh();
  }, [shouldReduceMotion]);

  // Measure on mount, window resize, and row size changes
  useEffect(() => {
    updateMetrics();

    const handleResize = () => {
      updateMetrics();
    };

    window.addEventListener('resize', handleResize, { passive: true });

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined' && rowRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateMetrics();
      });
      resizeObserver.observe(rowRef.current);
    }

    // Secondary refresh after font & layout settling
    const timer = setTimeout(updateMetrics, 250);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, [updateMetrics]);

  // GSAP ScrollTrigger animation for horizontal scrub
  useEffect(() => {
    if (shouldReduceMotion || isMobile || travelDistance <= 0) return;
    if (!containerRef.current || !rowRef.current) return;

    // Reset initial transform
    gsap.set(rowRef.current, { x: 0, force3D: true });

    const tween = gsap.fromTo(
      rowRef.current,
      { x: 0 },
      {
        x: -travelDistance,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: () => `+=${travelDistance}`,
          scrub: 1, // Smooth scrub: 1 with zero snapping
          invalidateOnRefresh: true,
        },
      }
    );

    return () => {
      tween.kill();
      if (tween.scrollTrigger) {
        tween.scrollTrigger.kill();
      }
    };
  }, [travelDistance, isMobile, shouldReduceMotion]);

  const isFallback = isMobile || shouldReduceMotion;

  return (
    <div
      ref={containerRef}
      id="event-zone-sequence"
      className="pulse-zone-sequence-container"
      style={{
        position: 'relative',
        backgroundColor: '#0a0a10',
        height: isFallback ? 'auto' : containerHeight,
        zIndex: 12,
        willChange: isFallback ? 'auto' : 'scroll-position',
      }}
    >
      {/* Viewport Stage (Sticky in desktop mode, normal flow in fallback) */}
      <div
        ref={stageRef}
        className="pulse-sticky-zone-stage"
        style={{
          position: isFallback ? 'relative' : 'sticky',
          top: 0,
          left: 0,
          width: '100%',
          height: isFallback ? 'auto' : '100vh',
          overflow: 'clip', // overflow: clip preserves position: sticky in all browsers
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: '#0a0a10',
          padding: isFallback ? '4rem 1.5rem' : '1vh 0',
        }}
      >
        {/* Top Dark Scrim (§10, C2) providing high contrast for top telemetry labels against bright photos */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '180px',
            background: 'linear-gradient(to bottom, rgba(7, 9, 19, 0.82) 0%, rgba(7, 9, 19, 0.42) 50%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 9,
          }}
          aria-hidden="true"
        />

        {/* Subtle Top Telemetry Strip — Positioned below fixed PULSE mark to eliminate C1 collision */}
        <div
          style={{
            position: isFallback ? 'relative' : 'absolute',
            top: isFallback ? 'auto' : 'clamp(74px, 8.5vh, 90px)',
            left: '3.3vw',
            right: '3.3vw',
            marginBottom: isFallback ? '2rem' : 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10,
            pointerEvents: 'none',
          }}
          className="font-mono"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 8px #10b981',
              }}
            />
            <span
              style={{
                fontSize: '0.72rem',
                color: 'rgba(255, 255, 255, 0.75)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
              }}
            >
              CHAPTER 02 // SECTOR MONITORING & COVERAGE
            </span>
          </div>

          <span
            style={{
              fontSize: '0.72rem',
              color: 'rgba(255, 255, 255, 0.75)',
              letterSpacing: '0.14em',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
            }}
          >
            {`${String(eventZones.length).padStart(2, '0')} ACTIVE SECTORS · ASYMMETRIC DEPLOYMENT`}
          </span>
        </div>

        {/* Horizontal Film Strip Track */}
        <div
          ref={rowRef}
          style={{
            display: 'flex',
            flexDirection: isFallback ? 'column' : 'row',
            alignItems: isFallback ? 'stretch' : 'center',
            flexWrap: isFallback ? 'wrap' : 'nowrap',
            gap: isFallback ? '2rem' : '4vw',
            paddingLeft: isFallback ? 0 : '3.3vw',
            paddingRight: isFallback ? 0 : '3.3vw',
            width: isFallback ? '100%' : 'max-content',
            willChange: isFallback ? 'auto' : 'transform',
          }}
          className="pulse-zone-strip-track"
        >
          {eventZones.map((zone, idx) => {
            const isFull = zone.staffed >= zone.required;
            const fillPct = Math.min(Math.round((zone.staffed / zone.required) * 100), 100);
            const isLead = idx === 0;

            // Card Widths: Lead 58vw landscape, others 38-52vw
            const cardWidth = isFallback
              ? '100%'
              : isLead
              ? 'clamp(340px, 58vw, 980px)'
              : zone.type === 'portrait'
              ? `clamp(280px, ${zone.widthVw}vw, 620px)`
              : `clamp(320px, ${zone.widthVw}vw, 860px)`;

            return (
              <div
                key={zone.id}
                className={`pulse-zone-card ${zone.type === 'portrait' ? 'is-portrait' : 'is-landscape'}`}
                onClick={() => wipeTo(zone.route)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    wipeTo(zone.route);
                  }
                }}
                style={{
                  position: 'relative',
                  width: cardWidth,
                  height: isFallback ? '520px' : 'clamp(580px, 98vh, 1080px)',
                  borderRadius: 'clamp(16px, 1.5vw, 24px)',
                  overflow: 'hidden',
                  flexShrink: 0,
                  backgroundColor: 'transparent',
                  border: 'none',
                  boxShadow: '0 30px 70px rgba(0, 0, 0, 0.9)',
                  cursor: 'pointer',
                  margin: isFallback ? 0 : '1vh 0',
                }}
                aria-label={`Open ${zone.name} zone: ${zone.status}`}
              >
                {/* Background Zone Photographic Imagery with Unified Cinematic Grade */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                  }}
                  className="pulse-zone-card-img-wrap"
                >
                  <img
                    src={zone.image}
                    alt={zone.name}
                    loading={isLead ? 'eager' : 'lazy'}
                    decoding="async"
                    onLoad={updateMetrics}
                    style={{
                      position: 'absolute',
                      top: '-4%',
                      left: 0,
                      width: '100%',
                      height: '108%', // allows ±4% inner image parallax
                      objectFit: 'cover',
                      display: 'block',
                      filter: 'contrast(1.08) saturate(1.1) brightness(0.9)',
                      transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    className="pulse-zone-card-img"
                  />
                </div>

                {/* Unified Film Grain Overlay (6-8% opacity, mix-blend-mode: overlay) */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    opacity: 0.07,
                    mixBlendMode: 'overlay',
                    zIndex: 2,
                  }}
                  aria-hidden="true"
                />

                {/* Soft Vignette Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    background: 'radial-gradient(circle at center, transparent 45%, rgba(10, 10, 16, 0.45) 100%)',
                    zIndex: 3,
                  }}
                  aria-hidden="true"
                />

                {/* Dark Gradient Scrim (~55%) behind text for impeccable legibility */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, transparent 0%, transparent 45%, rgba(10, 10, 16, 0.35) 60%, rgba(10, 10, 16, 0.94) 100%)',
                    pointerEvents: 'none',
                    zIndex: 4,
                  }}
                  aria-hidden="true"
                />

                {/* Card Content Overlay — Inset 3.3vw, bottom text raised >= 110px above viewport bottom to clear Menu pill */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '0 3.3vw clamp(110px, 13vh, 140px) 3.3vw',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    zIndex: 5,
                  }}
                >
                  {/* Left: Shared ZoneCaption (§5.2, §10) */}
                  <div style={{ maxWidth: '82%', width: '100%' }}>
                    <ZoneCaption
                      zoneIndex={zone.index}
                      zoneName={zone.name}
                      status={zone.status}
                      fillPct={fillPct}
                      isFull={isFull}
                      titleFontSize="clamp(2rem, 3.8vw, 3.8rem)"
                      showUnderline={false}
                    />
                  </div>

                  {/* Right: Round White Arrow Button (Inset 3.3vw) */}
                  <div
                    style={{
                      width: 'clamp(38px, 3.5vw, 48px)',
                      height: 'clamp(38px, 3.5vw, 48px)',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      color: '#0a0a10',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
                      transition: 'transform 0.25s ease, background-color 0.25s ease, color 0.25s ease',
                    }}
                    className="pulse-zone-arrow-btn"
                    aria-hidden="true"
                  >
                    <ArrowUpRight size={20} strokeWidth={2.5} />
                  </div>
                </div>

                {/* 2px Red/White Coverage Bar (Raised to clear Menu pill zone) */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 'clamp(102px, 12vh, 130px)',
                    left: '3.3vw',
                    right: '3.3vw',
                    width: 'calc(100% - 6.6vw)',
                    height: '2px',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    zIndex: 6,
                  }}
                  aria-hidden="true"
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${fillPct}%`,
                      backgroundColor: isFull ? '#FFFFFF' : '#F5452C',
                      boxShadow: isFull ? 'none' : '0 0 6px #F5452C',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default EventZoneSequence;
