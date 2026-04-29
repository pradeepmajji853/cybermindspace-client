import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import LockedSection from '../components/LockedSection';
import ReportModal from '../components/ReportModal';
import toast from 'react-hot-toast';
import {
  HiOutlineSearch,
  HiOutlineChip,
  HiOutlineLightningBolt,
  HiOutlineExclamation,
  HiOutlineCheckCircle,
  HiOutlineGlobe,
  HiOutlineCode,
  HiOutlineClipboardCopy,
  HiOutlineFire,
  HiOutlineShieldExclamation,
  HiOutlineLockClosed,
  HiOutlineDownload,
  HiOutlineDocumentText,
  HiOutlineClock,
  HiOutlineBeaker,
  HiOutlineCheck,
  HiOutlineXCircle,
} from 'react-icons/hi';

const STEPS = [
  { id: 1, key: 'recon', label: 'Recon', desc: 'Map the surface' },
  { id: 2, key: 'analysis', label: 'Analysis', desc: 'Score the risk' },
  { id: 3, key: 'findings', label: 'Verified Findings', desc: 'Proof + reports' },
];

const SEV_COLOR = {
  critical: 'text-red-400 bg-red-500/10 border-red-500/30',
  high: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  low: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
  info: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  good: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

export default function Recon() {
  const { userProfile } = useAuth();
  const plan = userProfile?.plan || 'free';
  const isPro = plan === 'pro' || plan === 'elite';
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const [reportModal, setReportModal] = useState(null);

  const runScan = async (e) => {
    e?.preventDefault();
    const t = target.trim();
    if (!t) return toast.error('Enter a domain, email, or username');
    setLoading(true);
    setReport(null);
    setActiveStep(1);
    try {
      const { data } = await client.post('/recon/scan', { target: t });
      setReport(data);
      const findingsCount = data.summary?.verifiedFindings ?? data.findings?.length ?? 0;
      setActiveStep(findingsCount > 0 ? 3 : 2);
      const sec = (data.elapsedMs / 1000).toFixed(1);
      toast.success(`${findingsCount} verified finding${findingsCount === 1 ? '' : 's'} in ${sec}s`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Scan failed');
    } finally {
      setLoading(false);
    }
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied');
  };

  const downloadPDF = async () => {
    if (!report?.id) return toast.error('Run a scan first');
    if (!isPro) return toast.error('PDF reports are Pro-only');
    const t = toast.loading('Generating PDF...');
    try {
      const res = await client.get(`/recon/${report.id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `CyberMindSpace_Recon_${report.target}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded', { id: t });
    } catch (err) {
      toast.error(err.response?.data?.error || 'PDF failed', { id: t });
    }
  };

  const generateReport = async (findingIndex) => {
    if (!report?.id) return;
    if (!isPro) return toast.error('Report generation is Pro-only');
    const t = toast.loading('Building report...');
    try {
      const { data } = await client.post('/recon/report', {
        scanId: report.id,
        findingIndex,
      });
      setReportModal(data.report);
      toast.success('Report ready', { id: t });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Report failed', { id: t });
    }
  };

  const revalidate = async (finding, idx) => {
    if (!isPro) return toast.error('Live re-validation is Pro-only');
    const t = toast.loading('Re-running validator...');
    try {
      let kind, payload;
      if (finding.kind === 'cors') {
        kind = 'cors';
        payload = { kind, target: finding.where };
      } else if (finding.kind?.startsWith('exposure:')) {
        kind = 'exposure';
        const exposureKind = finding.kind.split(':')[1];
        try {
          const u = new URL(finding.where);
          payload = { kind, target: u.origin, path: u.pathname.replace(/^\//, ''), exposureKind };
        } catch (_) {
          payload = { kind, target: finding.where, path: '', exposureKind };
        }
      } else if (finding.kind === 'endpoint-secret-leak') {
        kind = 'endpoint-secret';
        payload = { kind, target: finding.where };
      } else {
        toast.dismiss(t);
        return toast('This finding type is not re-validatable inline', { icon: 'ℹ️' });
      }
      const { data } = await client.post('/recon/validate', payload);
      if (data.exploitable) {
        toast.success('Still exploitable — proof refreshed', { id: t });
        // Update inline proof
        setReport((prev) => {
          if (!prev) return prev;
          const next = { ...prev, findings: [...prev.findings] };
          next.findings[idx] = { ...next.findings[idx], proof: data.finding.proof, validatedAt: data.finding.validatedAt };
          return next;
        });
      } else {
        toast.success('No longer exploitable — patched 🎉', { id: t });
        setReport((prev) => {
          if (!prev) return prev;
          const next = { ...prev, findings: [...prev.findings] };
          next.findings[idx] = { ...next.findings[idx], stale: true };
          return next;
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Validation failed', { id: t });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="glass-card p-7 relative overflow-hidden border-l-4 border-l-brand-500">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-brand opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight">
              Find real vulnerabilities. <span className="text-gradient">Generate reports instantly.</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Live validation only — every finding has captured proof. Skip 30 minutes of manual recon per target.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${isPro ? 'badge-blue' : 'badge-yellow'}`}>
              {isPro ? '⭐ Pro' : 'Free Tier'}
            </span>
          </div>
        </div>

        <form onSubmit={runScan} className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="example.com, user@example.com, or username"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/40 transition text-sm font-mono"
              style={{ background: 'var(--color-surface-hover)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !target.trim()}
            className="btn-primary px-6 py-3.5 text-sm justify-center sm:min-w-[200px] disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Validating...
              </>
            ) : (
              <>
                <HiOutlineLightningBolt className="w-4 h-4" />
                Find &amp; Verify
              </>
            )}
          </button>
        </form>
      </div>

      {/* Time saved banner */}
      {report?.timeSaved && (
        <TimeSavedBanner timeSaved={report.timeSaved} findings={report.findings?.length || 0} />
      )}

      {/* Step Tracker */}
      <div className="grid grid-cols-3 gap-3">
        {STEPS.map((s) => {
          const done = report && s.id <= activeStep;
          const active = s.id === activeStep;
          return (
            <button
              key={s.id}
              onClick={() => report && setActiveStep(s.id)}
              disabled={!report}
              className={`glass-card p-4 text-left transition-all ${
                active ? 'border-brand-500/50 ring-1 ring-brand-500/30 shadow-glow' : ''
              } ${!report ? 'opacity-50 cursor-not-allowed' : 'hover:border-brand-500/30'}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                    done ? 'bg-gradient-brand text-white shadow-glow-sm' : 'bg-slate-800/40 text-slate-500'
                  }`}
                >
                  {done && !active ? <HiOutlineCheckCircle className="w-5 h-5" /> : s.id}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-300">{s.label}</p>
                  <p className="text-[11px] text-slate-500 truncate">{s.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {!report && !loading && <EmptyState />}
      {loading && <LoadingState />}

      {report && activeStep === 1 && <StepRecon report={report} isPro={isPro} copy={copy} />}
      {report && activeStep === 2 && <StepAnalysis report={report} />}
      {report && activeStep === 3 && (
        <StepFindings
          report={report}
          isPro={isPro}
          onGenerate={generateReport}
          onRevalidate={revalidate}
        />
      )}

      {report && (
        <div className="flex items-center justify-between pt-2 gap-2">
          <button
            onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
            disabled={activeStep === 1}
            className="btn-secondary px-4 py-2.5 text-xs disabled:opacity-30"
          >
            ← Previous
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadPDF}
              disabled={!isPro}
              className={`px-4 py-2.5 text-xs rounded-xl flex items-center gap-2 transition ${
                isPro
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-slate-800/40 border border-slate-700/40 text-slate-500 cursor-not-allowed'
              }`}
              title={isPro ? 'Download PDF report' : 'PDF export is Pro-only'}
            >
              {isPro ? <HiOutlineDownload className="w-4 h-4" /> : <HiOutlineLockClosed className="w-4 h-4" />}
              Export PDF
            </button>
            <button
              onClick={() => setActiveStep(Math.min(3, activeStep + 1))}
              disabled={activeStep === 3}
              className="btn-primary px-4 py-2.5 text-xs disabled:opacity-30"
            >
              Next Step →
            </button>
          </div>
        </div>
      )}

      {reportModal && (
        <ReportModal report={reportModal} onClose={() => setReportModal(null)} />
      )}
    </div>
  );
}

/* ─────── Time-saved banner ─────── */
function TimeSavedBanner({ timeSaved, findings }) {
  return (
    <div className="glass-card p-4 flex items-center justify-between gap-4 border-l-4 border-l-emerald-500">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
          <HiOutlineClock className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-400">Time Saved</p>
          <p className="text-sm font-bold text-slate-100">
            {timeSaved.minutesSaved} minutes &middot; {timeSaved.probesRun} manual checks automated
          </p>
        </div>
      </div>
      <div className="hidden md:block text-right">
        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Verified Findings</p>
        <p className="text-2xl font-black text-slate-100">{findings}</p>
      </div>
    </div>
  );
}

/* ─────── Step 1: RECON ─────── */
function StepRecon({ report, isPro, copy }) {
  const subs = report.parts?.subdomains || [];
  const endpoints = report.parts?.endpoints || [];
  const tech = report.parts?.tech?.technologies || [];
  const locked = report.locked || {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Panel icon={<HiOutlineGlobe className="w-5 h-5 text-sky-400" />} title="Subdomains Discovered" count={report.summary?.subdomainCount || subs.length}>
        {subs.length === 0 ? <Empty msg="No subdomains discovered" /> : (
          <ul className="divide-y divide-slate-800/40">
            {subs.map((s) => (
              <li key={s} className="py-2 flex items-center justify-between gap-2 group">
                <code className="text-[13px] font-mono text-slate-200 truncate">{s}</code>
                <button onClick={() => copy(s)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-brand-400 transition">
                  <HiOutlineClipboardCopy className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {!isPro && locked.subdomains > 0 && (
          <div className="mt-3"><LockedSection variant="tile" count={locked.subdomains} title="More subdomains found" description="Free tier shows 5. Pro reveals every host on the surface." /></div>
        )}
      </Panel>

      <Panel icon={<HiOutlineCode className="w-5 h-5 text-indigo-400" />} title="Endpoints (Wayback)" count={report.summary?.endpointCount || endpoints.length}>
        {endpoints.length === 0 ? <Empty msg="No archived endpoints" /> : (
          <ul className="divide-y divide-slate-800/40">
            {endpoints.map((e, i) => (
              <li key={i} className="py-2 flex items-center justify-between gap-2 group">
                <a href={e.url} target="_blank" rel="noreferrer" className="text-[12px] font-mono text-slate-300 truncate hover:text-brand-400">{e.url}</a>
                {e.status && <span className="text-[10px] font-bold text-slate-500">{e.status}</span>}
              </li>
            ))}
          </ul>
        )}
        {!isPro && locked.endpoints > 0 && (
          <div className="mt-3"><LockedSection variant="tile" count={locked.endpoints} title="More endpoints discovered" description="Pro unlocks the full Wayback path index." /></div>
        )}
      </Panel>

      <Panel icon={<HiOutlineChip className="w-5 h-5 text-emerald-400" />} title="Tech Stack" count={report.summary?.techCount || tech.length}>
        {tech.length === 0 ? <Empty msg="No fingerprintable technology" /> : (
          <div className="flex flex-wrap gap-2">
            {tech.map((t, i) => (
              <span key={i} className="text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-800/40 border border-slate-700/50 text-slate-200">
                <span className="font-semibold">{t.name}</span>
                {t.version && <span className="text-slate-500 ml-1">{t.version}</span>}
              </span>
            ))}
          </div>
        )}
        {!isPro && locked.tech > 0 && (
          <div className="mt-3"><LockedSection variant="tile" count={locked.tech} title="More tech fingerprinted" /></div>
        )}
      </Panel>

      <Panel icon={<HiOutlineFire className="w-5 h-5 text-orange-400" />} title="Open Services" count={(report.parts?.port?.ports || []).filter((p) => p.status === 'open').length}>
        {(() => {
          const open = (report.parts?.port?.ports || []).filter((p) => p.status === 'open');
          if (!open.length) return <Empty msg="No open services in scanned range" />;
          return (
            <ul className="space-y-1.5">
              {open.map((p, i) => (
                <li key={i} className="flex items-center justify-between text-[12px]">
                  <code className="font-mono text-slate-200">{p.service}:{p.port}</code>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${SEV_COLOR[p.risk] || SEV_COLOR.info}`}>
                    {(p.risk || 'open').toUpperCase()}
                  </span>
                </li>
              ))}
            </ul>
          );
        })()}
      </Panel>
    </div>
  );
}

