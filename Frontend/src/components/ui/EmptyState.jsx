import React from 'react';
import { Button } from './Button';
import { Inbox } from 'lucide-react';

export function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There is currently no data matching your query or active criteria.',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = ''
}) {
  return (
    <div
      style={{
        padding: '48px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        backgroundColor: 'var(--paper-raised)',
        border: '1px dashed var(--line-strong)',
        borderRadius: 'var(--radius)'
      }}
      className={`pulse-empty-state ${className}`}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: 'var(--radius)',
          backgroundColor: 'var(--paper-sunken)',
          border: '1px solid var(--line)',
          color: 'var(--ink)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}
      >
        <Icon size={24} aria-hidden="true" />
      </div>

      <h4
        style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: 'var(--ink)',
          marginBottom: '6px',
          fontFamily: 'var(--font-display)',
          letterSpacing: '-0.02em'
        }}
      >
        {title}
      </h4>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--ink-2)',
          maxWidth: '400px',
          lineHeight: 1.5,
          marginBottom: actionLabel || secondaryActionLabel ? '20px' : 0
        }}
      >
        {description}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {secondaryActionLabel && (
          <Button variant="ghost" size="sm" onClick={onSecondaryAction}>
            {secondaryActionLabel}
          </Button>
        )}
        {actionLabel && (
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

export default EmptyState;
