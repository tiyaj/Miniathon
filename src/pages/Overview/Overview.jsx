import React, { useState, useEffect } from 'react';
import { CinematicHero } from './components/CinematicHero';
import { LiveMetricsBar } from './components/LiveMetricsBar';
import { ZoneCoverageDeck } from './components/ZoneCoverageDeck';
import { AttentionDeck } from './components/AttentionDeck';
import { ActivityTimelineDeck } from './components/ActivityTimelineDeck';
import { getDashboard } from '../../lib/api';
import './Overview.css';

export function Overview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDashboard();
      if (res.data) {
        setData(res.data);
      } else {
        setError(res.error?.message || 'Failed to load command data');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleRefresh = () => {
      loadData();
    };

    window.addEventListener('pulse:refresh', handleRefresh);
    return () => {
      window.removeEventListener('pulse:refresh', handleRefresh);
    };
  }, []);

  const handleScrollToDeck = () => {
    const deck = document.getElementById('operational-deck');
    if (deck) {
      deck.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading && !data) {
    return (
      <div className="overview-page-wrapper" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '2px solid rgba(99, 102, 241, 0.2)',
              borderTopColor: '#6366f1',
              animation: 'spin 0.8s linear infinite'
            }}
          />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
            CONNECTING TO PULSE HEARTBEAT TELEMETRY...
          </span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="overview-page-wrapper" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', maxWidth: '420px' }}>
          <h3 style={{ color: '#fb7185', marginBottom: '8px' }}>Telemetry Stream Interrupted</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>{error}</p>
          <button
            onClick={loadData}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-primary)',
              color: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Reconnect Stream
          </button>
        </div>
      </div>
    );
  }

  const {
    event = {},
    zones = [],
    attentionQueue = [],
    shifts = [],
    recentActivity = []
  } = data || {};

  return (
    <div className="overview-page-wrapper">
      {/* SECTION 1 — IMMERSIVE CINEMATIC HERO & SPATIAL EVENT NETWORK */}
      <CinematicHero
        zones={zones}
        event={event}
        onScrollDown={handleScrollToDeck}
      />

      {/* SECTION 2 — LIVE REAL-TIME TELEMETRY METRICS */}
      <LiveMetricsBar data={data} />

      {/* SECTION 3 — ZONE COVERAGE & SECTOR QUOTAS */}
      <ZoneCoverageDeck zones={zones} />

      {/* SECTION 4 — ATTENTION QUEUE & PRIORITY TRIAGE */}
      <AttentionDeck items={attentionQueue} />

      {/* SECTION 5 — ACTIVITY TIMELINE & SHIFT STREAM */}
      <ActivityTimelineDeck activities={recentActivity} shifts={shifts} />
    </div>
  );
}
