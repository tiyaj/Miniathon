import React, { useRef, useEffect } from 'react';
import { Search } from 'lucide-react';

export function SearchInput({
  value = '',
  onChange = () => {},
  placeholder = 'Search volunteers by name, email, or skill...',
  className = '',
  style = {},
  enableSlashShortcut = true,
  ...props
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!enableSlashShortcut) return;

    function handleKeyDown(e) {
      // Don't intercept if user is typing in an input, textarea, or contentEditable
      const targetTag = e.target?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea' || e.target?.isContentEditable) {
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableSlashShortcut]);

  return (
    <div
      className={`pulse-search-wrapper ${className}`}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        flex: '1 1 280px',
        ...style
      }}
    >
      <label htmlFor="pulse-search-input" className="sr-only">
        {placeholder}
      </label>
      <Search
        size={16}
        color="var(--ink-2)"
        style={{
          position: 'absolute',
          left: '14px',
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        id="pulse-search-input"
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          height: '44px',
          padding: '0 44px 0 40px',
          backgroundColor: 'var(--paper-raised)',
          border: '1px solid var(--line-strong)',
          borderRadius: 'var(--radius)',
          color: 'var(--ink)',
          fontSize: '13px',
          fontFamily: 'var(--font-ui)',
          outline: 'none',
          transition: 'all var(--dur-fast) var(--ease-out)',
          boxShadow: 'inset 0 1px 2px rgba(21, 19, 15, 0.04)'
        }}
        {...props}
      />
      {enableSlashShortcut && !value && (
        <span
          style={{
            position: 'absolute',
            right: '12px',
            padding: '2px 6px',
            backgroundColor: 'var(--paper-sunken)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-xs)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--ink-2)',
            pointerEvents: 'none',
            userSelect: 'none',
            lineHeight: 1
          }}
          title="Press / to focus search"
          aria-hidden="true"
        >
          /
        </span>
      )}
    </div>
  );
}

export default SearchInput;
