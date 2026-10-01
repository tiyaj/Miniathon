import React, { useState } from 'react';
import { Activity, ShieldAlert, CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';

export function EventNetworkVisual({ zones = [], onSelectZone }) {
  const [activeZoneId, setActiveZoneId] = useState(null);

  // Default positions around the center (coordinates on a 600x420 virtual box)
  const zoneCoords = {
    'zone-entry': { x: 120, y: 100, label: 'Entry Gate', status: 'critical', sub: '2 Gaps' },
    'zone-reg': { x: 480, y: 95, label: 'Registration', status: 'warning', sub: '1 Gap' },
    'zone-stage': { x: 490, y: 310, label: 'Main Stage', status: 'healthy', sub: '5/5 Full' },
    'zone-parking': { x: 110, y: 315, label: 'Parking', status: 'info', sub: '+1 Over' },
    'zone-firstaid': { x: 300, y: 370, label: 'First Aid', status: 'healthy', sub: '2/2 Ready' }
  };

  const centerCoord = { x: 300, y: 200 };

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return '#f43f5e';
      case 'warning': return '#f59e0b';
      case 'info': return '#38bdf8';
      case 'healthy':
      default: return '#10b981';
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '640px',
        height: '420px',
        margin: '0 auto',
        userSelect: 'none'
      }}
      className="pulse-network-container"
    >
      {/* Background SVG Canvas for Concentric Orbits and Connection Lines */}
      <svg
        viewBox="0 0 600 420"
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          inset: 0,
          overflow: 'visible'
        }}
      >
        <defs>
          {/* Radial gradient for central glow */}
          <radialGradient id="centerOrbGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#4f46e5" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>

          {/* Linear gradient for connecting lines */}
          <linearGradient id="lineGradCritical" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="lineGradWarning" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="lineGradHealthy" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.7" />
          </linearGradient>

          <linearGradient id="lineGradInfo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* Faint Concentric Orbital Rings */}
        <circle
          cx={centerCoord.x}
          cy={centerCoord.y}
          r="80"
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <circle
          cx={centerCoord.x}
          cy={centerCoord.y}
          r="145"
          fill="none"
          stroke="rgba(99, 102, 241, 0.12)"
          strokeWidth="1"
        />
        <circle
          cx={centerCoord.x}
          cy={centerCoord.y}
          r="195"
          fill="none"
          stroke="rgba(255, 255, 255, 0.04)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />

        {/* Dynamic Vector Connection Lines */}
        {Object.entries(zoneCoords).map(([id, node]) => {
          let stroke = 'url(#lineGradHealthy)';
          if (node.status === 'critical') stroke = 'url(#lineGradCritical)';
          else if (node.status === 'warning') stroke = 'url(#lineGradWarning)';
          else if (node.status === 'info') stroke = 'url(#lineGradInfo)';

          const isActive = activeZoneId === id;

          return (
            <g key={`line-${id}`}>
              {/* Soft background line */}
              <line
                x1={centerCoord.x}
                y1={centerCoord.y}
                x2={node.x}
                y2={node.y}
                stroke={stroke}
                strokeWidth={isActive ? 2.5 : 1.2}
                strokeOpacity={isActive ? 1 : 0.65}
                strokeDasharray="4 4"
                style={{
                  animation: 'dashFlow 16s linear infinite',
                  transition: 'all var(--transition-fast)'
                }}
              />
              {/* Signal pulse packet traveling along line */}
              <circle
                r={isActive ? 3 : 2}
                fill={getStatusColor(node.status)}
                opacity={0.85}
              >
                <animateMotion
                  path={`M ${centerCoord.x} ${centerCoord.y} L ${node.x} ${node.y}`}
                  dur={node.status === 'critical' ? '2.2s' : '4s'}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          );
        })}

        {/* Central Ambient Glow */}
        <circle
          cx={centerCoord.x}
          cy={centerCoord.y}
          r="54"
          fill="url(#centerOrbGlow)"
          style={{ animation: 'pulseGlow 4s ease-in-out infinite' }}
        />
      </svg>

      {/* Central Command Core Node (HTML overlay for crisp typography and accessibility) */}
      <div
        style={{
          position: 'absolute',
          left: `${(centerCoord.x / 600) * 100}%`,
          top: `${(centerCoord.y / 420) * 100}%`,
          transform: 'translate(-50%, -50%)',
          width: '88px',
          height: '88px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(20, 29, 50, 0.95) 0%, rgba(9, 13, 24, 0.98) 100%)',
          border: '1.5px solid rgba(99, 102, 241, 0.6)',
          boxShadow: '0 0 28px rgba(99, 102, 241, 0.35), inset 0 0 16px rgba(99, 102, 241, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          cursor: 'pointer'
        }}
        title="PULSE Central Command Node"
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px #6366f1',
            marginBottom: '4px'
          }}
        >
          <Activity size={15} color="#ffffff" />
        </div>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: 'var(--text-primary)'
          }}
        >
          PULSE
        </span>
        <span style={{ fontSize: '0.58rem', color: '#818cf8', fontWeight: 600, letterSpacing: '0.04em' }}>
          CENTER
        </span>
      </div>

      {/* Floating Satellite Zone Nodes */}
      {Object.entries(zoneCoords).map(([id, node]) => {
        const isSelected = activeZoneId === id;
        const color = getStatusColor(node.status);
        const isCritical = node.status === 'critical';

        return (
          <div
            key={id}
            onMouseEnter={() => setActiveZoneId(id)}
            onMouseLeave={() => setActiveZoneId(null)}
            onClick={() => onSelectZone && onSelectZone(id)}
            style={{
              position: 'absolute',
              left: `${(node.x / 600) * 100}%`,
              top: `${(node.y / 420) * 100}%`,
              transform: isSelected ? 'translate(-50%, -50%) scale(1.06)' : 'translate(-50%, -50%)',
              zIndex: isSelected ? 20 : 15,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(15, 22, 38, 0.92)',
                backdropFilter: 'blur(12px)',
                border: isSelected ? `1.5px solid ${color}` : `1px solid ${color}44`,
                boxShadow: isSelected || isCritical ? `0 0 20px ${color}33` : 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {/* Glowing Beacon Indicator */}
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  boxShadow: `0 0 8px ${color}`,
                  display: 'inline-block',
                  animation: isCritical ? 'beaconPing 2s infinite' : 'none'
                }}
              />

              <div>
                <div
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.1
                  }}
                >
                  {node.label}
                </div>
                <div
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color,
                    marginTop: '2px',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {node.sub}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
