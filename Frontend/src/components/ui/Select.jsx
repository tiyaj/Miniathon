import React from 'react';
import { ChevronDown } from 'lucide-react';

export function Select({
  label,
  value,
  onChange,
  options = [],
  id,
  className = '',
  style = {},
  ...props
}) {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div
      className={`pulse-select-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        ...style
      }}
    >
      {label && (
        <label
          htmlFor={selectId}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--ink-2)',
            whiteSpace: 'nowrap'
          }}
        >
          {label}:
        </label>
      )}

      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            height: '44px',
            padding: '0 34px 0 14px',
            backgroundColor: 'var(--paper-raised)',
            border: '1px solid var(--line-strong)',
            borderRadius: 'var(--radius)',
            color: 'var(--ink)',
            fontSize: '13px',
            fontFamily: 'var(--font-ui)',
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
            transition: 'border-color var(--dur-fast) var(--ease-out)',
            minWidth: '130px'
          }}
          {...props}
        >
          {options.map((opt) => {
            const optVal = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={optVal} value={optVal} style={{ background: '#fbfaf5', color: '#15130f' }}>
                {optLabel}
              </option>
            );
          })}
        </select>

        <ChevronDown
          size={14}
          color="var(--ink)"
          style={{
            position: 'absolute',
            right: '12px',
            pointerEvents: 'none'
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

export default Select;
