import { useState } from 'react';
import { HiOutlineClipboard, HiOutlineCheck } from 'react-icons/hi';

export default function ResultCard({ title, icon, status, children }) {
  const statusColors = {
    success: 'border-l-emerald-500',
    error: 'border-l-red-500',
    loading: 'border-l-brand-500',
  };

  return (
    <div className={`glass-card overflow-hidden animate-slide-up border-l-4 ${statusColors[status] || 'border-l-brand-500'}`}>
      <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && <span className="text-brand-600 dark:text-brand-400 text-lg">{icon}</span>}
            <h3 className="text-sm font-bold tracking-wide" style={{ color: 'var(--color-text)' }}>{title}</h3>
          </div>
          {status && (
            <span className={`badge ${status === 'success' ? 'badge-green' : status === 'error' ? 'badge-red' : 'badge-blue'}`}>
              {status === 'success' ? '✓ Found' : status === 'error' ? '✗ Error' : '⟳ Loading'}
            </span>
          )}
        </div>
      </div>
      <div className="px-5 py-4 space-y-1">
        {children}
      </div>
    </div>
  );
}

export function KVRow({ label, value, highlight, copyable = true }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(String(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!value && value !== 0) return null;

  return (
    <div className="flex items-center justify-between py-1.5 px-2 -mx-2 rounded-lg group hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
      <span className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span
          className={`text-xs font-mono text-right ${
            highlight ? 'font-bold text-brand-600 dark:text-brand-400' : ''
          }`}
          style={!highlight ? { color: 'var(--color-text)' } : undefined}
        >
          {String(value)}
        </span>
        {copyable && (
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700"
            title="Copy"
          >
            {copied ? (
              <HiOutlineCheck className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <HiOutlineClipboard className="w-3.5 h-3.5" style={{ color: 'var(--color-text-secondary)' }} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
