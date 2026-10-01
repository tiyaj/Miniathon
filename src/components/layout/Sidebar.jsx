import React from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GitPullRequestDraft,
  CheckSquare,
  AlertTriangle,
  Megaphone,
  Radio,
  Sliders,
  RefreshCw,
  ArrowLeft,
  Activity
} from 'lucide-react';
import LiveDot from '../landing/primitives/LiveDot';

export function Sidebar({
  isOpen = false,
  onClose = () => {},
  lastUpdated = 'Just now',
  onRefresh = () => {},
  refreshing = false
}) {
  const location = useLocation();

  const navItems = [
    {
      to: '/dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      to: '/volunteers',
      label: 'Volunteers',
      icon: Users,
      badge: null
    },
    {
      to: '/assignments',
      label: 'Assignments',
      icon: GitPullRequestDraft,
      badge: null
    },
    {
      to: '/tasks',
      label: 'Live Tasks',
      icon: CheckSquare,
      badge: '34'
    },
    {
      to: '/incidents',
      label: 'Incidents',
      icon: AlertTriangle,
      badge: '03',
      alert: true
    },
    {
      to: '/announcements',
      label: 'Announcements',
      icon: Megaphone,
      badge: null
    },
    {
      to: '/live-ops',
      label: 'Live Ops',
      icon: Radio,
      badge: 'Live'
    },
    {
      to: '/event-setup',
      label: 'Event Setup',
      icon: Sliders,
      badge: null
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--bg-overlay)',
            zIndex: 90,
            display: 'block'
          }}
          className="mobile-backdrop"
        />
      )}

      <aside
        style={{
          width: 'var(--sidebar-width)',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          background: 'var(--paper)',
          borderRight: '1px solid var(--hairline)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 95,
          transition: 'transform var(--transition-base)'
        }}
        className={`pulse-sidebar ${isOpen ? 'sidebar-open' : ''}`}
      >
        {/* Brand / Logo Area */}
        <div
          style={{
            height: 'var(--topbar-height)',
            padding: '0 var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--hairline)'
          }}
        >
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none'
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'var(--ink)',
                color: 'var(--paper)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '0px'
              }}
            >
              <Activity size={18} />
            </div>

            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.25rem',
                letterSpacing: '-0.03em',
                color: 'var(--ink)',
                lineHeight: 1
              }}
            >
              PULSE
            </span>
          </Link>

          <span
            className="font-mono"
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '2px 6px',
              background: 'var(--paper-raised)',
              color: 'var(--ink-70)',
              border: '1px solid var(--hairline)',
              letterSpacing: '0.08em'
            }}
          >
            COMMAND
          </span>
        </div>

        {/* Navigation Section */}
        <div style={{ flex: 1, padding: 'var(--space-4) var(--space-3)', overflowY: 'auto' }}>
          <div
            className="font-mono"
            style={{
              fontSize: '0.65rem',
              color: 'var(--ink-45)',
              letterSpacing: '0.14em',
              padding: '0 var(--space-3) 8px var(--space-3)',
              textTransform: 'uppercase'
            }}
          >
            OPERATIONS
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.to ||
                (item.to === '/dashboard' && (location.pathname === '/overview' || location.pathname === '/dashboard'));

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '9px 12px',
                    color: isActive ? 'var(--ink)' : 'var(--ink-70)',
                    background: isActive ? 'var(--paper-raised)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--pulse)' : '3px solid transparent',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.85rem',
                    transition: 'all var(--transition-fast)',
                    textDecoration: 'none'
                  }}
                  className="sidebar-nav-item"
                >
                  <Icon
                    size={17}
                    style={{
                      color: isActive ? 'var(--pulse)' : 'var(--ink-45)',
                      transition: 'color var(--transition-fast)'
                    }}
                  />
                  <span style={{ flex: 1, fontFamily: 'var(--font-ui)' }}>{item.label}</span>

                  {item.badge && (
                    <span
                      className="font-mono"
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        background: item.alert ? 'var(--pulse-weak)' : 'var(--paper-alt)',
                        color: item.alert ? 'var(--pulse)' : 'var(--ink-70)',
                        border: item.alert ? '1px solid var(--pulse-weak)' : '1px solid var(--hairline)'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Operations Status Area */}
        <div
          style={{
            padding: 'var(--space-4)',
            borderTop: '1px solid var(--hairline)',
            background: 'var(--paper-raised)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {/* Return to Landing Button */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px 12px',
              border: '1px solid var(--hairline-bold)',
              backgroundColor: 'var(--paper)',
              color: 'var(--ink)',
              fontSize: '0.75rem',
              fontWeight: 700,
              textDecoration: 'none'
            }}
            className="font-mono"
          >
            <ArrowLeft size={14} />
            <span>RETURN TO LANDING</span>
          </Link>

          {/* Sync Time & Telemetry */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.72rem',
              color: 'var(--ink-45)',
              padding: '0 2px'
            }}
            className="font-mono"
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LiveDot size={5} />
              SYNC: {lastUpdated}
            </span>

            <button
              onClick={onRefresh}
              title="Manual Telemetry Sync"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--ink-70)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '3px'
              }}
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
