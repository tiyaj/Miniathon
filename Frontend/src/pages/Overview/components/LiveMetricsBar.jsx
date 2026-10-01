import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  ShieldCheck,
  Activity,
  AlertOctagon,
  CheckSquare,
  ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LiveMetricsBar({ data = {} }) {
  const navigate = useNavigate();
  const safeData = data || {};

  const metrics = [
    {
      id: 'reg',
      label: 'Registered Volunteers',
      value: safeData.volunteersRegistered ?? 16,
      sub: 'Verified roster',
      icon: Users,
      route: '/volunteers',
      highlight: null
    },
    {
      id: 'asg',
      label: 'Active Allocations',
      value: safeData.volunteersAssigned ?? 12,
      sub: '75% workforce assigned',
      icon: UserCheck,
      route: '/volunteers',
      highlight: null
    },
    {
      id: 'cov',
      label: 'Event Coverage',
      value: `${safeData.coverage?.filled ?? 12}/${safeData.coverage?.required ?? 18}`,
      sub: `${safeData.coverage?.percent ?? 67}% total capacity`,
      icon: ShieldCheck,
      route: '/assignments',
      highlight: 'warning'
    },
    {
      id: 'chk',
      label: 'On-Ground Checked In',
      value: safeData.checkedIn ?? 7,
      sub: 'Shift 1 headcount active',
      icon: Activity,
      route: '/volunteers',
      highlight: 'healthy'
    },
    {
      id: 'inc',
      label: 'Critical Incident',
      value: safeData.criticalIncidents ?? 1,
      sub: 'Entry Gate surge triage',
      icon: AlertOctagon,
      route: '/live-ops',
      highlight: 'critical'
    },
    {
      id: 'tsk',
      label: 'Setup Tasks Resolved',
      value: `${safeData.tasks?.completed ?? 5}/${safeData.tasks?.total ?? 8}`,
      sub: '62% logistics ready',
      icon: CheckSquare,
      route: '/live-ops',
      highlight: 'info'
    }
  ];

  return (
    <div className="section-container" id="operational-deck">
      <div className="section-headline-group">
        <span className="section-kicker">SECTION 02 // REAL-TIME TELEMETRY</span>
        <h2 className="section-title">Live Operations Pulse</h2>
        <p className="section-lead">
          Aggregated staffing quotas, active check-ins, and security escalation alerts streamed from field marshals.
        </p>
      </div>

      <div className="telemetry-strip-wrapper">
        <div className="telemetry-strip">
          {metrics.map((m, index) => {
            const Icon = m.icon;
            const isCritical = m.highlight === 'critical';
            const isWarning = m.highlight === 'warning';
            const isHealthy = m.highlight === 'healthy';

            let valueColor = 'var(--text-primary)';
            if (isCritical) valueColor = '#fb7185';
            else if (isWarning) valueColor = '#fbbf24';
            else if (isHealthy) valueColor = '#34d399';

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className={`telemetry-cell ${isCritical ? 'cell-critical' : ''}`}
                onClick={() => navigate(m.route)}
              >
                <div className="cell-top">
                  <span className="cell-label">{m.label}</span>
                  <div className={`cell-icon-wrap ${m.highlight || 'default'}`}>
                    <Icon size={14} />
                  </div>
                </div>

                <div className="cell-value" style={{ color: valueColor }}>
                  {m.value}
                </div>

                <div className="cell-sub">
                  <span>{m.sub}</span>
                  <ArrowUpRight size={12} className="cell-arrow" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
