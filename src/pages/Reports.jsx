import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { HiOutlineDocumentReport, HiOutlineDownload, HiOutlineBookmark, HiOutlineSearch, HiOutlineLightningBolt, HiOutlineLockClosed, HiOutlineCheck, HiOutlineShieldCheck, HiOutlineCode, HiOutlineGlobeAlt, HiOutlineChartBar } from 'react-icons/hi';
import toast from 'react-hot-toast';

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || 'majjipradeepkumar@gmail.com,almadadali786@gmail.com,dhyeybhuva2003@gmail.com,pateltushar1734@gmail.com,acromatic.tech@gmail.com,pradeepmajji853@gmail.com,majjipradeep4677@gmail.com').split(',');

export default function Reports() {
  const { userProfile } = useAuth();
  const isAdmin = userProfile && ADMIN_EMAILS.includes(userProfile.email);
  const plan = userProfile?.plan || 'free';
  const hasPro = isAdmin || plan === 'pro' || plan === 'elite';

  if (!hasPro) {
    return <ReportsShowcase />;
  }

  return <ReportsFull />;
}


/* ───────────────────────────────────────────────
   FREE USER: Rich animated feature showcase
   ─────────────────────────────────────────────── */
function ReportsShowcase() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in py-4">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest mx-auto">
          <HiOutlineDocumentReport className="w-4 h-4" /> Pro Reports
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
          Professional Investigation<br />
          <span className="text-gradient">Reports & Exports</span>
        </h1>
        <p className="text-sm max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Save, organize, and export your OSINT investigations as professional PDF reports — complete with risk scoring and detailed findings.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            icon: HiOutlineBookmark,
            title: 'Save Investigations',
            desc: 'Bookmark any scan result for later reference. Build a library of findings organized by target, type, and risk level.',
            color: 'text-brand-500',
            bg: 'bg-brand-500/10',
          },
          {
            icon: HiOutlineDownload,
            title: 'PDF Export',
            desc: 'Export investigations as professional, branded PDF reports. Share findings with clients, teams, or include in bug bounty submissions.',
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
          },
          {
            icon: HiOutlineChartBar,
            title: 'Risk Analytics',
            desc: 'Each report includes automated risk scoring, threat indicators, and severity ratings to help prioritize your findings.',
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
          },
        ].map(({ icon: Icon, title, desc, color, bg }, i) => (
          <div
            key={title}
            className="glass-card p-6 hover:border-brand-500/20 transition-all duration-300"
            style={{ animationDelay: `${i * 100}ms`, animation: 'slideUp 0.5s ease forwards', opacity: 0 }}
          >
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--color-text)' }}>{title}</h3>
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Report types */}
      <div className="glass-card p-8">
        <h2 className="text-lg font-bold mb-6 text-center" style={{ color: 'var(--color-text)' }}>Supported Investigation Types</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Email Intelligence', icon: '📧', color: 'bg-blue-500/10 border-blue-500/10' },
            { label: 'Domain Analysis', icon: '🌐', color: 'bg-purple-500/10 border-purple-500/10' },
            { label: 'IP Geolocation', icon: '📍', color: 'bg-emerald-500/10 border-emerald-500/10' },
            { label: 'Port Scanning', icon: '🔍', color: 'bg-amber-500/10 border-amber-500/10' },
            { label: 'Vulnerability Scan', icon: '🛡️', color: 'bg-red-500/10 border-red-500/10' },
            { label: 'Tech Stack Detection', icon: '⚙️', color: 'bg-cyan-500/10 border-cyan-500/10' },
            { label: 'WHOIS Privacy', icon: '🔒', color: 'bg-orange-500/10 border-orange-500/10' },
            { label: 'Subdomain Takeover', icon: '🎯', color: 'bg-pink-500/10 border-pink-500/10' },
          ].map(({ label, icon, color }) => (
            <div key={label} className={`p-4 rounded-xl border ${color} text-center transition-all hover:scale-[1.02]`}>
              <span className="text-2xl block mb-2">{icon}</span>
              <p className="text-[11px] font-semibold" style={{ color: 'var(--color-text)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mock report preview */}
      <div className="glass-card overflow-hidden relative">
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-transparent to-[var(--color-bg)] pointer-events-none" />
        <div className="p-6 opacity-25 blur-[3px] select-none pointer-events-none">
          <div className="flex items-center justify-between mb-4 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                <HiOutlineDocumentReport className="w-5 h-5 text-brand-500" />
              </div>
              <div>
                <p className="text-sm font-mono font-bold">example.com</p>
                <span className="text-[10px] text-emerald-500 font-bold">domain • Risk: 42</span>
              </div>
            </div>
            <button className="btn-primary text-xs py-2 px-4"><HiOutlineDownload className="w-4 h-4" /> Export PDF</button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl" style={{background:'var(--color-surface-hover)'}}>
              <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Subdomains</p>
              <p className="text-xl font-bold">23</p>
            </div>
            <div className="p-4 rounded-xl" style={{background:'var(--color-surface-hover)'}}>
              <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Open Ports</p>
              <p className="text-xl font-bold">7</p>
            </div>
            <div className="p-4 rounded-xl" style={{background:'var(--color-surface-hover)'}}>
              <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Vulnerabilities</p>
              <p className="text-xl font-bold text-red-500">3</p>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto shadow-glow">
              <HiOutlineLockClosed className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text)' }}>Unlock Reports</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Save investigations & export professional PDF reports</p>
            </div>
            <Link to="/billing" className="btn-primary py-3 px-8 text-sm shadow-glow inline-flex items-center gap-2">
              <HiOutlineLightningBolt className="w-4 h-4" />
              Upgrade to Pro — ₹199/mo
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center space-y-4 pb-6">
        <Link to="/billing" className="btn-primary py-3.5 px-10 text-sm shadow-glow inline-flex">
          <HiOutlineLightningBolt className="w-5 h-5" />
          Get Pro Access
        </Link>
        <p className="text-[10px] opacity-30">₹199/month • Cancel anytime • Instant access</p>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}


/* ───────────────────────────────────────────────
   PRO USER: Full Reports experience
   ─────────────────────────────────────────────── */
function ReportsFull() {
  const { userProfile } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const { data } = await client.get('/user/reports');
      setReports(data.reports);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (id) => {
    try {
      await client.patch(`/osint/${id}/save`);
      setReports(prev => prev.filter(r => r.id !== id));
      toast.success('Report removed from saved');
    } catch (err) {
      toast.error('Failed to unsave');
    }
  };

  const handleDownload = async (id) => {
    const loadingToast = toast.loading('Preparing download...');
    try {
      const response = await client.get(`/reports/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CyberMindSpace_Report_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Download started', { id: loadingToast });
    } catch (err) {
      toast.error('Download failed', { id: loadingToast });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <HiOutlineDocumentReport className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Saved Reports</h1>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Your bookmarked investigation reports</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={4} /></div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center">
            <HiOutlineBookmark className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-secondary)' }} />
            <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--color-text)' }}>No saved reports</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>Save investigations by clicking the bookmark icon on any result</p>
            <Link to="/tools/osint" className="btn-primary inline-flex text-sm">Start Investigation</Link>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {reports.map(report => (
              <div key={report.id} className="flex items-center justify-between px-5 py-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                    <HiOutlineDocumentReport className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm font-mono font-semibold" style={{ color: 'var(--color-text)' }}>{report.query}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`badge ${
                        report.inputType === 'email' ? 'badge-blue' :
                        report.inputType === 'ip' ? 'badge-purple' :
                        report.inputType === 'domain' ? 'badge-green' : 'badge-yellow'
                      }`}>{report.inputType}</span>
                      <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {report.riskScore !== undefined && (
                    <span className={`text-xs font-mono font-semibold ${
                      report.riskScore <= 30 ? 'risk-low' : report.riskScore <= 60 ? 'risk-medium' : 'risk-high'
                    }`}>Risk: {report.riskScore}</span>
                  )}
                  <button onClick={() => handleDownload(report.id)} className="btn-ghost text-xs py-1 px-2" title="Download PDF">
                    <HiOutlineDownload className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleUnsave(report.id)} className="btn-ghost text-xs py-1 px-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10" title="Remove from saved">
                    <HiOutlineBookmark className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
