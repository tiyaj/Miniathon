import React, { useState } from 'react';
import { Menu, Plus, RefreshCw, Crosshair, ChevronDown, User, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { useEvent } from '../../context/EventContext';
import { Link, useNavigate } from 'react-router-dom';

export function TopBar({
  pageTitle = 'Overview',
  eventName: propEventName,
  onToggleMobileMenu = () => {},
  onOpenAddVolunteer = () => {},
  onRefresh = () => {},
  refreshing = false,
  lastSyncTime = new Date(),
  syncFailed = false
}) {
  const { events, selectedEventId, selectEvent, currentEvent, user, logout } = useEvent();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const activeEventName = currentEvent?.name || propEventName || 'PULSE Tech Summit 2026';

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

  const handleSelectEvent = (id) => {
    selectEvent(id);
    setDropdownOpen(false);
    window.dispatchEvent(new CustomEvent('pulse:refresh'));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
      {/* Left: Mobile Toggle + Title + Breadcrumb Location with Event Selector */}
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

          {/* Interactive Event Dropdown Selector */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: 'var(--ink)',
                backgroundColor: 'var(--paper-sunken)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-xs)',
                padding: '4px 8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Click to switch active event"
            >
              <Crosshair size={12} color="var(--vermilion)" aria-hidden="true" />
              <span>{activeEventName}</span>
              <ChevronDown size={11} color="var(--ink-3)" />
            </button>

            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  width: '280px',
                  maxHeight: '320px',
                  overflowY: 'auto',
                  backgroundColor: 'var(--paper-raised)',
                  border: '1px solid var(--line-strong)',
                  borderRadius: 'var(--radius)',
                  boxShadow: 'var(--shadow-float)',
                  zIndex: 100,
                  padding: '6px'
                }}
              >
                <div style={{ padding: '6px 8px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', fontWeight: 800, textTransform: 'uppercase' }}>
                  Select Active Event:
                </div>
                {events.map((ev) => {
                  const evId = ev._id || ev.id;
                  const isCurrent = evId === selectedEventId;
                  return (
                    <button
                      key={evId}
                      type="button"
                      onClick={() => handleSelectEvent(evId)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: isCurrent ? 'var(--paper-sunken)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: isCurrent ? 700 : 500, color: 'var(--ink)' }}>
                        {ev.name}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                        {ev.venue || 'Campus Grounds'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: User Role Pill + Status badge & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* User Pill / Login status */}
        {user ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              height: '28px',
              backgroundColor: 'var(--paper-sunken)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--ink)'
            }}
          >
            <User size={12} color="var(--indigo)" />
            <span style={{ fontWeight: 700 }}>{user.name?.split(' ')[0]}</span>
            <span style={{ color: 'var(--ink-3)', fontSize: '10px' }}>({user.role})</span>
            <button
              onClick={handleLogout}
              title="Sign Out"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', display: 'flex', alignItems: 'center', color: 'var(--ink-3)' }}
            >
              <LogOut size={11} />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              textDecoration: 'none',
              color: 'var(--ink)',
              padding: '4px 8px',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)'
            }}
          >
            LOGIN
          </Link>
        )}

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
          title="Refresh Data from Backend"
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
