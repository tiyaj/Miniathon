import React, { useRef, useEffect, useState, useMemo } from 'react';
import gsap from 'gsap';
import { ArrowUpRight } from 'lucide-react';
import { heroPhotos } from '../../data/heroPhotos';
import { eventZones } from '../../data/eventZones';
import { useRouteWipe } from './RouteWipeTransition';
import { useReducedMotionSafe } from '../../hooks/useReducedMotionSafe';
import ZoneCaption from './ZoneCaption';

/**
 * HeroPhotoCards (§5, §6, §7, §8, §9)
 * Renders 6 real documentary event photography cards in outer gutters/corners.
 * Features:
 * - Slim cream frame (~5px, radius 18px)
 * - Chapter 02-style ZoneCaption + 2px progress underline
 * - Pure WebP offline responsive assets
 * - GSAP intro entrance + clamped idle float & mouse parallax
 * - Clear >= 24px clearance from keep-out rectangles
 * - Responsive desktop slots, tablet corner shrink, mobile 2x2 grid
 */
export function HeroPhotoCards() {
  const containerRef = useRef(null);
  const cardRefs = useRef([]);
  const cardWrapperRefs = useRef([]);
  const shouldReduceMotion = useReducedMotionSafe();
  const { wipeTo } = useRouteWipe();

  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );

  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth >= 768 && viewportWidth < 1200;

  // Track window resize
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Merge runtime zone data (volunteers / coverage) from eventZones if available
  const cardsData = useMemo(() => {
    return heroPhotos.map((item) => {
      const match = eventZones.find((z) => z.id === item.zoneId);
      const staffed = match ? match.staffed : item.staffed;
      const required = match ? match.required : item.required;
      const gap = Math.max(0, required - staffed);
      const isFull = gap === 0;
      const fillPct = Math.min(Math.round((staffed / required) * 100), 100);
      const status = isFull
        ? `${String(staffed).padStart(2, '0')} / ${String(required).padStart(2, '0')} · FULL COVERAGE`
        : `${String(staffed).padStart(2, '0')} / ${String(required).padStart(2, '0')} · GAP ${gap}`;

      return {
        ...item,
        staffed,
        required,
        gap,
        isFull,
        fillPct,
        status,
        route: match ? match.route : item.route,
      };
    });
  }, []);

  // GSAP Intro Entrance & Parallax Motion (§8)
  useEffect(() => {
    if (shouldReduceMotion || isMobile) return;

    const cards = cardWrapperRefs.current.filter(Boolean);
    if (cards.length === 0) return;

    // Intro timeline (~2s total, cards enter from outer margins)
    const ctx = gsap.context(() => {
      cards.forEach((cardEl, idx) => {
        const item = cardsData[idx];
        if (!item) return;

        // Determine entrance direction from nearest screen edge
        const isLeft = parseFloat(item.left) < 50;
        const fromX = isLeft ? -70 : 70;
        const fromY = item.top && parseFloat(item.top) > 50 ? 50 : -50;
        const targetRot = item.rotate || 0;

        gsap.fromTo(
          cardEl,
          {
            x: fromX,
            y: fromY,
            rotation: targetRot + (isLeft ? -4 : 4),
            opacity: 0,
          },
          {
            x: 0,
            y: 0,
            rotation: targetRot,
            opacity: item.isSmallFar ? 0.85 : 1,
            duration: 1.1,
            delay: 0.4 + idx * 0.1,
            ease: 'expo.out',
            clearProps: 'willChange',
          }
        );
      });

      // Idle float sine loop (6-9s period, clamped ±8px)
      cards.forEach((cardEl, idx) => {
        const duration = 6.5 + (idx % 3) * 1.2;
        const delay = (idx * 0.7) % 3;

        gsap.to(cardEl, {
          y: '+=8',
          rotation: `+=${idx % 2 === 0 ? 0.8 : -0.8}`,
          duration: duration / 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay,
        });
      });
    }, containerRef);

    // Mouse Parallax (≤ ±14px * depth factor via smooth interpolation)
    let mouseX = 0;
    let mouseY = 0;
    let animFrame;

    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Smooth render tick for parallax offset
    const parallaxTick = () => {
      cards.forEach((cardEl, idx) => {
        const item = cardsData[idx];
        if (!item || !cardEl) return;
        const depth = item.depth || 0.8;
        const targetX = mouseX * 12 * depth;
        const targetY = mouseY * 12 * depth;

        // Apply gentle parallax on inner element
        gsap.to(cardEl, {
          x: targetX,
          y: targetY,
          duration: 0.6,
          ease: 'power1.out',
          overwrite: 'auto',
        });
      });
      animFrame = requestAnimationFrame(parallaxTick);
    };

    animFrame = requestAnimationFrame(parallaxTick);

    // Pause animation when tab is hidden (§8)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        gsap.globalTimeline.pause();
        cancelAnimationFrame(animFrame);
      } else {
        gsap.globalTimeline.resume();
        animFrame = requestAnimationFrame(parallaxTick);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      ctx.revert();
      cancelAnimationFrame(animFrame);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [shouldReduceMotion, isMobile, cardsData]);

  // Click handler to smooth-scroll to zone or route
  const handleCardClick = (card) => {
    const chapter02 = document.getElementById('event-zone-sequence');
    if (chapter02) {
      chapter02.scrollIntoView({ behavior: 'smooth' });
    } else if (card.route) {
      wipeTo(card.route);
    }
  };

  return (
    <div
      ref={containerRef}
      className="pulse-hero-cards-container"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'box-none',
        zIndex: 2, // Layer 2 (behind headline layer 4, above globe layer 1)
        overflow: 'visible',
      }}
    >
      {/* Desktop & Tablet Floating Slot Cards */}
      {!isMobile && (
        <>
          {cardsData.map((card, idx) => {
            // Tablet hides E and F (small far cards)
            if (isTablet && card.isSmallFar) return null;

            // Slot adjustments for tablet (768-1199px)
            let leftPos = card.left;
            let topPos = card.top;
            let widthStyle = card.width;

            if (isTablet) {
              if (card.cardKey === 'A') {
                leftPos = '2%';
                topPos = '12%';
                widthStyle = 'clamp(95px, 11vw, 130px)';
              } else if (card.cardKey === 'B') {
                leftPos = '3%';
                topPos = '67%';
                widthStyle = 'clamp(85px, 10vw, 120px)';
              } else if (card.cardKey === 'C') {
                leftPos = '84%';
                topPos = '12%';
                widthStyle = 'clamp(100px, 12vw, 140px)';
              } else if (card.cardKey === 'D') {
                leftPos = '84%';
                topPos = '67%';
                widthStyle = 'clamp(85px, 10.5vw, 130px)';
              }
            }

            const isHovered = hoveredCardId === card.id;
            const isSiblingDimmed = hoveredCardId !== null && !isHovered;

            return (
              <div
                key={card.id}
                ref={(el) => (cardWrapperRefs.current[idx] = el)}
                data-hero-card={card.zoneId}
                style={{
                  position: 'absolute',
                  left: leftPos,
                  top: topPos,
                  width: widthStyle,
                  aspectRatio: card.ratio,
                  pointerEvents: 'auto',
                  transformOrigin: 'center center',
                  zIndex: card.isSmallFar ? 2 : 3,
                  opacity: isSiblingDimmed ? 0.7 : card.isSmallFar ? 0.85 : 1,
                  transition: 'opacity 0.25s ease',
                }}
              >
                <button
                  type="button"
                  ref={(el) => (cardRefs.current[idx] = el)}
                  onClick={() => handleCardClick(card)}
                  onMouseEnter={() => setHoveredCardId(card.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  onFocus={() => setHoveredCardId(card.id)}
                  onBlur={() => setHoveredCardId(null)}
                  aria-label={`${card.name}, ${card.staffed} of ${card.required} volunteers, ${card.isFull ? 'full coverage' : `gap ${card.gap}`}. Go to zone.`}
                  style={{
                    width: '100%',
                    height: '100%',
                    padding: '5px', // Slim ~5px cream frame (§5.2)
                    borderRadius: '18px',
                    backgroundColor: '#F4F1EA', // Warm cream frame
                    boxShadow: isHovered
                      ? '0 26px 50px rgba(0, 0, 0, 0.85), 0 0 24px rgba(244, 241, 234, 0.22)'
                      : '0 16px 36px rgba(0, 0, 0, 0.65)',
                    border: '1px solid rgba(244, 241, 234, 0.45)',
                    cursor: 'pointer',
                    display: 'block',
                    position: 'relative',
                    textAlign: 'left',
                    transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                    transition:
                      'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease',
                    outline: 'none',
                  }}
                  className="pulse-hero-card-button"
                >
                  {/* Inner Photo & Scrim Container */}
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '13px',
                      overflow: 'hidden',
                      position: 'relative',
                      backgroundColor: '#0a0a10',
                    }}
                  >
                    {/* Documentary Photo Image */}
                    <img
                      src={card.src960}
                      srcSet={`${card.src640} 640w, ${card.src960} 960w`}
                      sizes="(max-width: 1200px) 15vw, 20vw"
                      alt={card.alt}
                      width={card.widthPx}
                      height={card.heightPx}
                      loading={card.loading}
                      fetchPriority={card.fetchpriority}
                      decoding="async"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: card.focal || '50% 35%',
                        display: 'block',
                        transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                        transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />

                    {/* Bottom Scrim (Cheap gradient, no filter) (§5.2) */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(to top, rgba(7, 9, 19, 0.90) 0%, rgba(7, 9, 19, 0.42) 42%, transparent 72%)',
                        pointerEvents: 'none',
                        zIndex: 2,
                      }}
                      aria-hidden="true"
                    />

                    {/* Floating Arrow Badge (fades in on hover/focus) */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: '#FFFFFF',
                        color: '#070913',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 4,
                        opacity: isHovered ? 1 : 0,
                        transform: isHovered ? 'scale(1)' : 'scale(0.8)',
                        transition: 'opacity 0.2s ease, transform 0.2s ease',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
                        pointerEvents: 'none',
                      }}
                      aria-hidden="true"
                    >
                      <ArrowUpRight size={15} strokeWidth={2.5} />
                    </div>

                    {/* Bottom Zone Caption Overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '10px',
                        right: '10px',
                        zIndex: 3,
                        pointerEvents: 'none',
                      }}
                    >
                      <ZoneCaption
                        zoneIndex={card.zoneNo}
                        zoneName={card.name}
                        status={card.status}
                        fillPct={card.fillPct}
                        isFull={card.isFull}
                        isSmall={card.isSmallFar}
                        titleFontSize={
                          card.isSmallFar
                            ? 'clamp(11px, 1.1vw, 13px)'
                            : 'clamp(13px, 1.35vw, 19px)'
                        }
                        showUnderline={!card.isSmallFar}
                      />
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </>
      )}

      {/* Mobile 2x2 Grid (§9) (< 768px) positioned cleanly below the centered headline */}
      {isMobile && (
        <div
          style={{
            position: 'absolute',
            bottom: '95px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 2rem)',
            maxWidth: '380px',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
            zIndex: 3,
            pointerEvents: 'auto',
          }}
        >
          {cardsData.slice(0, 4).map((card) => (
            <div
              key={card.id}
              data-hero-card={card.zoneId}
              style={{
                width: '100%',
                aspectRatio: '4/3',
              }}
            >
              <button
                type="button"
                onClick={() => handleCardClick(card)}
                aria-label={`${card.name}, ${card.staffed} of ${card.required} volunteers. Go to zone.`}
                style={{
                  width: '100%',
                  height: '100%',
                  padding: '4px',
                  borderRadius: '12px',
                  backgroundColor: '#F4F1EA',
                  border: '1px solid rgba(244, 241, 234, 0.4)',
                  cursor: 'pointer',
                  display: 'block',
                  position: 'relative',
                  textAlign: 'left',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.7)',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    position: 'relative',
                    backgroundColor: '#0a0a10',
                  }}
                >
                  <img
                    src={card.src640}
                    alt={card.alt}
                    width={card.widthPx}
                    height={card.heightPx}
                    loading="eager"
                    decoding="async"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: card.focal || '50% 35%',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(to top, rgba(7, 9, 19, 0.92) 0%, rgba(7, 9, 19, 0.4) 50%, transparent 80%)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '6px',
                      left: '8px',
                      right: '8px',
                      zIndex: 3,
                    }}
                  >
                    <ZoneCaption
                      zoneIndex={card.zoneNo}
                      zoneName={card.name}
                      status={card.status}
                      fillPct={card.fillPct}
                      isFull={card.isFull}
                      isSmall={true}
                      titleFontSize="12px"
                      showUnderline={false}
                    />
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HeroPhotoCards;
