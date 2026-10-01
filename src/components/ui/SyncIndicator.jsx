import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export function SyncIndicator({
  lastSyncTime = new Date(),
  syncFailed = false,
  refreshing = false,
  onRefresh = () => {},
  showControls = true,
  className = '',
  style = {}
}) {
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const updateDiff = () => {
      if (!lastSyncTime) return;
      const syncDate = lastSyncTime instanceof Date ? lastSyncTime : new Date(lastSyncTime);
      const diff = Math.max(0, Math.floor((Date.now() - syncDate.getTime()) / 1000));
      setSecondsAgo(diff);
    };

    updateDiff();
    const interval = setInterval(updateDiff, 1000);
    return () => clearInterval(interval);
  }, [lastSyncTime]);

  // Determine state
  let state = 'healthy'; // green
  if (syncFailed) {
    state = 'failed'; // red
  } else if (secondsAgo > 30) {
    state = 'stale'; // amber
  }

  const dotColors = {
    healthy: 'var(--mint)',
    stale: 'var(--amber)',
    failed: 'var(--coral)'
  };

  const timeString =
    lastSyncTime instanceof Date
      ? lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : String(lastSyncTime || '');

  return (
    <div
      className={`pulse-sync-indicator ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        color: 'var(--ink-2)',
        userSelect: 'none',
        fontVariantNumeric: 'tabular-nums',
        ...style
      }}
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }} aria-live="off">
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: dotColors[state],
            boxShadow: `0 0 6px ${dotColors[state]}`
          }}
          aria-hidden="true"
        />
        <span>
          SYNC: {timeString} · {secondsAgo}s ago
        </span>
      </div>

      {showControls && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          title="Manual Telemetry Synchronization"
          style={{
            background: 'none',
            border: 'none',
            padding: '2px',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            color: 'var(--ink)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} aria-hidden="true" />
          <span className="sr-only">Sync now</span>
        </button>
      )}
    </div>
  );
}

export default SyncIndicator;
