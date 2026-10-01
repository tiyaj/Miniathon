import React, { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import { eventZones } from '../../data/eventZones';
import { useRouteWipe } from './RouteWipeTransition';
import { useReducedMotionSafe } from '../../hooks/useReducedMotionSafe';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * TUNING CONFIG: EventZoneSequence (§5.4, §5.5, §6.3, Correction Patch §3)
 * - Container height: travel + window.innerHeight (dynamically computed, zero guesswork)
 * - Cards: 5 varied asymmetric cards (lead 59vw landscape, portrait 38vw, landscape 52vw, portrait 36vw, landscape 50vw)
 * - Radius: 12px
 * - Card Height: clamp(520px, 84vh, 860px)
 * - Gap: 1.5vw
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
        backgroundColor: '#000000',
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
          backgroundColor: '#000000',
          padding: isFallback ? '4rem 1.5rem' : 0,
        }}
      >
        {/* Subtle Top Telemetry Strip */}
        <div
          style={{
            position: isFallback ? 'relative' : 'absolute',
            top: isFallback ? 'auto' : '3.5vh',
            left: 'clamp(1.5rem, 5vw, 4rem)',
            right: 'clamp(1.5rem, 5vw, 4rem)',
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
                color: 'rgba(255, 255, 255, 0.55)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              CHAPTER 02 // SECTOR MONITORING & COVERAGE
            </span>
          </div>

          <span
            style={{
              fontSize: '0.72rem',
              color: 'rgba(255, 255, 255, 0.45)',
              letterSpacing: '0.14em',
            }}
          >
            05 ACTIVE SECTORS · ASYMMETRIC DEPLOYMENT
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
            gap: isFallback ? '2rem' : '1.5vw',
            paddingLeft: isFallback ? 0 : 'clamp(2rem, 5vw, 4rem)',
            paddingRight: isFallback ? 0 : 'clamp(2rem, 5vw, 4rem)',
            width: isFallback ? '100%' : 'max-content',
            willChange: isFallback ? 'auto' : 'transform',
          }}
          className="pulse-zone-strip-track"
        >
          {eventZones.map((zone, idx) => {
            const isFull = zone.staffed >= zone.required;
            const fillPct = Math.min(Math.round((zone.staffed / zone.required) * 100), 100);
            const isLead = idx === 0;

            // Card Widths: Lead 59vw landscape, others 36-52vw
            const cardWidth = isFallback
              ? '100%'
              : isLead
              ? 'clamp(320px, 59vw, 980px)'
              : zone.type === 'portrait'
              ? `clamp(280px, ${zone.widthVw}vw, 600px)`
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
                  height: isFallback ? '500px' : 'clamp(520px, 84vh, 860px)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  backgroundColor: '#0e0e18',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85)',
                  cursor: 'pointer',
                }}
                aria-label={`Open ${zone.name} zone: ${zone.status}`}
              >
                {/* Background Zone Imagery */}
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
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    className="pulse-zone-card-img"
                  />
                </div>

                {/* Dark Gradient Scrim (55%) for text legibility */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(10, 10, 16, 0.05) 0%, rgba(10, 10, 16, 0.35) 45%, rgba(10, 10, 16, 0.94) 100%)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Card Content Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: 'clamp(1.25rem, 3vw, 2.75rem)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    zIndex: 5,
                  }}
                >
                  {/* Left: Eyebrow + Huge Zone Name + Coverage */}
                  <div style={{ maxWidth: '82%' }}>
                    <span
                      className="font-mono"
                      style={{
                        fontSize: '0.72rem',
                        color: 'rgba(255, 255, 255, 0.7)',
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: '6px',
                        fontWeight: 700,
                      }}
                    >
                      ZONE {zone.index}
                    </span>

                    <h3
                      style={{
                        fontFamily: "'Archivo', 'Archivo Black', sans-serif",
                        fontSize: 'clamp(2rem, 3.8vw, 3.8rem)',
                        fontWeight: 900,
                        letterSpacing: '-0.02em',
                        lineHeight: 0.94,
                        color: '#FFFFFF',
                        margin: '0 0 10px 0',
                        textTransform: 'uppercase',
                      }}
                    >
                      {zone.name}
                    </h3>

                    <div
                      className="font-mono"
                      style={{
                        fontSize: 'clamp(0.75rem, 0.9vw, 0.88rem)',
                        color: isFull ? 'rgba(255, 255, 255, 0.85)' : '#ff6b55',
                        letterSpacing: '0.08em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 600,
                      }}
                    >
                      <span>{zone.status}</span>
                    </div>
                  </div>

                  {/* Right: Round White Arrow Button */}
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
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                      transition: 'transform 0.25s ease, background-color 0.25s ease, color 0.25s ease',
                    }}
                    className="pulse-zone-arrow-btn"
                    aria-hidden="true"
                  >
                    <ArrowUpRight size={20} strokeWidth={2.5} />
                  </div>
                </div>

                {/* 2px Coverage Bar at Card's Bottom Edge */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
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
