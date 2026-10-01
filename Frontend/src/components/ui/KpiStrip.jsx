import React from 'react';

export function Metric({
  label,
  value,
  secondary,
  alert = false,
  highlight = false,
  className = '',
  style = {}
}) {
  return (
    <div
      className={`pulse-metric-cell ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 20px',
        minWidth: '120px',
        ...style
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: alert ? 'var(--coral-ink)' : 'var(--ink-2)',
          marginBottom: '4px',
          whiteSpace: 'nowrap'
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '28px',
          fontWeight: 800,
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.02em',
          color: alert ? 'var(--coral)' : highlight ? 'var(--ink)' : 'var(--ink)',
          display: 'flex',
          alignItems: 'baseline',
          gap: '6px'
        }}
      >
        <span>{value}</span>
        {secondary && (
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--ink-3)',
              letterSpacing: 'normal'
            }}
          >
            {secondary}
          </span>
        )}
      </div>
    </div>
  );
}

export function KpiStrip({ children, className = '', style = {} }) {
  return (
    <div
      className={`pulse-kpi-strip ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        backgroundColor: 'var(--paper-raised)',
        border: '1px solid var(--line-strong)',
        borderRadius: 'var(--radius)',
        padding: '16px 8px',
        divideX: '1px solid var(--line)',
        ...style
      }}
    >
      {React.Children.map(children, (child, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && (
            <div
              style={{
                width: '1px',
                height: '36px',
                backgroundColor: 'var(--line)',
                flexShrink: 0
              }}
              aria-hidden="true"
            />
          )}
          {child}
        </React.Fragment>
      ))}
    </div>
  );
}

export default KpiStrip;
