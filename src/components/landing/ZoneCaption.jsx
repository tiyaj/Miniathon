import React from 'react';

/**
 * ZoneCaption (§5.2, §10)
 * Shared caption & progress underline component used across Hero cards and Chapter 02 panels.
 * Ensures typography, mono tracking, status badges, and 2px progress underline never drift apart.
 */
export function ZoneCaption({
  zoneIndex = '01',
  zoneName = '',
  status = '',
  fillPct = 100,
  isFull = true,
  isSmall = false,
  titleFontSize = 'clamp(14px, 1.5vw, 26px)',
  showUnderline = true,
  className = '',
}) {
  return (
    <div className={`pulse-zone-caption-root ${className}`} style={{ width: '100%', position: 'relative' }}>
      {/* Zone Eyebrow */}
      <span
        className="font-mono"
        style={{
          fontSize: '10.5px',
          color: 'rgba(255, 255, 255, 0.7)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: '4px',
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        ZONE {zoneIndex}
      </span>

      {/* Zone Display Name */}
      <h3
        style={{
          fontFamily: "'Archivo', 'Archivo Black', 'Bricolage Grotesque', sans-serif",
          fontSize: titleFontSize,
          fontWeight: 900,
          letterSpacing: '-0.02em',
          lineHeight: 0.96,
          color: '#FFFFFF',
          margin: isSmall ? '0' : '0 0 6px 0',
          textTransform: 'uppercase',
          textWrap: 'balance',
        }}
      >
        {zoneName}
      </h3>

      {/* Coverage Status Line (hidden for small cards E/F) */}
      {!isSmall && status && (
        <div
          className="font-mono"
          style={{
            fontSize: 'clamp(0.72rem, 0.85vw, 0.82rem)',
            color: isFull ? 'rgba(255, 255, 255, 0.85)' : '#ff6b55',
            letterSpacing: '0.08em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 600,
            marginBottom: showUnderline ? '8px' : 0,
          }}
        >
          <span>{status}</span>
        </div>
      )}

      {/* 2px Progress Underline */}
      {!isSmall && showUnderline && (
        <div
          style={{
            width: '100%',
            height: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '1px',
          }}
          aria-hidden="true"
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(Math.max(fillPct, 0), 100)}%`,
              backgroundColor: isFull ? '#FFFFFF' : '#F5452C',
              boxShadow: isFull ? 'none' : '0 0 6px #F5452C',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      )}
    </div>
  );
}

export default ZoneCaption;
