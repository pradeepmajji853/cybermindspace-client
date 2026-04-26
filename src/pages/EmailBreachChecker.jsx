import { useState } from 'react';
import client from '../api/client';
import SearchBar from '../components/SearchBar';
import { CardSkeleton } from '../components/LoadingSkeleton';
import {
  HiOutlineMail, HiOutlineShieldCheck, HiOutlineShieldExclamation,
  HiOutlineCheck, HiOutlineX, HiOutlineUserCircle,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function EmailBreachChecker() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleSearch = async (email) => {
    setLoading(true); setResults(null);
    try {
      const { data } = await client.post('/tools/email', { email });
      if (data.error) { toast.error(data.error); return; }
      setResults(data);
      if (data.breachCount > 0) toast.error(`Found in ${data.breachCount} breaches`);
      else toast.success('No breaches detected');
    } catch (err) { toast.error('Lookup failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm">
          <HiOutlineMail className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Email Intelligence</h1>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Breach exposure, deliverability, SPF/DMARC/DKIM/MTA-STS, Gravatar identity
          </p>
        </div>
      </div>

      <SearchBar onSearch={handleSearch} loading={loading} placeholder="Enter email to investigate..." />

      {loading && <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><CardSkeleton /><CardSkeleton /></div>}

      {results && (
        <div className="space-y-5 animate-slide-up">
          {/* Hero verdict */}
          <div className={`glass-card p-6 border-l-4 ${results.breachCount > 0 ? 'border-l-red-500' : 'border-l-emerald-500'}`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                {results.gravatar?.exists ? (
                  <img src={results.gravatar.avatarUrl} alt="" className="w-14 h-14 rounded-full border-2 border-brand-500/30" />
                ) : (
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${results.breachCount > 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {results.breachCount > 0 ? <HiOutlineShieldExclamation className="w-7 h-7" /> : <HiOutlineShieldCheck className="w-7 h-7" />}
                  </div>
                )}
                <div>
                  <p className="text-base font-bold font-mono" style={{ color: 'var(--color-text)' }}>{results.email}</p>
                  <p className="text-[11px] opacity-60 mt-0.5">
                    {results.provider} • {results.type} • Trust: {results.trust}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Security Grade</p>
                <p className={`text-3xl font-bold ${results.grade === 'A' ? 'text-emerald-500' : results.grade === 'B' ? 'text-brand-500' : results.grade === 'C' ? 'text-amber-500' : 'text-red-500'}`}>{results.grade}</p>
                <p className="text-[10px] opacity-50">{results.securityScore}/100</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Breaches"     value={results.breachCount}                  bad={results.breachCount > 0} />
            <Stat label="Disposable"   value={results.disposable ? 'YES' : 'No'}    bad={results.disposable} />
            <Stat label="Deliverable"  value={results.deliverable ? 'Yes' : 'No'}   bad={!results.deliverable} />
            <Stat label="Role Account" value={results.role ? 'YES' : 'No'} />
          </div>

          {/* Breaches list */}
          {results.breaches?.length > 0 && (
            <div className="glass-card p-5 border-l-4 border-l-red-500">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-red-500">Breach History</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {results.breaches.map((b, i) => (
                  <div key={i} className="p-2 rounded bg-red-500/10 border border-red-500/20 text-[11px] font-mono text-red-600 dark:text-red-400">
                    {b.name}
                  </div>
                ))}
              </div>
              <p className="text-[10px] opacity-50 mt-3">Source: {results.breachSource}</p>
            </div>
          )}

          {/* Email auth */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="glass-card p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text)' }}>Authentication Posture</h3>
              <AuthRow label="SPF"     present={!!results.spf}     value={results.spf} />
              <AuthRow label="DMARC"   present={!!results.dmarc}   value={results.dmarc} />
              <AuthRow label="BIMI"    present={!!results.bimi}    value={results.bimi || 'Not configured'} />
              <AuthRow label="MTA-STS" present={!!results.mtaSts}  value={results.mtaSts ? 'Enabled' : 'Not configured'} />
              <AuthRow label="DKIM"    present={results.dkim?.length > 0} value={results.dkim?.length > 0 ? `${results.dkim.length} selector(s)` : 'No selector found'} />
            </div>

            <div className="glass-card p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text)' }}>Mail Infrastructure</h3>
              <p className="text-[10px] opacity-50 mb-2">Provider: <span className="font-bold opacity-100">{results.mxProvider || 'Unknown'}</span></p>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {results.mxRecords?.length ? results.mxRecords.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-surface-50 dark:bg-black/20 text-[11px] font-mono">
                    <span style={{ color: 'var(--color-text)' }}>{r.host}</span>
                    <span className="opacity-50">priority {r.priority}</span>
                  </div>
                )) : <p className="text-[11px] opacity-50">No MX records</p>}
              </div>
            </div>
          </div>

          {/* Issues + Strengths */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {results.issues?.length > 0 && (
              <div className="glass-card p-5 border-l-4 border-l-amber-500">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-amber-500">Issues ({results.issues.length})</h3>
                <ul className="space-y-1.5">
                  {results.issues.map((iss, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px]">
                      <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        iss.severity === 'critical' ? 'bg-red-500' :
                        iss.severity === 'high' ? 'bg-orange-500' :
                        iss.severity === 'medium' ? 'bg-amber-500' : 'bg-yellow-500'
                      }`} />
                      <span style={{ color: 'var(--color-text)' }}>{iss.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {results.strengths?.length > 0 && (
              <div className="glass-card p-5 border-l-4 border-l-emerald-500">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-emerald-500">Strengths ({results.strengths.length})</h3>
                <ul className="space-y-1.5">
                  {results.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px]">
                      <HiOutlineCheck className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span style={{ color: 'var(--color-text)' }}>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Gravatar */}
          {results.gravatar?.exists && (
            <div className="glass-card p-5 flex items-center gap-5">
              <img src={results.gravatar.avatarUrl} alt="" className="w-20 h-20 rounded-full border-2 border-brand-500/30" />
              <div className="flex-1">
                <h3 className="text-sm font-bold flex items-center gap-2"><HiOutlineUserCircle className="w-4 h-4" /> Public Gravatar Profile</h3>
                {results.gravatar.displayName && <p className="text-xs mt-1">{results.gravatar.displayName}</p>}
                {results.gravatar.location && <p className="text-[11px] opacity-60">{results.gravatar.location}</p>}
                {results.gravatar.about && <p className="text-[11px] opacity-60 mt-1">{results.gravatar.about}</p>}
                {results.gravatar.profileUrl && (
                  <a href={results.gravatar.profileUrl} target="_blank" rel="noreferrer" className="text-[11px] text-brand-500 hover:underline mt-2 inline-block">
                    View profile →
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, bad }) {
  return (
    <div className={`glass-card p-3 ${bad ? 'border-l-4 border-l-red-500' : ''}`}>
      <p className="text-[9px] font-bold uppercase tracking-widest opacity-50 mb-1">{label}</p>
      <p className={`text-sm font-bold font-mono ${bad ? 'text-red-500' : ''}`} style={!bad ? { color: 'var(--color-text)' } : undefined}>{value}</p>
    </div>
  );
}

function AuthRow({ label, present, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
      <div className="flex items-center gap-2">
        {present ? <HiOutlineCheck className="w-4 h-4 text-emerald-500" /> : <HiOutlineX className="w-4 h-4 text-red-500" />}
        <span className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>{label}</span>
      </div>
      <span className="text-[10px] font-mono opacity-60 truncate max-w-[60%] text-right">{value || '—'}</span>
    </div>
  );
}
