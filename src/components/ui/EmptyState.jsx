import React from 'react';
import { Button } from './Button';
import { Inbox } from 'lucide-react';

export function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There is currently no data matching your query or active criteria.',
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div
      style={{
        padding: 'var(--space-12) var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        background: 'rgba(15, 22, 38, 0.4)',
        border: '1px dashed var(--border-subtle)',
        borderRadius: 'var(--radius-lg)'
      }}
      className={`pulse-empty-state ${className}`}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-4)'
        }}
      >
        <Icon size={24} />
      </div>

      <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
        {title}
      </h4>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '360px', marginBottom: actionLabel ? 'var(--space-5)' : 0 }}>
        {description}
      </p>

      {actionLabel && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
