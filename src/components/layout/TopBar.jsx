import React from 'react';
import { Menu, Plus, RefreshCw, Crosshair } from 'lucide-react';
import { Button } from '../ui/Button';

export function TopBar({
  pageTitle = 'Overview',
  eventName = 'TECHFEST 2026 — MAIN ARENA',
  onToggleMobileMenu = () => {},
  onOpenAddVolunteer = () => {},
  onRefresh = () => {},
  refreshing = false,
  lastSyncTime = new Date(),
  syncFailed = false
}) {
  // Sync status agreement with sidebar
  const syncDate = lastSyncTime instanceof Date ? lastSyncTime : new Date(lastSyncTime);
  const diffSeconds = Math.max(0, Math.floor((Date.now() - syncDate.getTime()) / 1000));

  let feedStatus = {
    label: 'LIVE FEED ACTIVE',
    color: 'var(--mint)',
    bg: 'var(--mint-bg)',
    ink: 'var(--mint-ink)',
    border: 'rgba(31, 160, 110, 0.35)'
  };

  if (syncFailed) {
    feedStatus = {
      label: 'SYNC ERROR',
      color: 'var(--coral)',
      bg: 'var(--coral-bg)',
      ink: 'var(--coral-ink)',
      border: 'rgba(228, 71, 43, 0.35)'
    };
  } else if (diffSeconds > 30) {
    feedStatus = {
      label: 'FEED STALE',
      color: 'var(--amber)',
      bg: 'var(--amber-bg)',
      ink: 'var(--amber-ink)',
      border: 'rgba(232, 150, 30, 0.35)'
    };
  }

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        position: 'sticky',
        top: 0,
        zIndex: 80,
        backgroundColor: 'var(--paper)',
        borderBottom: '1px solid var(--line)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        transition: 'all var(--dur-fast) var(--ease-out)'
      }}
      className="pulse-topbar"
    >
      {/* Left: Mobile Toggle + Title + Breadcrumb Location */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
          style={{
            display: 'none',
            backgroundColor: 'var(--paper-raised)',
            border: '1px solid var(--line-strong)',
            borderRadius: 'var(--radius)',
            color: 'var(--ink)',
            padding: '7px',
            cursor: 'pointer'
          }}
          className="mobile-menu-trigger"
        >
          <Menu size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              color: 'var(--ink)',
              letterSpacing: '-0.02em',
              margin: 0,
              lineHeight: 1
            }}
          >
            {pageTitle}
          </h1>

          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'var(--ink-3)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Crosshair size={12} color="var(--vermilion)" aria-hidden="true" />
            {eventName}
          </span>
        </div>
      </div>

      {/* Right: Status badge & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Live Feed Status - strictly synchronized with sync time */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            height: '28px',
            backgroundColor: feedStatus.bg,
            border: `1px solid ${feedStatus.border}`,
            borderRadius: 'var(--radius)',
            color: feedStatus.ink,
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            userSelect: 'none',
            lineHeight: 1
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: feedStatus.color,
              boxShadow: `0 0 6px ${feedStatus.color}`,
              animation: !syncFailed ? 'pulseGlow 2s infinite ease-in-out' : 'none'
            }}
            aria-hidden="true"
          />
          <span>{feedStatus.label}</span>
        </span>

        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          onClick={onRefresh}
          loading={refreshing}
          title="Refresh Data"
        >
          SYNC
        </Button>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={onOpenAddVolunteer}
        >
          ADD VOLUNTEER
        </Button>
      </div>
    </header>
  );
}

export default TopBar;
