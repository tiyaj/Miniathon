import React from 'react';

const PALETTE = [
  { bg: '#4338ca', name: 'indigo' }, // Indigo 700 (white contrast: 8.5:1)
  { bg: '#0f766e', name: 'teal' },   // Teal 700 (white contrast: 6.8:1)
  { bg: '#a16207', name: 'ochre' },  // Yellow/Amber 700 (white contrast: 5.1:1)
  { bg: '#701a75', name: 'plum' },   // Fuchsia 900 (white contrast: 9.8:1)
  { bg: '#334155', name: 'slate' }   // Slate 700 (white contrast: 7.2:1)
];

function getHashColor(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index].bg;
}

export function Avatar({
  name = '',
  initials,
  size = 36,
  statusDot, // 'checked-in' | 'assigned' | 'available' | 'on-break' | 'absent' | boolean
  className = '',
  style = {}
}) {
  const computedInitials =
    initials ||
    (name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : 'VO');

  const bgColor = getHashColor(name || computedInitials);

  const dotColorMap = {
    'checked-in': 'var(--mint)',
    'assigned': 'var(--ink-2)',
    'available': 'var(--sky)',
    'on-break': 'var(--amber)',
    'absent': 'var(--coral)'
  };

  const statusColor = typeof statusDot === 'string' ? dotColorMap[statusDot] || 'var(--mint)' : 'var(--mint)';

  return (
    <div
      className={`pulse-avatar ${className}`}
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        borderRadius: 'var(--radius)',
        backgroundColor: bgColor,
        color: '#ffffff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: size >= 44 ? '15px' : size >= 36 ? '12px' : '10px',
        fontWeight: 700,
        letterSpacing: '0.04em',
        boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.2)',
        userSelect: 'none',
        flexShrink: 0,
        ...style
      }}
      title={name}
      aria-label={name || computedInitials}
    >
      <span>{computedInitials}</span>

      {statusDot && (
        <span
          style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: statusColor,
            border: '2px solid var(--paper-raised)',
            boxSizing: 'content-box'
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default Avatar;
