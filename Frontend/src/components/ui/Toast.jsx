import React from 'react';
import { useToast } from '../../hooks/useToast';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) return null;

  const iconMap = {
    success: <CheckCircle2 size={18} color="#34d399" />,
    error: <AlertCircle size={18} color="#fb7185" />,
    warning: <AlertTriangle size={18} color="#fbbf24" />,
    info: <Info size={18} color="#38bdf8" />
  };

  const borderMap = {
    success: 'rgba(16, 185, 129, 0.4)',
    error: 'rgba(244, 63, 94, 0.4)',
    warning: 'rgba(245, 158, 11, 0.4)',
    info: 'rgba(56, 189, 248, 0.4)'
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '400px',
        width: 'calc(100% - 48px)',
        pointerEvents: 'none'
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            pointerEvents: 'auto',
            background: 'rgba(18, 25, 43, 0.94)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid ${borderMap[toast.type] || borderMap.info}`,
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            boxShadow: 'var(--shadow-lg), 0 0 20px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            animation: 'fadeUp 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          <div style={{ flexShrink: 0 }}>
            {iconMap[toast.type] || iconMap.info}
          </div>
          <div style={{ flex: 1, lineHeight: 1.4 }}>
            {toast.message}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'transparent',
              color: 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Dismiss toast"
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
