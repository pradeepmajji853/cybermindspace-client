import { useState } from 'react';
import client from '../api/client';
import SearchBar from '../components/SearchBar';
import { CardSkeleton } from '../components/LoadingSkeleton';
import {
  HiOutlineSearchCircle, HiOutlineShieldCheck, HiOutlineClipboardCopy,
  HiOutlineCheck, HiOutlineLockClosed, HiOutlineLockOpen,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const RECORD_META = {
  A:     { color: 'emerald',  icon: '🟢',  desc: 'IPv4 addresses the domain points to' },
  AAAA:  { color: 'cyan',     icon: '🔵',  desc: 'IPv6 addresses' },
  MX:    { color: 'purple',   icon: '✉',  desc: 'Mail exchange servers' },
  TXT:   { color: 'blue',     icon: '📝',  desc: 'Text records (SPF, verifications)' },
  NS:    { color: 'amber',    icon: '🌐',  desc: 'Authoritative name servers' },
  SOA:   { color: 'pink',     icon: '⚙',  desc: 'Start of Authority' },
  CAA:   { color: 'rose',     icon: '🔐',  desc: 'Certificate Authority Authorization' },
  CNAME: { color: 'indigo',   icon: '🔁',  desc: 'Canonical name (alias)' },
  SRV:   { color: 'teal',     icon: '📡',  desc: 'Service location records' },
  DMARC: { color: 'violet',   icon: '🛡',  desc: 'Email authentication policy' },
  PTR:   { color: 'orange',   icon: '↩',  desc: 'Reverse DNS' },
};

function formatRecord(record) {
  if (typeof record === 'string') return record;
  if (record && typeof record === 'object') {
    if (record.exchange) return `${record.exchange} (priority ${record.priority})`;
    if (record.nsname)   return `nsname=${record.nsname}, hostmaster=${record.hostmaster}, serial=${record.serial}`;
    if (record.issue)    return `issue: ${record.issue}`;
    if (record.iodef)    return `iodef: ${record.iodef}`;
    return JSON.stringify(record);
  }
  return String(record);
}

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(String(value)); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700"
      title="Copy"
    >
      {copied ? <HiOutlineCheck className="w-3.5 h-3.5 text-emerald-500" />
              : <HiOutlineClipboardCopy className="w-3.5 h-3.5 opacity-60" />}
    </button>
  );
}

export default function DnsLookup() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleSearch = async (domain) => {
    setLoading(true);
    setResults(null);
    try {
      const { data } = await client.post('/tools/dns', { domain });
      setResults(data);
      toast.success('DNS lookup complete');
    } catch (err) { toast.error('DNS lookup failed'); }
    finally { setLoading(false); }
  };

  const presentRecords = results
    ? Object.entries(results.records).filter(([_, v]) => v && (Array.isArray(v) ? v.length > 0 : true))
    : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm">
          <HiOutlineSearchCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>DNS Lookup</h1>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Full DNS surface — A/AAAA/MX/TXT/NS/SOA/CAA/CNAME/SRV/PTR/DMARC + DNSSEC
          </p>
        </div>
      </div>

      <SearchBar onSearch={handleSearch} loading={loading} placeholder="Enter domain (e.g. cloudflare.com)..." />

      {loading && <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>}

      {results && (
        <div className="space-y-5 animate-slide-up">
          {/* Summary bar */}
          <div className="glass-card p-4 flex flex-wrap items-center gap-4 justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Domain</p>
              <p className="text-sm font-mono font-bold" style={{ color: 'var(--color-text)' }}>{results.domain}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Record types found</p>
              <p className="text-sm font-mono font-bold" style={{ color: 'var(--color-text)' }}>{presentRecords.length} / 11</p>
            </div>
            {results.dnssec && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${results.dnssec.enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                {results.dnssec.enabled ? <HiOutlineLockClosed className="w-4 h-4" /> : <HiOutlineLockOpen className="w-4 h-4" />}
                <span className="text-xs font-bold">DNSSEC: {results.dnssec.enabled ? 'Validated' : 'Not enabled'}</span>
              </div>
            )}
          </div>

          {/* Records grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {presentRecords.map(([type, recs]) => {
              const meta = RECORD_META[type] || { color: 'brand', icon: '📋', desc: '' };
              const arr = Array.isArray(recs) ? recs : [recs];
              return (
                <div key={type} className={`glass-card p-5 border-l-4 border-l-${meta.color}-500`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{meta.icon}</span>
                      <h3 className="text-sm font-bold tracking-wide" style={{ color: 'var(--color-text)' }}>{type} Records</h3>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 opacity-60">
                        {arr.length}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] opacity-50 mb-3">{meta.desc}</p>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {arr.map((r, i) => {
                      const formatted = formatRecord(r);
                      return (
                        <div key={i} className="flex items-center justify-between gap-3 p-2 rounded bg-surface-50 dark:bg-black/20 group">
                          <code className="text-[11px] font-mono break-all" style={{ color: 'var(--color-text)' }}>{formatted}</code>
                          <CopyButton value={formatted} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] font-mono opacity-40 text-center">
            Queried {new Date(results.queriedAt).toLocaleString()} via system resolver + Cloudflare DoH
          </p>
        </div>
      )}
    </div>
  );
}
