import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, UserMinus, Radio, AlertTriangle, ArrowRight, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AttentionDeck({ items = [] }) {
  const navigate = useNavigate();

  const severityConfigs = {
    critical: {
      icon: AlertCircle,
      badge: 'Critical Deficit',
      color: '#fb7185',
      border: 'rgba(244, 63, 94, 0.4)',
      bg: 'rgba(244, 63, 94, 0.08)'
    },
    dropout: {
      icon: UserMinus,
      badge: 'Volunteer Dropout',
      color: '#fbbf24',
      border: 'rgba(245, 158, 11, 0.35)',
      bg: 'rgba(245, 158, 11, 0.07)'
    },
    incident: {
      icon: Radio,
      badge: 'Surge Incident',
      color: '#fb7185',
      border: 'rgba(244, 63, 94, 0.4)',
      bg: 'rgba(244, 63, 94, 0.08)'
    },
    warning: {
      icon: AlertTriangle,
      badge: 'Shift Advisory',
      color: '#fbbf24',
      border: 'rgba(245, 158, 11, 0.35)',
      bg: 'rgba(245, 158, 11, 0.07)'
    }
  };

  return (
    <div className="section-container">
      <div className="section-headline-group">
        <span className="section-kicker">SECTION 04 // PRIORITY TRIAGE</span>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 className="section-title">Attention Queue</h2>
            <p className="section-lead">
              Ranked items requiring immediate coordinator intervention or volunteer replacement dispatch.
            </p>
          </div>
          <span className="queue-count-badge">
            <span className="count-dot" /> {items.length} Escalations Pending
          </span>
        </div>
      </div>

      <div className="attention-deck-list">
        {(items || []).map((item, idx) => {
          const cfg = severityConfigs[item.severity] || severityConfigs.warning;
          const Icon = cfg.icon;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
              className="attention-row"
              style={{
                borderColor: cfg.border,
                background: cfg.bg
              }}
            >
              <div className="attention-row-left">
                <div className="attention-icon-box" style={{ color: cfg.color }}>
                  <Icon size={18} />
                </div>

                <div className="attention-text-content">
                  <div className="attention-meta-tags">
                    <span className="attention-badge" style={{ color: cfg.color, borderColor: `${cfg.color}44` }}>
                      {cfg.badge}
                    </span>
                    <span className="attention-time">
                      <Clock size={11} /> {item.timestamp}
                    </span>
                    <span className="attention-zone">
                      <MapPin size={11} /> {item.zone}
                    </span>
                  </div>

                  <h4 className="attention-title">{item.title}</h4>
                  <p className="attention-detail">{item.detail}</p>
                </div>
              </div>

              <div className="attention-row-action">
                <button
                  onClick={() => navigate(item.route)}
                  className={`attention-action-btn ${item.severity === 'critical' || item.severity === 'incident' ? 'btn-urgent' : 'btn-standard'}`}
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
