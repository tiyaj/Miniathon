import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle2, AlertTriangle, ArrowUpRight, ShieldCheck, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ZoneCoverageDeck({ zones = [] }) {
  const navigate = useNavigate();

  return (
    <div className="section-container">
      <div className="section-headline-group">
        <span className="section-kicker">SECTION 03 // SECTOR QUOTAS</span>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 className="section-title">Zone Coverage Balance</h2>
            <p className="section-lead">
              Direct comparison of on-ground personnel versus designated security & attendee care ratios.
            </p>
          </div>
          <button
            onClick={() => navigate('/assignments')}
            className="deck-action-link"
          >
            Open Matching Console <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      <div className="coverage-deck-grid">
        {zones.map((zone, idx) => {
          const rawPercent = zone.required > 0 ? Math.round((zone.assigned / zone.required) * 100) : 0;
          const isCritical = zone.status === 'critical';
          const isWarning = zone.status === 'warning';
          const isOverstaffed = zone.overstaffed;

          let statusTheme = {
            border: 'rgba(255, 255, 255, 0.08)',
            barGradient: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
            textColor: '#34d399',
            badgeText: 'Optimal Quota',
            icon: CheckCircle2
          };

          if (isCritical) {
            statusTheme = {
              border: 'rgba(244, 63, 94, 0.35)',
              barGradient: 'linear-gradient(90deg, #f43f5e 0%, #fb7185 100%)',
              textColor: '#fb7185',
              badgeText: `${zone.gaps} Deficit Gaps`,
              icon: ShieldAlert
            };
          } else if (isWarning) {
            statusTheme = {
              border: 'rgba(245, 158, 11, 0.35)',
              barGradient: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
              textColor: '#fbbf24',
              badgeText: `${zone.gaps} Deficit Gap`,
              icon: AlertTriangle
            };
          } else if (isOverstaffed) {
            statusTheme = {
              border: 'rgba(56, 189, 248, 0.3)',
              barGradient: 'linear-gradient(90deg, #38bdf8 0%, #818cf8 100%)',
              textColor: '#38bdf8',
              badgeText: '+1 Overstaffed',
              icon: ArrowUpRight
            };
          }

          const StatusIcon = statusTheme.icon;

          return (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.07 }}
              className="coverage-deck-card"
              style={{ borderColor: statusTheme.border }}
              onClick={() => navigate('/assignments')}
            >
              <div className="coverage-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={15} color="var(--color-primary-light)" />
                  <span className="coverage-zone-name">{zone.name}</span>
                </div>
                <div
                  className="coverage-status-tag"
                  style={{ color: statusTheme.textColor, borderColor: `${statusTheme.textColor}44` }}
                >
                  <StatusIcon size={12} />
                  <span>{statusTheme.badgeText}</span>
                </div>
              </div>

              <div className="coverage-stats-row">
                <div className="coverage-ratio">
                  <span className="ratio-assigned">{zone.assigned}</span>
                  <span className="ratio-sep">/</span>
                  <span className="ratio-required">{zone.required} required</span>
                </div>
                <div className="coverage-percentage" style={{ color: statusTheme.textColor }}>
                  {rawPercent}%
                </div>
              </div>

              <div className="coverage-progress-track">
                <motion.div
                  className="coverage-progress-fill"
                  style={{ background: statusTheme.barGradient }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.min(rawPercent, 100)}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.15 + idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>

              <div className="coverage-card-footer">
                <span>{zone.description || 'Zone operational'}</span>
                <span className="coverage-lead">Lead: {zone.lead || 'Coordinator'}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
