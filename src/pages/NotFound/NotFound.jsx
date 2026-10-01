import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: 'var(--space-8)',
      }}
    >
      <div className="font-mono" style={{ fontSize: 'var(--fs-label)', color: 'var(--pulse)', letterSpacing: '0.14em', marginBottom: '12px' }}>
        ERR // 404 UNREGISTERED VECTOR
      </div>
      <h1 className="font-display" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 800, margin: '0 0 16px 0', letterSpacing: '-0.04em' }}>
        SECTOR NOT FOUND.
      </h1>
      <p style={{ maxWidth: '420px', color: 'var(--ink-70)', marginBottom: '32px', fontSize: 'var(--fs-body)' }}>
        The coordinates or route requested do not correspond to an active operational sector or telemetry channel.
      </p>
      <div style={{ display: 'flex', gap: '14px' }}>
        <Button variant="primary" onClick={() => navigate('/')}>
          Return to Landing
        </Button>
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>
          Command Overview
        </Button>
      </div>
    </div>
  );
}

export default NotFound;
