import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  MapPin,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CinematicHero({ zones = [], event = {}, onScrollDown }) {
  const [hoveredZone, setHoveredZone] = useState(null);
  const navigate = useNavigate();

  // Spatial coordinates for the 5 zones around the central PULSE core
  // Responsive percentages relative to the container box
  const nodes = [
    {
      id: 'zone-entry',
      name: 'Entry Gate',
      sub: '2 Volunteer Gaps',
      status: 'critical',
      assigned: 2,
      required: 4,
      pos: { x: '16%', y: '26%' },
      svgTarget: { x: 160, y: 140 },
      color: '#f43f5e',
      glow: 'rgba(244, 63, 94, 0.45)',
      desc: 'Security turnstiles experiencing entry bottleneck'
    },
    {
      id: 'zone-reg',
      name: 'Registration',
      sub: '1 Volunteer Gap',
      status: 'warning',
      assigned: 3,
      required: 4,
      pos: { x: '84%', y: '24%' },
      svgTarget: { x: 840, y: 130 },
      color: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.45)',
      desc: 'Badge desk desk-3 awaiting replacement'
    },
    {
      id: 'zone-stage',
      name: 'Main Stage',
      sub: '5/5 Staffed (Optimal)',
      status: 'healthy',
      assigned: 5,
      required: 5,
      pos: { x: '82%', y: '72%' },
      svgTarget: { x: 820, y: 430 },
      color: '#10b981',
      glow: 'rgba(16, 185, 129, 0.4)',
      desc: 'AV acoustics & green room runners active'
    },
    {
      id: 'zone-parking',
      name: 'Parking & Shuttle',
      sub: '+1 Overstaffed',
      status: 'info',
      assigned: 4,
      required: 3,
      pos: { x: '18%', y: '74%' },
      svgTarget: { x: 180, y: 440 },
      color: '#38bdf8',
      glow: 'rgba(56, 189, 248, 0.4)',
      desc: 'North concourse traffic marshaling deployed'
    },
    {
      id: 'zone-firstaid',
      name: 'First Aid Post',
      sub: '2/2 Emergency Ready',
      status: 'healthy',
      assigned: 2,
      required: 2,
      pos: { x: '50%', y: '86%' },
      svgTarget: { x: 500, y: 520 },
      color: '#10b981',
      glow: 'rgba(16, 185, 129, 0.4)',
      desc: 'Red Cross medical team on standby radio-4'
    }
  ];

  const centerPoint = { x: 500, y: 300 };

  return (
    <section className="cinematic-hero-section">
      {/* Background Spatial Atmosphere */}
      <div className="spatial-atmosphere-layer" />

      {/* SVG Network Vector Canvas */}
      <svg
        viewBox="0 0 1000 600"
        className="spatial-network-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Radial gradient for central heart pulse */}
          <radialGradient id="heartbeatGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#4f46e5" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Concentric Heartbeat Radar Rings */}
        <motion.circle
          cx={centerPoint.x}
          cy={centerPoint.y}
          r="95"
          fill="none"
          stroke="rgba(99, 102, 241, 0.25)"
          strokeWidth="1.5"
          animate={{
            scale: [1, 1.45, 1.8],
            opacity: [0.6, 0.25, 0]
          }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: 'easeOut'
          }}
        />

        <motion.circle
          cx={centerPoint.x}
          cy={centerPoint.y}
          r="140"
          fill="none"
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />

        <motion.circle
          cx={centerPoint.x}
          cy={centerPoint.y}
          r="230"
          fill="none"
          stroke="rgba(99, 102, 241, 0.12)"
          strokeWidth="1"
        />

        <motion.circle
          cx={centerPoint.x}
          cy={centerPoint.y}
          r="320"
          fill="none"
          stroke="rgba(255, 255, 255, 0.03)"
          strokeWidth="1"
          strokeDasharray="6 8"
        />

        {/* Thin SVG Dynamic Connecting Lines to Nodes */}
        {nodes.map((node) => {
          const isHovered = hoveredZone === node.id;
          return (
            <g key={`svg-conn-${node.id}`}>
              {/* Background trace line */}
              <line
                x1={centerPoint.x}
                y1={centerPoint.y}
                x2={node.svgTarget.x}
                y2={node.svgTarget.y}
                stroke={isHovered ? node.color : 'rgba(99, 102, 241, 0.3)'}
                strokeWidth={isHovered ? 2.5 : 1.2}
                strokeDasharray="4 5"
                style={{
                  transition: 'stroke 0.25s, stroke-width 0.25s',
                  filter: isHovered ? `drop-shadow(0 0 6px ${node.color})` : 'none'
                }}
              />

              {/* Energy Packet Pulse moving along connecting line */}
              <circle r={isHovered ? 3.5 : 2.5} fill={node.color} opacity={0.9}>
                <animateMotion
                  path={`M ${centerPoint.x} ${centerPoint.y} L ${node.svgTarget.x} ${node.svgTarget.y}`}
                  dur={node.status === 'critical' ? '2.4s' : '4s'}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          );
        })}
      </svg>

      {/* Hero Spatial Container */}
      <div className="spatial-hero-content">
        {/* Top Operational Pill */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="hero-status-pill"
        >
          <span className="live-status-ping" />
          <span className="pill-highlight">LIVE SIMULATION</span>
          <span className="pill-divider">•</span>
          <span>{event.name || 'TSEC TechFest'}</span>
          <span className="pill-divider">•</span>
          <span className="pill-muted">{event.venue || 'Campus Event Grounds'}</span>
        </motion.div>

        {/* Large Centered Editorial Typography */}
        <div className="hero-editorial-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="hero-brand-pulse"
          >
            PULSE
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="hero-editorial-statement"
          >
            <span className="editorial-line">Every zone.</span>
            <span className="editorial-line">Every volunteer.</span>
            <span className="editorial-line editorial-accent">One live command center.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="hero-editorial-subtext"
          >
            The real-time heartbeat coordinating staffing, volunteer attendance, and zone coverage across the entire event.
          </motion.p>
        </div>

        {/* Floating Peripheral Orbital Nodes */}
        {nodes.map((node, index) => {
          const isHovered = hoveredZone === node.id;
          const isCritical = node.status === 'critical';

          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.7,
                delay: 0.3 + index * 0.1,
                ease: [0.16, 1, 0.3, 1]
              }}
              style={{
                left: node.pos.x,
                top: node.pos.y
              }}
              className={`orbital-zone-node ${isHovered ? 'node-active' : ''}`}
              onMouseEnter={() => setHoveredZone(node.id)}
              onMouseLeave={() => setHoveredZone(null)}
              onClick={() => navigate('/assignments')}
            >
              <div
                className="zone-node-card"
                style={{
                  borderColor: isHovered ? node.color : 'rgba(255, 255, 255, 0.08)',
                  boxShadow: isHovered || isCritical ? `0 0 24px ${node.glow}` : '0 4px 20px rgba(0, 0, 0, 0.4)'
                }}
              >
                {/* Glowing Pip */}
                <div
                  className="zone-node-pip"
                  style={{
                    backgroundColor: node.color,
                    boxShadow: `0 0 10px ${node.color}`
                  }}
                />

                <div className="zone-node-text">
                  <div className="zone-node-title">{node.name}</div>
                  <div className="zone-node-meta" style={{ color: node.color }}>
                    {node.sub}
                  </div>
                </div>

                <div className="zone-node-ratio">
                  <span>{node.assigned}</span>
                  <span className="ratio-sep">/</span>
                  <span className="ratio-req">{node.required}</span>
                </div>
              </div>

              {/* Floating Tooltip Detail on Hover */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                    className="zone-hover-popover"
                  >
                    <div className="popover-desc">{node.desc}</div>
                    <div className="popover-action">
                      <span>Inspect Staffing</span>
                      <ArrowUpRight size={12} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* Central PULSE Heartbeat Core Indicator */}
        <div className="pulse-core-beacon" title="PULSE Real-time Telemetry Core">
          <div className="core-beacon-glow" />
          <div className="core-beacon-inner">
            <Activity size={18} color="#ffffff" />
          </div>
          <span className="core-beacon-label">LIVE PULSE</span>
        </div>

        {/* Scroll Indicator Down to Operational Deck */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="hero-scroll-cue"
          onClick={onScrollDown}
        >
          <span className="cue-label">ENTER OPERATIONS DECK</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown size={18} color="var(--color-primary-light)" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
