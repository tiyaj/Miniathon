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
  ArrowLeft,
  Activity
} from 'lucide-react';
import { SyncIndicator } from '../ui/SyncIndicator';

export function Sidebar({
  isOpen = false,
  onClose = () => {},
  lastSyncTime = new Date(),
  onRefresh = () => {},
  refreshing = false,
  syncFailed = false
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
      badge: '34',
      badgeType: 'neutral'
    },
    {
      to: '/incidents',
      label: 'Incidents',
      icon: AlertTriangle,
      badge: '03',
      badgeType: 'coral'
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
      badge: 'LIVE',
      badgeType: 'mint'
    },
    {
      to: '/event-setup',
      label: 'Event Setup',
      icon: Sliders,
      badge: null
    }
  ];

  const renderBadge = (item) => {
    if (!item.badge) return null;

    if (item.badgeType === 'coral') {
      return (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 700,
            padding: '1px 6px',
            backgroundColor: 'var(--coral-bg)',
            color: 'var(--coral-ink)',
            border: '1px solid var(--coral)',
            borderRadius: 'var(--radius)',
            lineHeight: 1.2
          }}
        >
          {item.badge}
        </span>
      );
    }

    if (item.badgeType === 'mint') {
      return (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 700,
            padding: '1px 6px',
            backgroundColor: 'var(--mint-bg)',
            color: 'var(--mint-ink)',
            border: '1px solid rgba(31, 160, 110, 0.35)',
            borderRadius: 'var(--radius)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            lineHeight: 1.2
          }}
        >
          <span
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: 'var(--mint)'
            }}
            aria-hidden="true"
          />
          {item.badge}
        </span>
      );
    }

    return (
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          fontWeight: 700,
          padding: '1px 6px',
          backgroundColor: 'var(--paper-sunken)',
          color: 'var(--ink)',
          border: '1px solid var(--line-strong)',
          borderRadius: 'var(--radius)',
          lineHeight: 1.2
        }}
      >
        {item.badge}
      </span>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--bg-overlay)',
            zIndex: 90
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
          backgroundColor: 'var(--paper)',
          borderRight: '1px solid var(--line-strong)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 95,
          transition: 'transform var(--dur-base) var(--ease-out)'
        }}
        className={`pulse-sidebar ${isOpen ? 'sidebar-open' : ''}`}
      >
        {/* Brand / Logo Area */}
        <div
          style={{
            height: 'var(--topbar-height)',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--line-strong)',
            backgroundColor: 'var(--paper)'
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
                width: '30px',
                height: '30px',
                backgroundColor: 'var(--ink)',
                color: 'var(--ink-inverse)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius)'
              }}
            >
              <Activity size={17} aria-hidden="true" />
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
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 800,
              padding: '2px 6px',
              backgroundColor: 'var(--paper-sunken)',
              color: 'var(--ink)',
              border: '1px solid var(--line-strong)',
              borderRadius: 'var(--radius)',
              letterSpacing: '0.12em'
            }}
          >
            COMMAND
          </span>
        </div>

        {/* Navigation Section */}
        <div style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--ink-3)',
              letterSpacing: '0.14em',
              padding: '0 10px 10px 10px',
              textTransform: 'uppercase'
            }}
          >
            OPERATIONS
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
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
                    color: isActive ? 'var(--ink)' : 'var(--ink-2)',
                    backgroundColor: isActive ? 'var(--paper-sunken)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--vermilion)' : '3px solid transparent',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '13px',
                    fontFamily: 'var(--font-ui)',
                    borderRadius: '0 var(--radius) var(--radius) 0',
                    transition: 'all var(--dur-fast) var(--ease-out)',
                    textDecoration: 'none'
                  }}
                  className="sidebar-nav-item"
                >
                  <Icon
                    size={17}
                    style={{
                      color: isActive ? 'var(--vermilion)' : 'var(--ink-2)',
                      flexShrink: 0
                    }}
                    aria-hidden="true"
                  />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {renderBadge(item)}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Operations Status Area */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid var(--line-strong)',
            backgroundColor: 'var(--paper-raised)',
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
              border: '1px solid var(--line-strong)',
              backgroundColor: 'var(--paper)',
              color: 'var(--ink)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textDecoration: 'none',
              borderRadius: 'var(--radius)',
              transition: 'all var(--dur-fast) var(--ease-out)'
            }}
          >
            <ArrowLeft size={13} aria-hidden="true" />
            <span>RETURN TO LANDING</span>
          </Link>

          {/* Sync Time & Telemetry using SyncIndicator */}
          <SyncIndicator
            lastSyncTime={lastSyncTime}
            syncFailed={syncFailed}
            refreshing={refreshing}
            onRefresh={onRefresh}
            showControls={true}
          />
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
