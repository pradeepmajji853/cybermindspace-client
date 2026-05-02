import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import toast from 'react-hot-toast';
import {
  HiOutlineLightningBolt,
  HiOutlineSearch,
  HiOutlineAcademicCap,
  HiOutlineFingerPrint,
  HiOutlineDatabase,
  HiOutlineLink,
  HiOutlineShieldCheck,
  HiOutlineExternalLink,
  HiOutlineCube,
  HiOutlineFire
} from 'react-icons/hi';

export default function ResearchSentinel() {
  const { userProfile } = useAuth();
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [research, setResearch] = useState(null);

  const runResearch = async (e) => {
    e?.preventDefault();
    if (!target.trim()) return toast.error('Enter a target domain');
    setLoading(true);
    setResearch(null);
    try {
      // Re-using the same recon scan which now includes research data
      const { data } = await client.post('/recon/scan', { target: target.trim() });
      if (data.parts?.research) {
        setResearch(data.parts.research);
        toast.success('PhD-Level Analysis Complete');
      } else {
        toast.error('Research module failed to return data');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Research failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-100 flex items-center gap-3">
            <HiOutlineAcademicCap className="w-10 h-10 text-brand-500" />
            Sentinel <span className="text-gradient">Research Engine</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-2xl">
            The advanced correlation layer for professional researchers. This tool maps infrastructure, extracts digital fingerprints, 
            and identifies hidden asset linkages that standard scanners miss.
          </p>
        </div>
        <div className="badge-purple px-4 py-2 rounded-xl border border-purple-500/30 flex items-center gap-2">
          <HiOutlineShieldCheck className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Elite Access</span>
        </div>
      </div>

      {/* Input */}
      <div className="glass-card p-2">
        <form onSubmit={runResearch} className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Enter domain (e.g., tesla.com)"
              className="w-full pl-12 pr-4 py-4 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-brand-500/40 bg-slate-900/40 text-slate-100 font-mono text-sm"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !target.trim()}
            className="btn-primary px-8 py-4 font-bold text-sm tracking-wide disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />
                Analyzing...
              </div>
            ) : (
              'Initiate Research'
            )}
          </button>
        </form>
      </div>

      {loading && <LoadingGrid />}

      {research ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
          {/* Main Research Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Summary Block */}
            <div className="glass-card p-6 bg-gradient-to-br from-brand-500/10 to-transparent border-l-4 border-l-brand-500">
              <h3 className="text-lg font-bold text-slate-100 mb-2">Executive Research Summary</h3>
              <p className="text-sm text-slate-300 leading-relaxed italic">
                "{research.summary}"
              </p>
            </div>

            {/* Infrastructure Map */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <HiOutlineDatabase className="w-5 h-5 text-brand-400" />
                  Infrastructure Mapping
                </h3>
                <span className="text-[10px] font-mono text-slate-500">{research.timestamp}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">ASN Information</p>
                  {research.infrastructure?.asn ? (
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-200">{research.infrastructure.asn.org}</p>
                      <p className="text-xs text-brand-400 font-mono">{research.infrastructure.asn.asn}</p>
                      <p className="text-xs text-slate-400">{research.infrastructure.asn.location} &middot; {research.infrastructure.asn.isp}</p>
                    </div>
                  ) : <p className="text-xs text-slate-600">No ASN data resolved.</p>}
                </div>

                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">IP Intelligence</p>
                  <div className="space-y-2">
                    {research.infrastructure?.ips?.map(ip => (
                      <div key={ip} className="flex items-center justify-between">
                        <code className="text-xs text-slate-300 font-mono">{ip}</code>
                        <HiOutlineExternalLink className="w-3 h-3 text-slate-600" />
                      </div>
                    )) || <p className="text-xs text-slate-600">No IPs resolved.</p>}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Cloud Presence</p>
                  <div className="space-y-2">
                    {research.infrastructure?.cloud?.length > 0 ? research.infrastructure.cloud.map((c, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-xs text-slate-300">{c.provider}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${c.status === 'EXPOSED/OPEN' ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-500'}`}>
                          {c.status}
                        </span>
                      </div>
                    )) : <p className="text-xs text-slate-600">No public cloud assets identified.</p>}
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Identity Proofing</p>
                   {research.favicon ? (
                    <div className="flex items-center gap-3">
                      <img src={research.favicon.url} className="w-8 h-8 rounded" alt="F" />
                      <div>
                        <p className="text-[10px] text-slate-500">Favicon Hash (Murmur3)</p>
                        <code className="text-xs text-brand-400 font-mono">{research.favicon.hash}</code>
                      </div>
                    </div>
                  ) : <p className="text-xs text-slate-600">No favicon identity found.</p>}
                </div>
              </div>
            </div>

            {/* TLS Analysis */}
            <div className="glass-card p-6">
               <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-6">
                <HiOutlineFingerPrint className="w-5 h-5 text-indigo-400" />
                Advanced TLS Cryptography
              </h3>
              {research.tls ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <TlsMeta label="Protocol" value={research.tls.protocol} />
                    <TlsMeta label="Cipher" value={research.tls.cipher} />
                    <TlsMeta label="Bits" value={`${research.tls.bits} bits`} />
                    <TlsMeta label="Issuer" value={research.tls.issuer} />
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Subject Alternative Names ({research.tls.sanCount})</p>
                    <div className="flex flex-wrap gap-2">
                      {research.tls.sanPreview.map(san => (
                        <code key={san} className="text-[10px] px-2 py-1 bg-slate-800/50 rounded text-slate-400 border border-slate-700/30">{san}</code>
                      ))}
                      {research.tls.sanCount > 5 && <span className="text-[10px] text-slate-600">+{research.tls.sanCount - 5} more</span>}
                    </div>
                  </div>
                </div>
              ) : <p className="text-sm text-slate-500">TLS research unavailable for this target.</p>}
            </div>
          </div>

          {/* Sidebar: Correlation & Research Points */}
          <div className="space-y-6">
            <div className="glass-card p-6 border-t-4 border-t-purple-500">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-6">
                <HiOutlineLink className="w-5 h-5 text-purple-400" />
                Research Correlation
              </h3>
              <div className="space-y-4">
                {research.correlationPoints?.length > 0 ? research.correlationPoints.map((point, i) => (
                  <div key={i} className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 relative pl-10">
                    <HiOutlineBeaker className="absolute left-3 top-4 w-4 h-4 text-purple-400" />
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">{point}</p>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <HiOutlineCube className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-xs text-slate-500 italic">No advanced linkages found yet.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
                <HiOutlineShieldCheck className="w-4 h-4 text-emerald-400" />
                Governance & Policy
              </h3>
              {research.governance?.securityTxt?.found ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">security.txt</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">FOUND</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/40">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Contacts</p>
                    <div className="space-y-1">
                      {research.governance.securityTxt.contacts.map((c, i) => (
                        <p key={i} className="text-[11px] text-slate-300 font-mono truncate">{c}</p>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <div className={`w-2 h-2 rounded-full ${research.governance.securityTxt.hasBounty ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                    <span className="text-[10px] text-slate-400">{research.governance.securityTxt.hasBounty ? 'Bounty Program Detected' : 'No Bounty Listed'}</span>
                  </div>
                </div>
              ) : <p className="text-xs text-slate-500 italic">No security.txt found.</p>}
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <button className="w-full btn-secondary text-xs py-3 justify-center gap-2">
                <HiOutlineExternalLink className="w-4 h-4" />
                Pivot to Shodan
              </button>
              <button className="w-full btn-secondary text-xs py-3 justify-center gap-2">
                <HiOutlineFire className="w-4 h-4" />
                Check Censys Intel
              </button>
            </div>
          </div>
        </div>
      ) : !loading && (
        <div className="text-center py-20">
          <HiOutlineAcademicCap className="w-20 h-20 text-slate-800 mx-auto mb-6 opacity-20" />
          <h2 className="text-xl font-bold text-slate-500">Awaiting Research Target</h2>
          <p className="text-sm text-slate-600 mt-2">Enter a domain above to initiate the Sentinel correlation engine.</p>
        </div>
      )}
    </div>
  );
}

function TlsMeta({ label, value }) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-xs font-bold text-slate-200 truncate">{value || 'N/A'}</p>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
      <div className="lg:col-span-2 space-y-6">
        <div className="h-24 bg-slate-800/40 rounded-2xl" />
        <div className="h-64 bg-slate-800/40 rounded-2xl" />
        <div className="h-48 bg-slate-800/40 rounded-2xl" />
      </div>
      <div className="space-y-6">
        <div className="h-96 bg-slate-800/40 rounded-2xl" />
        <div className="h-32 bg-slate-800/40 rounded-2xl" />
      </div>
    </div>
  );
}
