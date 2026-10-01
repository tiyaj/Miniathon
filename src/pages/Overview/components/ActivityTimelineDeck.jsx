import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  UserCheck,
  UserMinus,
  Sparkles,
  Radio,
  CheckCircle2,
  Clock,
  Calendar
} from 'lucide-react';

export function ActivityTimelineDeck({ activities = [], shifts = [] }) {
  const categoryConfig = {
    checkin: {
      color: '#34d399',
      label: 'Check In',
      icon: UserCheck
    },
    dropout: {
      color: '#fbbf24',
      label: 'Dropout',
      icon: UserMinus
    },
    replacement: {
      color: '#818cf8',
      label: 'Rule Matched',
      icon: Sparkles
    },
    incident: {
      color: '#fb7185',
      label: 'Incident',
      icon: Radio
    },
    task: {
      color: '#38bdf8',
      label: 'Task Done',
      icon: CheckCircle2
    }
  };

  return (
    <div className="section-container">
      <div className="section-headline-group">
        <span className="section-kicker">SECTION 05 // OPERATIONS AUDIT</span>
        <h2 className="section-title">Activity Timeline & Shift Stream</h2>
        <p className="section-lead">
          Continuous chronological log of field check-ins, rule engine suggestions, and shift handovers.
        </p>
      </div>

      <div className="timeline-dual-layout">
        {/* Left Column: Live Event Activity Feed */}
        <div className="activity-stream-panel">
          <div className="panel-header">
            <span className="panel-title">Live Field Feed</span>
            <div className="panel-live-tag">
              <span className="live-dot" /> STREAMING
            </div>
          </div>

          <div className="activity-nodes-list">
            {activities.map((act, index) => {
              const cfg = categoryConfig[act.category] || categoryConfig.checkin;
              const Icon = cfg.icon;

              return (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="activity-item-row"
                >
                  {/* Vertical line connector */}
                  <div className="node-marker-wrap">
                    <span
                      className="node-dot"
                      style={{
                        backgroundColor: cfg.color,
                        boxShadow: `0 0 10px ${cfg.color}`
                      }}
                    />
                    <div className="node-stem" />
                  </div>

                  {/* Item Content */}
                  <div className="activity-item-content">
                    <div className="activity-item-main">
                      <span className="activity-item-text">{act.text}</span>
                      <span className="activity-item-zone">{act.zone}</span>
                    </div>

                    <div className="activity-item-aside">
                      <span
                        className="activity-category-tag"
                        style={{ color: cfg.color, borderColor: `${cfg.color}44` }}
                      >
                        <Icon size={12} />
                        {cfg.label}
                      </span>
                      <span className="activity-timestamp">{act.time}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Shift Block Summary */}
        <div className="shifts-stream-panel">
          <div className="panel-header">
            <span className="panel-title">Shift Rotation Windows</span>
            <span className="panel-subtitle">Day 1 Schedule</span>
          </div>

          <div className="shift-cards-stack">
            {shifts.map((shift, idx) => {
              const isHealthy = shift.percent >= 80;
              const statusColor = isHealthy ? '#34d399' : '#fbbf24';

              return (
                <motion.div
                  key={shift.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className={`shift-mini-card ${shift.activeNow ? 'shift-active-border' : ''}`}
                >
                  <div className="shift-card-top">
                    <div>
                      <span className="shift-name">{shift.name}</span>
                      <div className="shift-time">
                        <Clock size={12} /> {shift.time}
                      </div>
                    </div>
                    {shift.activeNow && (
                      <span className="shift-active-badge">
                        <span className="active-pip" /> ACTIVE NOW
                      </span>
                    )}
                  </div>

                  <div className="shift-card-progress">
                    <div className="shift-progress-meta">
                      <span>Staffed: {shift.staffed}/{shift.required}</span>
                      <span style={{ color: statusColor, fontWeight: 700 }}>{shift.percent}%</span>
                    </div>
                    <div className="shift-bar-bg">
                      <div
                        className="shift-bar-fill"
                        style={{
                          width: `${shift.percent}%`,
                          backgroundColor: statusColor
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
