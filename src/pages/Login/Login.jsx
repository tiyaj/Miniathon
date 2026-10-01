import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Radio,
  ArrowLeft
} from 'lucide-react';
import './Login.css';

/**
 * PULSE Login Page — FRONTEND UI ONLY
 * 
 * Strict specifications adhered to:
 * - NO API calls or backend integration
 * - NO JWT or mock authentication
 * - Controlled inputs for Email & Password
 * - Accessible Show/Hide password toggle
 * - UI-only "Forgot password?" and "Create account" actions
 * - Split command-center layout with decorative live operations panel
 * - High-contrast paper/ink aesthetic with responsive mobile scaling
 */
export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // FRONTEND UI ONLY — Simulate button active/loading interaction without authenticating
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="pulse-login-page">
      <div className="pulse-login-split">
        {/* ===================================================================
            LEFT PANEL: Login Form
            =================================================================== */}
        <section className="pulse-login-form-panel" aria-labelledby="login-heading">
          {/* Top Brand & Back Navigation */}
          <div className="pulse-login-header">
            <Link to="/" className="pulse-login-brand" title="PULSE Platform">
              <div className="pulse-login-logo-box">
                <Activity size={18} aria-hidden="true" />
              </div>
              <span className="pulse-login-brand-text">PULSE</span>
              <span className="pulse-login-badge">COMMAND</span>
            </Link>

            <Link to="/" className="pulse-login-back-link">
              <ArrowLeft size={13} aria-hidden="true" />
              <span>Landing</span>
            </Link>
          </div>

          {/* Form Card */}
          <div className="pulse-login-card">
            <div className="pulse-login-heading-group">
              <h1 id="login-heading" className="pulse-login-heading">
                Welcome back
              </h1>
              <p className="pulse-login-subtext">
                Sign in to your PULSE operations dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="pulse-login-form" noValidate>
              {/* Field 1: Email Address */}
              <div className="pulse-form-group">
                <label htmlFor="login-email" className="pulse-form-label">
                  Email
                </label>
                <div className="pulse-input-wrapper">
                  <span className="pulse-input-icon" aria-hidden="true">
                    <Mail size={16} />
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pulse-login-input"
                  />
                </div>
              </div>

              {/* Field 2: Password with Show/Hide Toggle */}
              <div className="pulse-form-group">
                <div className="pulse-form-label-row">
                  <label htmlFor="login-password" className="pulse-form-label">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={(e) => e.preventDefault()}
                    className="pulse-forgot-link"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="pulse-input-wrapper">
                  <span className="pulse-input-icon" aria-hidden="true">
                    <Lock size={16} />
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pulse-login-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="pulse-password-toggle"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff size={16} aria-hidden="true" />
                    ) : (
                      <Eye size={16} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="pulse-login-submit-btn"
              >
                {isSubmitting ? (
                  <>
                    <Activity size={16} className="animate-spin" aria-hidden="true" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={15} aria-hidden="true" />
                  </>
                )}
              </button>

              {/* Secondary Create Account Action */}
              <div className="pulse-login-register-prompt">
                <span>Don't have an account? </span>
                <button
                  type="button"
                  onClick={(e) => e.preventDefault()}
                  className="pulse-login-register-link"
                >
                  Create account
                </button>
              </div>
            </form>
          </div>

          {/* Bottom Security / Encryption Tag */}
          <div className="pulse-login-footer">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="var(--mint, #1fa06e)" aria-hidden="true" />
              <span>256-Bit Encrypted Telemetry</span>
            </span>
            <span>PULSE · v2.4</span>
          </div>
        </section>

        {/* ===================================================================
            RIGHT PANEL: Live Event Operations Visual (Command Center Art)
            =================================================================== */}
        <aside className="pulse-login-visual-panel" aria-label="Live Operations Summary Visual">
          <div className="pulse-login-visual-glow" aria-hidden="true" />

          {/* Top Status Indicator */}
          <div className="pulse-visual-header">
            <div className="pulse-visual-pill">
              <span className="pulse-live-beacon" aria-hidden="true" />
              <span>LIVE EVENT OPERATIONS</span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-inverse-2)' }}>
              TSEC TECHFEST 2026
            </span>
          </div>

          {/* Center Showcase Card */}
          <div className="pulse-visual-center">
            <h2 className="pulse-visual-headline">
              Real-time command.<br />
              <span className="accent">Zero blindspots.</span>
            </h2>

            {/* Decorative Operations Preview Card */}
            <div className="pulse-telemetry-preview-card" aria-hidden="true">
              <div className="pulse-telemetry-card-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Radio size={16} color="var(--on-navy-coral, #ff7a6b)" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em' }}>
                    SECTOR TELEMETRY STREAM
                  </span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--on-navy-mint, #4fd6a0)', fontWeight: 700 }}>
                  ACTIVE FEED
                </span>
              </div>

              {/* Decorative Metrics Grid */}
              <div className="pulse-telemetry-metrics-grid">
                <div className="pulse-telemetry-metric-item">
                  <span className="pulse-metric-label">Coverage</span>
                  <span className="pulse-metric-value mint">87%</span>
                </div>
                <div className="pulse-telemetry-metric-item">
                  <span className="pulse-metric-label">Volunteers</span>
                  <span className="pulse-metric-value">12</span>
                </div>
                <div className="pulse-telemetry-metric-item">
                  <span className="pulse-metric-label">Incidents</span>
                  <span className="pulse-metric-value coral">03</span>
                </div>
              </div>

              {/* Decorative Live Stream Snippets */}
              <div className="pulse-telemetry-activity-stream">
                <div className="pulse-stream-item active">
                  <span style={{ color: 'var(--on-navy-coral)' }}>●</span>
                  <span>Entry Gate: 2 marshals dispatched to turnstile 4</span>
                </div>
                <div className="pulse-stream-item">
                  <span style={{ color: 'var(--on-navy-mint)' }}>✓</span>
                  <span>Registration: Scanner batteries verified optimal</span>
                </div>
                <div className="pulse-stream-item">
                  <span style={{ color: 'var(--on-navy-sky)' }}>●</span>
                  <span>Main Stage: AV liaison radio-channel synced</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Quote / Mission Statement */}
          <div className="pulse-visual-footer">
            <span>One centralized pulse coordinating staffing, attendance, and crowd safety.</span>
            <Link
              to="/dashboard"
              style={{
                color: 'var(--ink-inverse)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 'var(--radius-xs)'
              }}
            >
              <span>Demo Overview</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Login;
