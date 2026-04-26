import { useState, useEffect } from 'react';
import { HiOutlineSearch, HiOutlineSparkles } from 'react-icons/hi';

function detectType(query) {
  if (!query) return null;
  const q = query.trim();
  if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(q)) return 'email';
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(q)) return 'ip';
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/.test(q)) return 'domain';
  if (q.length >= 3 && /^[a-zA-Z0-9._-]+$/.test(q)) return 'username';
  return null;
}

const TYPE_COLORS = {
  email: 'badge-blue',
  ip: 'badge-purple',
  domain: 'badge-green',
  username: 'badge-yellow',
};

const TYPE_LABELS = {
  email: '📧 Email',
  ip: '🌐 IP Address',
  domain: '🔗 Domain',
  username: '👤 Username',
};

export default function SearchBar({ onSearch, loading, placeholder }) {
  const [query, setQuery] = useState('');
  const [detectedType, setDetectedType] = useState(null);

  useEffect(() => {
    const type = detectType(query);
    setDetectedType(type);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
        <input
          id="osint-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || "Enter email, domain, IP address, or username..."}
          className="input-field pl-12 pr-36 py-4 text-base"
          disabled={loading}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {detectedType && (
            <span className={`badge ${TYPE_COLORS[detectedType]} transition-all duration-300 animate-fade-in`}>
              {TYPE_LABELS[detectedType]}
            </span>
          )}
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="btn-primary py-2 px-4 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Scanning...
              </>
            ) : (
              <>
                <HiOutlineSparkles className="w-4 h-4" />
                Investigate
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
