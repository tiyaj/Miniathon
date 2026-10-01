import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export function ErrorBanner({
  title = 'Telemetry Connection Interrupted',
  message = 'Failed to communicate with live on-ground coordination feed.',
  onRetry,
  className = '',
  style = {}
}) {
  return (
    <div
      role="alert"
      className={`pulse-error-banner ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        padding: '16px 20px',
        backgroundColor: 'var(--coral-bg)',
        border: '1px solid var(--coral)',
        borderRadius: 'var(--radius)',
        color: 'var(--coral-ink)',
        ...style
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius)',
            backgroundColor: 'var(--coral)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <AlertTriangle size={18} aria-hidden="true" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.2 }}>{title}</div>
          <div style={{ fontSize: '0.8125rem', marginTop: '2px', opacity: 0.9 }}>{message}</div>
        </div>
      </div>

      {onRetry && (
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRetry}>
          Retry Connection
        </Button>
      )}
    </div>
  );
}

export default ErrorBanner;