/* ─────── Step 2: ANALYSIS ─────── */
function StepAnalysis({ report }) {
  const risk = report.risk || { score: 0, indicators: [] };
  const findings = report.findings || [];
  const counts = {
    critical: findings.filter((f) => f.severity === 'critical').length,
    high: findings.filter((f) => f.severity === 'high').length,
    medium: findings.filter((f) => f.severity === 'medium').length,
    low: findings.filter((f) => f.severity === 'low').length,
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ScoreCard label="Risk Score" value={`${risk.score}/100`} severity={risk.score >= 60 ? 'high' : risk.score >= 30 ? 'medium' : 'low'} />
        <ScoreCard label="Verified Findings" value={findings.length} severity={findings.length > 0 ? 'high' : 'good'} />
        <ScoreCard label="Exploitable" value={findings.filter((f) => f.exploitable).length} severity="critical" />
        <ScoreCard label="Critical" value={counts.critical} severity="critical" />
      </div>

      <Panel icon={<HiOutlineExclamation className="w-5 h-5 text-amber-400" />} title="Severity Breakdown">
        {findings.length === 0 ? (
          <p className="text-[12px] text-slate-400">No verified findings. Surface looks clean — try a different target or check Step 1 for raw recon.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(counts).map(([sev, n]) => (
              <div key={sev} className={`p-3 rounded-lg border ${SEV_COLOR[sev]}`}>
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">{sev}</p>
                <p className="text-2xl font-black mt-1">{n}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {risk.indicators.length > 0 && (
        <Panel icon={<HiOutlineExclamation className="w-5 h-5 text-amber-400" />} title="Risk Indicators">
          <ul className="space-y-2">
            {risk.indicators.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-slate-300">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}

/* ─────── Step 3: VERIFIED FINDINGS ─────── */
function StepFindings({ report, isPro, onGenerate, onRevalidate }) {
  const findings = report.findings || [];
  const locked = report.locked || {};

  if (findings.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <HiOutlineCheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-200 mb-2">No exploitable issues verified</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Every probe came back clean — no proof of CORS misconfig, no exposed secrets, no takeover candidates. Try a different target or check the raw recon in Step 1 for leads.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-200">{findings.length} Verified Findings</h2>
        <span className="text-[10px] text-slate-500">
          Every finding below has captured proof — no AI guesses.
        </span>
      </div>

      {findings.map((f, i) => (
        <FindingCard
          key={i}
          finding={f}
          index={i}
          isPro={isPro}
          onGenerate={() => onGenerate(i)}
          onRevalidate={() => onRevalidate(f, i)}
        />
      ))}

      {!isPro && locked.findings > 0 && (
        <LockedSection
          variant="tile"
          count={locked.findings}
          title="More verified findings hidden"
          description="Free tier shows the first 2 with redacted proof. Pro reveals every finding, full proof block, and one-click bug-bounty report generation."
        />
      )}
    </div>
  );
}

function FindingCard({ finding, index, isPro, onGenerate, onRevalidate }) {
  const [showProof, setShowProof] = useState(false);
  const sevClass = SEV_COLOR[finding.severity] || SEV_COLOR.info;
  const isLocked = finding.locked;

  return (
    <div className={`glass-card p-5 ${finding.stale ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${sevClass}`}>
              {finding.severity?.toUpperCase()}
            </span>
            {finding.exploitable && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">
                EXPLOITABLE
              </span>
            )}
            {finding.stale && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                PATCHED
              </span>
            )}
            <span className="text-[10px] text-slate-500">#{index + 1}</span>
          </div>
          <h3 className="text-sm font-bold text-slate-100 leading-snug">{finding.title}</h3>
          <p className="text-[11px] font-mono text-slate-500 mt-1 truncate">{finding.where}</p>
        </div>
      </div>

      {!isLocked && finding.impact && (
        <p className="text-[12px] text-slate-300 leading-relaxed mb-3">{finding.impact}</p>
      )}

      {/* Proof block */}
      {!isLocked && (finding.proof?.request || finding.proof?.response) && (
        <div className="mb-3">
          <button
            onClick={() => setShowProof((v) => !v)}
            className="text-[11px] font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1 mb-2"
          >
            <HiOutlineDocumentText className="w-3.5 h-3.5" />
            {showProof ? 'Hide' : 'Show'} captured proof
          </button>
          {showProof && (
            <div className="space-y-2">
              {finding.proof.request && (
                <pre className="text-[10px] font-mono text-slate-300 bg-slate-900/40 p-3 rounded-lg border border-slate-800/40 whitespace-pre-wrap break-all">
                  {finding.proof.request}
                </pre>
              )}
              {finding.proof.response && (
                <pre className="text-[10px] font-mono text-slate-300 bg-slate-900/40 p-3 rounded-lg border border-slate-800/40 whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
                  {finding.proof.response}
                </pre>
              )}
              {finding.proof.secrets?.length > 0 && (
                <div className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/30">
                  <p className="text-[9px] uppercase tracking-widest font-bold text-red-400 mb-1.5">Secret patterns detected (redacted)</p>
                  {finding.proof.secrets.map((s, i) => (
                    <p key={i} className="text-[10px] font-mono text-red-300">
                      <span className="text-slate-500">{s.kind}:</span> {s.redacted}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {isLocked && (
        <div className="mb-3 p-3 rounded-lg bg-slate-800/30 border border-dashed border-slate-700/50 text-center">
          <HiOutlineLockClosed className="w-4 h-4 text-slate-500 inline mr-1.5" />
          <span className="text-[11px] text-slate-400">Proof, impact, and fix are Pro-only</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/40">
        <span className="text-[10px] text-slate-500">
          Validated {finding.validatedAt ? new Date(finding.validatedAt).toLocaleTimeString() : '—'}
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {!isLocked && (
            <button
              onClick={onRevalidate}
              disabled={!isPro}
              className="text-[11px] py-1.5 px-3 rounded-lg bg-slate-800/40 border border-slate-700/50 text-slate-300 hover:bg-slate-700/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              title={isPro ? 'Re-run the validator now' : 'Pro-only'}
            >
              <HiOutlineBeaker className="w-3.5 h-3.5" />
              Re-validate
            </button>
          )}
          <button
            onClick={onGenerate}
            disabled={!isPro || isLocked}
            className="btn-primary text-[11px] py-1.5 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
            title={isPro ? 'Generate bug-bounty report' : 'Pro-only'}
          >
            {isPro && !isLocked ? <HiOutlineDocumentText className="w-3.5 h-3.5" /> : <HiOutlineLockClosed className="w-3.5 h-3.5" />}
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────── Reusable bits ─────── */
function Panel({ icon, title, count, children }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          {icon}
          <h3 className="text-sm font-bold text-slate-100">{title}</h3>
        </div>
        {count != null && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-800/40 px-2 py-1 rounded">
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function ScoreCard({ label, value, severity }) {
  const color = SEV_COLOR[severity] || SEV_COLOR.info;
  return (
    <div className={`glass-card p-5 border-l-4 ${color.split(' ').find((c) => c.startsWith('border-')) || 'border-l-slate-500'}`}>
      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">{label}</p>
      <p className="text-3xl font-black mt-2 text-slate-100">{value}</p>
    </div>
  );
}

function Empty({ msg }) {
  return <p className="text-[12px] text-slate-500 italic py-3 text-center">{msg}</p>;
}

function EmptyState() {
  return (
    <div className="glass-card p-12 text-center">
      <HiOutlineSearch className="w-12 h-12 text-slate-600 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-slate-200 mb-2">Find real vulnerabilities. Generate reports instantly.</h3>
      <p className="text-sm text-slate-400 max-w-md mx-auto">
        Drop in a domain. We map the surface, run live validators, and only show findings backed by captured proof. One click → bug-bounty report.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="glass-card p-12 text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow animate-pulse">
        <HiOutlineLightningBolt className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-base font-bold text-slate-200 mb-2">Running live validators...</h3>
      <p className="text-xs text-slate-500">CORS · Exposed paths · Secrets · Takeover signatures · TLS · Headers · Cookies · Endpoints</p>
    </div>
  );
}
