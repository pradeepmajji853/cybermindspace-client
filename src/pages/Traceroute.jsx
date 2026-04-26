import { useState } from 'react';
import {
  HiOutlineArrowRight, HiOutlineServer, HiOutlineGlobeAlt, HiOutlineLightningBolt,
  HiOutlineLocationMarker, HiOutlineChip, HiOutlineExclamationCircle,
} from 'react-icons/hi';
import client from '../api/client';
import toast from 'react-hot-toast';

export default function Traceroute() {
  const [host, setHost] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const startTrace = async () => {
    const target = host.trim();
    if (!target) return toast.error('Enter a host or IP');
    setLoading(true);
    setData(null);
    setError('');
    const t0 = performance.now();
    try {
      const { data: res } = await client.post('/tools/traceroute', { host: target });
      setData({ ...res, elapsedMs: Math.round(performance.now() - t0) });
      toast.success(`Trace complete — ${res.hops?.length || 0} hops`);
    } catch (e) {
      const msg = e.response?.data?.error || 'Traceroute failed';
      setError(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const totalLatency = data?.hops?.reduce((s, h) => s + (h.latency || 0), 0) || 0;
  const countries = data ? Array.from(new Set(data.hops.map(h => h.country).filter(Boolean))) : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm">
          <HiOutlineArrowRight className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Traceroute Visualizer</h1>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Real network path with geo-enriched hops, ASN, latency
          </p>
        </div>
      </div>

      <div className="glass-card p-6 flex gap-3">
        <input
          type="text"
          value={host}
          onChange={(e) => setHost(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && startTrace()}
          placeholder="Enter host or IP (e.g. 1.1.1.1, github.com)..."
          className="input-field flex-1 text-sm"
          disabled={loading}
        />
        <button onClick={startTrace} disabled={loading} className="btn-primary">
          {loading ? 'Tracing…' : 'Start Trace'}
        </button>
      </div>

      {error && (
        <div className="glass-card p-4 border-l-4 border-l-red-500 flex items-center gap-3">
          <HiOutlineExclamationCircle className="w-5 h-5 text-red-500" />
          <p className="text-xs text-red-500 font-medium">{error}</p>
        </div>
      )}

      {data && (
        <div className="space-y-5 animate-slide-up">
          {data.notice && (
            <div className="glass-card p-4 border-l-4 border-l-amber-500">
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">{data.notice}</p>
            </div>
          )}

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Total Hops"       value={data.hops?.length || 0} />
            <Stat label="Aggregate Latency" value={`${totalLatency.toFixed(1)} ms`} />
            <Stat label="Countries Crossed" value={countries.length} />
            <Stat label="Method"           value={data.method === 'system-traceroute' ? 'Live' : 'Resolved'} />
          </div>

          {/* Hops timeline */}
          <div className="relative">
            <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-500/40 to-emerald-500/40" />
            <div className="space-y-4">
              {data.hops.map((hop, i) => (
                <div key={i} className="flex items-start gap-6 relative z-10 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className={`w-14 h-14 rounded-full border-4 border-surface-50 dark:border-black flex items-center justify-center shadow-lg flex-shrink-0 ${
                    i === data.hops.length - 1 ? 'bg-brand-500 text-white' :
                    hop.status === 'timeout' ? 'bg-amber-500/30 text-amber-500' :
                    'bg-surface-100 dark:bg-surface-800 text-brand-500'
                  }`}>
                    {i === 0 ? <HiOutlineServer className="w-5 h-5" /> :
                     i === data.hops.length - 1 ? <HiOutlineGlobeAlt className="w-6 h-6" /> :
                     <span className="text-xs font-bold font-mono">{hop.hop}</span>}
                  </div>

                  <div className="flex-1 glass-card p-4 hover:border-brand-500/30 transition-all">
                    {hop.status === 'timeout' ? (
                      <div className="flex items-center gap-2 text-amber-500 text-xs font-mono">
                        <HiOutlineExclamationCircle /> Hop {hop.hop} — request timed out
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono font-bold" style={{ color: 'var(--color-text)' }}>{hop.ip}</span>
                            {hop.countryCode && (
                              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-500/10 text-brand-500">
                                {hop.countryCode}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-emerald-500 font-mono text-xs font-bold">
                            <HiOutlineLightningBolt className="w-3 h-3" />
                            {hop.latency != null ? `${hop.latency.toFixed(1)} ms` : '—'}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                          {hop.location && (
                            <div className="flex items-center gap-1.5"><HiOutlineLocationMarker className="w-3.5 h-3.5" /> {hop.location}</div>
                          )}
                          {hop.isp && (
                            <div className="flex items-center gap-1.5"><HiOutlineChip className="w-3.5 h-3.5" /> {hop.isp}</div>
                          )}
                          {hop.reverseDns && (
                            <div className="col-span-2 font-mono opacity-70 truncate">↳ {hop.reverseDns}</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
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
