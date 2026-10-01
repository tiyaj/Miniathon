import React from 'react';
import { Menu, Plus, RefreshCw, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export function TopBar({
  pageTitle = 'Overview',
  eventName = 'TECHFEST 2026 — Main Arena',
  onToggleMobileMenu = () => {},
  onOpenAddVolunteer = () => {},
  onRefresh = () => {},
  refreshing = false
}) {
  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        position: 'sticky',
        top: 0,
        zIndex: 80,
        background: 'rgba(243, 240, 232, 0.94)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--hairline)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-6)',
        transition: 'all var(--transition-fast)'
      }}
      className="pulse-topbar"
    >
      {/* Left: Mobile Toggle + Title + Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
          style={{
            display: 'none',
            background: 'var(--paper-raised)',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--ink)',
            padding: '7px',
            cursor: 'pointer'
          }}
          className="mobile-menu-trigger"
        >
          <Menu size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              color: 'var(--ink)',
              letterSpacing: '-0.02em',
              margin: 0
            }}
          >
            {pageTitle}
          </h1>

          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--ink-45)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            className="topbar-event-badge font-mono"
          >
            <MapPin size={11} color="var(--pulse)" />
            {eventName}
          </span>
        </div>
      </div>

      {/* Right: Quick Operational Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Badge variant="healthy" size="sm" dot pulseDot>
          Live Feed Active
        </Badge>

        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          onClick={onRefresh}
          loading={refreshing}
          title="Refresh Data"
        >
          <span className="button-text-responsive">Sync</span>
        </Button>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={onOpenAddVolunteer}
        >
          <span className="button-text-responsive">Add Volunteer</span>
        </Button>
      </div>
    </header>
  );
}

export default TopBar;
