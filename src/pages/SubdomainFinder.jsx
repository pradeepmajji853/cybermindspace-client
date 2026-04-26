import { useState, useMemo } from 'react';
import client from '../api/client';
import { CardSkeleton } from '../components/LoadingSkeleton';
import {
  HiOutlineGlobeAlt, HiOutlineDownload, HiOutlineExternalLink,
  HiOutlineSearch, HiOutlineLightningBolt,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function SubdomainFinder() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [deep, setDeep] = useState(false);
  const [filter, setFilter] = useState('');

  const search = async () => {
    if (!domain.trim()) return toast.error('Enter a domain');
    setLoading(true); setResults(null);
    const t0 = performance.now();
    try {
      const { data } = await client.post('/tools/subdomains', { domain: domain.trim(), deep });
      setResults({ ...data, elapsedMs: Math.round(performance.now() - t0) });
      toast.success(`Found ${data.count} subdomains across ${data.sources.length} sources`);
    } catch (err) { toast.error('Search failed'); }
    finally { setLoading(false); }
  };

  const filtered = useMemo(() => {
    if (!results) return [];
    const list = results.enriched && results.enriched.length ? results.enriched : results.subdomains.map(s => ({ subdomain: s, ip: null }));
    if (!filter.trim()) return list;
    const q = filter.toLowerCase();
    return list.filter(r => r.subdomain.toLowerCase().includes(q) || (r.ip && r.ip.includes(q)));
  }, [results, filter]);

  const downloadList = (fmt) => {
    if (!results) return;
    const txt = fmt === 'csv'
      ? 'subdomain,ip\n' + (results.enriched || []).map(r => `${r.subdomain},${r.ip || ''}`).join('\n')
      : results.subdomains.join('\n');
    const blob = new Blob([txt], { type: fmt === 'csv' ? 'text/csv' : 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${results.domain}_subdomains.${fmt === 'csv' ? 'csv' : 'txt'}`;
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm">
          <HiOutlineGlobeAlt className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Subdomain Finder</h1>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Enumerate assets via crt.sh, AlienVault OTX, HackerTarget + DNS bruteforce
          </p>
        </div>
      </div>

      <div className="glass-card p-5 space-y-3">
        <div className="flex gap-3">
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            placeholder="Enter root domain (e.g. tesla.com)..."
            className="input-field flex-1 text-sm"
            disabled={loading}
          />
          <button onClick={search} disabled={loading} className="btn-primary">
            {loading ? 'Scanning…' : <><HiOutlineSearch className="w-4 h-4" /> Enumerate</>}
          </button>
        </div>
        <label className="flex items-center gap-2 text-xs cursor-pointer w-fit">
          <input type="checkbox" checked={deep} onChange={(e) => setDeep(e.target.checked)} className="accent-brand-500" />
          <span style={{ color: 'var(--color-text-secondary)' }}>Deep mode — also bruteforce common subdomain dictionary (slower)</span>
        </label>
      </div>

      {loading && <CardSkeleton />}

      {results && (
        <div className="space-y-4 animate-slide-up">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Total found"  value={results.count} />
            <Stat label="With IP"      value={(results.enriched || []).filter(r => r.ip).length} />
            <Stat label="Sources"      value={results.sources.length} />
            <Stat label="Time"         value={`${(results.elapsedMs / 1000).toFixed(1)}s`} />
          </div>

          {/* Source pills */}
          <div className="flex flex-wrap gap-2">
            {results.sources.map(s => (
              <span key={s} className="text-[10px] font-mono px-2 py-1 rounded bg-brand-500/10 text-brand-500 border border-brand-500/20">
                <HiOutlineLightningBolt className="w-3 h-3 inline mr-1" />{s}
              </span>
            ))}
          </div>

          {/* Filter + downloads */}
          <div className="glass-card p-4 flex flex-wrap items-center gap-3 justify-between">
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter subdomains or IPs…"
              className="input-field text-sm flex-1 min-w-[180px]"
            />
            <div className="flex gap-2">
              <button onClick={() => downloadList('txt')} className="btn-ghost text-xs"><HiOutlineDownload className="w-4 h-4" /> .txt</button>
              <button onClick={() => downloadList('csv')} className="btn-ghost text-xs"><HiOutlineDownload className="w-4 h-4" /> .csv</button>
            </div>
          </div>

          {/* Results grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map(({ subdomain, ip }) => (
              <div key={subdomain} className="glass-card p-3 flex items-center justify-between gap-3 hover:border-brand-500/30 transition-colors group">
                <div className="min-w-0">
                  <p className="text-xs font-mono truncate" style={{ color: 'var(--color-text)' }}>{subdomain}</p>
                  {ip && <p className="text-[10px] font-mono opacity-50">→ {ip}</p>}
                </div>
                <a href={`https://${subdomain}`} target="_blank" rel="noreferrer" className="text-surface-400 hover:text-brand-500 transition-colors flex-shrink-0">
                  <HiOutlineExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-xs opacity-50 py-8">No subdomains match your filter</p>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="glass-card p-3">
      <p className="text-[9px] font-bold uppercase tracking-widest opacity-50 mb-1">{label}</p>
      <p className="text-sm font-bold font-mono" style={{ color: 'var(--color-text)' }}>{value}</p>
    </div>
  );
}
