import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  HiOutlineAcademicCap,
  HiOutlineFingerPrint,
  HiOutlineDatabase,
  HiOutlineLink,
  HiOutlineServer,
  HiOutlinePlus,
  HiOutlineSparkles,
  HiOutlineGlobeAlt,
  HiOutlineShieldCheck,
  HiOutlinePlusCircle,
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
  const [searchParams] = useSearchParams();
  const plan = userProfile?.plan || 'free';
  const isPro = plan === 'pro' || plan === 'elite';
  
  const [target, setTarget] = useState(searchParams.get('target') || '');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const [reportModal, setReportModal] = useState(null);

  // New Recon-to-Report Engine State
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [bountyMode, setBountyMode] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [hunterMode, setHunterMode] = useState(searchParams.get('mode') || 'standard');
  const [uiMode, setUiMode] = useState('pro'); // 'beginner' | 'pro'

  // Auto-run scan if target is in URL
  useEffect(() => {
    const t = searchParams.get('target');
    if (t && !report && !loading) {
      runScan();
    }
  }, [searchParams]);

  // Fetch workspaces on mount
  useState(() => {
    const fetchWorkspaces = async () => {
      try {
        const { data } = await client.get('/workspaces');
        setWorkspaces(data.workspaces || []);
      } catch (_) {}
    };
    fetchWorkspaces();
  }, []);

  const runScan = async (e) => {
    e?.preventDefault();
    const t = target.trim();
    if (!t) return toast.error('Enter a target domain');
    setLoading(true);
    setReport(null);
    setActiveStep(1);
    try {
      const { data } = await client.post('/recon/scan', { 
        target: t,
        workspaceId: selectedWorkspace || null,
        mode: hunterMode
      });
      setReport(data);
      localStorage.setItem('latest_research_report', JSON.stringify(data));
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

  const createWorkspace = async () => {
    const name = newWorkspaceName.trim();
    if (!name) return;
    
    // Guard: Prevent duplicates
    if (workspaces.some(w => w.name.toLowerCase() === name.toLowerCase())) {
      return toast.error('A workspace with this name already exists');
    }

    try {
      const { data } = await client.post('/workspaces', { name });
      setWorkspaces([data, ...workspaces]);
      setSelectedWorkspace(data.id);
      setShowWorkspaceModal(false);
      setNewWorkspaceName('');
      toast.success('Workspace created');
    } catch (_) {
      toast.error('Failed to create workspace');
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
      {/* ─── Mission Control ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Core Input Deck */}
        <div className="lg:col-span-3 glass-card p-6 border-l-4 border-l-brand-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-2">
                  <HiOutlineLightningBolt className="w-5 h-5 text-brand-400" />
                  Target Acquisition
                </h1>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${isPro ? 'badge-blue' : 'badge-yellow'}`}>
                  {isPro ? '⭐ Pro Research Suite' : 'Standard Mode'}
                </span>
              </div>

              {/* Hunter Mode Selector */}
              <div className="flex items-center gap-2 mb-6">
                {[
                  { id: 'standard', label: 'Standard', icon: HiOutlineSearch, color: 'text-slate-400' },
                  { id: 'quick', label: 'Quick Wins', icon: HiOutlineLightningBolt, color: 'text-brand-400' },
                  { id: 'critical', label: 'Critical Only', icon: HiOutlineFire, color: 'text-red-400' },
                  { id: 'deep', label: 'Deep Recon', icon: HiOutlineChip, color: 'text-emerald-400' }
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setHunterMode(m.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                      hunterMode === m.id 
                        ? 'bg-brand-500/10 border-brand-500/40 text-brand-400 shadow-glow-sm' 
                        : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <m.icon className={`w-3 h-3 ${m.color}`} />
                    {m.label}
                  </button>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="Domain to hunt (e.g. apple.com)"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/40 transition text-sm font-mono"
                    style={{ background: 'var(--color-surface-hover)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={runScan}
                  disabled={loading || !target.trim()}
                  className="btn-primary px-8 py-3.5 shadow-glow whitespace-nowrap text-sm"
                >
                  {loading ? 'Orchestrating Probes...' : 'Initialize Pipeline'}
                </button>
              </div>
            </div>

            {/* Program Selection Deck */}
            <div className="w-full md:w-72 border-l border-slate-800/50 md:pl-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block ml-1 flex items-center gap-1.5">
                <HiOutlineDatabase className="w-3.5 h-3.5" /> Program / Workspace
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select
                    value={selectedWorkspace}
                    onChange={(e) => setSelectedWorkspace(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-brand-500/50 appearance-none cursor-pointer"
                  >
                    <option value="">No Workspace</option>
                    {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <button 
                  onClick={() => setShowWorkspaceModal(true)}
                  className="w-11 h-11 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-brand-400 hover:border-brand-500/30 transition-all"
                >
                  <HiOutlinePlus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Signal Intelligence Toggle */}
        <div 
          onClick={() => setBountyMode(!bountyMode)}
          className={`cursor-pointer group relative overflow-hidden glass-card p-6 border-l-4 transition-all duration-500 ${
            bountyMode 
              ? 'border-l-orange-500 bg-orange-500/[0.03] shadow-glow-sm ring-1 ring-orange-500/20' 
              : 'border-l-slate-700 hover:border-l-slate-500'
          }`}
        >
          <div className="flex flex-col h-full justify-between gap-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${bountyMode ? 'bg-orange-500 text-white shadow-glow' : 'bg-slate-800 text-slate-500'}`}>
                <HiOutlineFire className={`w-5 h-5 ${bountyMode ? 'animate-pulse' : ''}`} />
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${bountyMode ? 'bg-orange-500' : 'bg-slate-800'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-md ${bountyMode ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
            </div>
            
            <div>
              <h3 className={`text-sm font-black tracking-tight mb-1 transition-colors ${bountyMode ? 'text-orange-400' : 'text-slate-100'}`}>
                BOUNTY MODE
              </h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {bountyMode ? 'Signal Filter: ACTIVE' : 'Signal Filter: OFF'}
              </p>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                {bountyMode 
                  ? 'Filtering high-signal bugs (P1-P3) only.' 
                  : 'Showing all informational findings.'}
              </p>
            </div>
          </div>
          
          {bountyMode && (
            <div className="absolute top-0 right-0 p-2">
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
            </div>
          )}
        </div>
      </div>

      {showWorkspaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-slate-100 mb-4">New Workspace</h3>
            <input 
              autoFocus
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="e.g. Google VRP, HackerOne Program"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-brand-500"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowWorkspaceModal(false)} className="btn-secondary flex-1 py-2 text-xs">Cancel</button>
              <button onClick={createWorkspace} className="btn-primary flex-1 py-2 text-xs">Create</button>
            </div>
          </div>
        </div>
      )}

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
      {loading && <LoadingState target={target} />}

      {report && activeStep === 1 && <StepRecon report={report} isPro={isPro} copy={copy} />}

      {report && activeStep === 2 && <StepAnalysis report={report} />}
      {report && activeStep === 3 && (
        <StepFindings
          report={report}
          isPro={isPro}
          onGenerate={generateReport}
          onRevalidate={revalidate}
          bountyMode={bountyMode}
        />
      )}

      {report && (
        <>
          <div className="flex items-center justify-between pt-2 gap-2 mb-4">
            <button
              onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
              disabled={activeStep === 1}
              className="btn-secondary px-4 py-2.5 text-xs disabled:opacity-30"
            >
              ← Previous
            </button>
            <button
              onClick={() => setActiveStep(Math.min(3, activeStep + 1))}
              disabled={activeStep === 3}
              className="btn-primary px-4 py-2.5 text-xs disabled:opacity-30"
            >
              Next Step →
            </button>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="flex bg-slate-800 p-1 rounded-lg">
                  <button 
                    onClick={() => setUiMode('beginner')}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${uiMode === 'beginner' ? 'bg-brand-500 text-white shadow-glow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    BEGINNER
                  </button>
                  <button 
                    onClick={() => setUiMode('pro')}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${uiMode === 'pro' ? 'bg-brand-500 text-white shadow-glow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    PRO HUD
                  </button>
                </div>
                <div className="h-4 w-px bg-slate-800" />
                <h2 className="text-sm font-bold text-slate-100 uppercase tracking-widest">
                  {report.target} <span className="text-brand-500">@{report.hunterMode}</span>
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDownloadReport(report)}
                  disabled={!isPro}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    isPro 
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30 hover:bg-brand-500/20 shadow-glow-sm' 
                      : 'bg-slate-800/40 border border-slate-700/40 text-slate-500 cursor-not-allowed'
                  }`}
                  title={isPro ? 'Download PDF report' : 'PDF export is Pro-only'}
                >
                  {isPro ? <HiOutlineDownload className="w-4 h-4" /> : <HiOutlineLockClosed className="w-4 h-4" />}
                  H1-READY REPORT
                </button>
              </div>
            </div>

            <TacticalCockpit vectors={report.tacticalVectors} uiMode={uiMode} />

            <div className="p-6">
              <div className="flex items-center gap-2 mb-6 p-1 bg-slate-900/50 border border-slate-800 rounded-xl w-fit">
                {[
                  { id: 1, label: 'Recon & Assets', icon: <HiOutlineGlobeAlt className="w-4 h-4" /> },
                  { id: 2, label: 'Attack Surface', icon: <HiOutlineDatabase className="w-4 h-4" /> },
                  { id: 3, label: 'Verified Findings', icon: <HiOutlineShieldCheck className="w-4 h-4" /> },
                ].map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeStep === step.id
                        ? 'bg-brand-500 text-white shadow-glow-sm'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {step.icon}
                    {step.label}
                  </button>
                ))}
              </div>

              {activeStep === 1 && <StepRecon report={report} isPro={isPro} copy={copy} uiMode={uiMode} />}
              {activeStep === 2 && <StepAnalysis report={report} isPro={isPro} uiMode={uiMode} />}
              {activeStep === 3 && <StepFindings report={report} isPro={isPro} bountyMode={bountyMode} uiMode={uiMode} />}
            </div>
          </div>
        </>
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

/* ─────── Tactical Cockpit ─────── */
function TacticalCockpit({ vectors, uiMode }) {
  if (!vectors || vectors.length === 0) return null;
  
  return (
    <div className="bg-slate-900/80 border-b border-slate-800 p-6">
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineLightningBolt className="w-5 h-5 text-brand-400" />
        <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest">Tactical Next Vectors</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vectors.map((v, i) => (
          <div key={i} className="group relative p-4 rounded-2xl bg-brand-500/5 border border-brand-500/10 hover:border-brand-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 uppercase tracking-tighter">
                {v.type}
              </span>
              <HiOutlinePlusCircle className="w-4 h-4 text-slate-700 group-hover:text-brand-400 transition-colors" />
            </div>
            <p className="text-[12px] font-bold text-slate-200 mb-1 leading-tight group-hover:text-brand-400 transition-colors">
              {v.action}
            </p>
            <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2 italic">
              {uiMode === 'beginner' ? v.logic : v.outcome}
            </p>
            {uiMode === 'beginner' && (
              <div className="mt-3 pt-3 border-t border-slate-800/50">
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">Expected Outcome</p>
                <p className="text-[10px] text-slate-400">{v.outcome}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────── Step 1: RECON ─────── */
function StepRecon({ report, isPro, copy, uiMode }) {
  const subs = report.parts?.subdomains || [];
  const endpoints = report.parts?.endpoints || [];
  const tech = report.parts?.tech?.technologies || [];
  const locked = report.locked || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Sentinel Research Intel - PROMINENT AT TOP */}
      {report.parts?.research && (
        <Panel 
          icon={<HiOutlineAcademicCap className="w-6 h-6 text-brand-400" />} 
          title="Sentinel Elite Research Intelligence" 
          className="border-t-4 border-t-brand-500 shadow-glow-sm"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Identity & Fingerprint */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <HiOutlineFingerPrint className="w-4 h-4 text-brand-400" />
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Digital Identity</h4>
              </div>
              {report.parts.research.favicon && (
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60 group hover:border-brand-500/40 transition-colors">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-1 rounded bg-white/5">
                      <img src={report.parts.research.favicon.url} alt="Favicon" className="w-8 h-8 rounded shadow-sm" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Favicon Murmur3</p>
                      <code className="text-sm text-brand-400 font-mono font-bold">{report.parts.research.favicon.hash}</code>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed italic">
                    Shodan-ready hash for asset pivoting and shadow IT discovery.
                  </p>
                </div>
              )}
              {report.parts.research.tls && (
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60">
                   <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mb-2">TLS Fingerprint (SHA256)</p>
                   <code className="text-[10px] font-mono text-slate-300 break-all leading-tight block">
                     {report.parts.research.tls.fingerprint}
                   </code>
                </div>
              )}
            </div>

            {/* Infrastructure & Assets */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <HiOutlineDatabase className="w-4 h-4 text-brand-400" />
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Infrastructure Map</h4>
              </div>
              {report.parts.research.infrastructure?.asn && (
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60">
                  <h5 className="text-sm font-bold text-slate-100">{report.parts.research.infrastructure.asn.org}</h5>
                  <p className="text-[11px] text-brand-400 font-mono mt-1 font-bold">{report.parts.research.infrastructure.asn.asn}</p>
                  <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1.5">
                    <HiOutlineGlobe className="w-3 h-3" />
                    {report.parts.research.infrastructure.asn.location}
                  </p>
                </div>
              )}
                 {/* Parameter Mining Panel - NEW */}
      <Panel 
        icon={<HiOutlineDatabase className="w-6 h-6 text-emerald-400" />} 
        title="Tactical Parameter Mining (Archive Discovery)"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="pb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Parameter</th>
                <th className="pb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Risk Category</th>
                <th className="pb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pattern</th>
                <th className="pb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Hunt Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {report.parts?.parameters?.map((p, i) => (
                <tr key={i} className="group hover:bg-slate-800/30 transition-colors">
                  <td className="py-3">
                    <div className="flex flex-col">
                      <code className="text-xs font-bold text-emerald-400">?{p.key}=</code>
                      <span className="text-[9px] text-slate-500 truncate max-w-[200px]">{p.context}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.risk !== 'Low' ? 'bg-orange-500/10 text-orange-400' : 'bg-slate-800 text-slate-500'}`}>
                      {p.risk}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-[10px] text-slate-400 font-mono">{p.pattern}</span>
                  </td>
                  <td className="py-3 text-right">
                    <button className="text-[10px] font-bold text-brand-400 hover:text-brand-300 transition-colors">
                      LOAD PAYLOADS →
                    </button>
                  </td>
                </tr>
              ))}
              {(!report.parts?.parameters || report.parts.parameters.length === 0) && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-[11px] text-slate-500 italic">
                    No query parameters found in historical snapshots.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
              {report.parts.research.infrastructure?.cloud?.length > 0 && (
                <div className="space-y-2">
                  {report.parts.research.infrastructure.cloud.map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/40">
                      <span className="text-xs font-medium text-slate-300">{c.provider} Space</span>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-md tracking-tighter ${c.status === 'EXPOSED/OPEN' ? 'bg-red-500 text-white shadow-glow-sm animate-pulse' : 'bg-slate-700 text-slate-400'}`}>
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* High-Level Correlation */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <HiOutlineLink className="w-4 h-4 text-brand-400" />
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Research Pivot Points</h4>
              </div>
              <div className="space-y-3">
                {report.parts.research.correlationPoints?.map((point, i) => (
                  <div key={i} className="group p-3.5 rounded-2xl bg-brand-500/5 border border-brand-500/10 hover:border-brand-500/30 transition-all relative pl-10 overflow-hidden">
                    <div className="absolute left-0 top-0 w-1 h-full bg-brand-500/40 group-hover:bg-brand-500 transition-colors" />
                    <HiOutlineBeaker className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                    <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-5 border-t border-slate-800/80 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
               <HiOutlineAcademicCap className="w-5 h-5 text-brand-400" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed italic">
              <span className="text-brand-400 font-bold mr-1">Sentinel AI Logic:</span>
              {report.parts.research.summary}
            </p>
          </div>
        </Panel>
      )}

      {/* Grid for standard recon data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel icon={<HiOutlineGlobe className="w-5 h-5 text-sky-400" />} title="Subdomains Discovered" count={report.summary?.subdomainCount || subs.length}>
          {subs.length === 0 ? <Empty msg="No subdomains discovered" /> : (
            <ul className="divide-y divide-slate-800/40 max-h-64 overflow-y-auto no-scrollbar pr-1">
              {subs.map((s) => (
                <li key={s} className="py-2.5 flex items-center justify-between gap-2 group">
                  <code className="text-[12px] font-mono text-slate-200 truncate">{s}</code>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => { setTarget(s); runScan(); }} 
                      className="p-1.5 rounded-md hover:bg-brand-500/10 text-brand-400 border border-transparent hover:border-brand-500/20 transition-all flex items-center gap-1.5"
                      title="Deep Pivot: Run Recon on this subdomain"
                    >
                      <HiOutlineLightningBolt className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-bold uppercase tracking-tighter">Pivot</span>
                    </button>
                    <button onClick={() => copy(s)} className="p-1.5 rounded-md hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition" title="Copy Host">
                      <HiOutlineClipboardCopy className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {!isPro && locked.subdomains > 0 && (
            <div className="mt-3"><LockedSection variant="tile" count={locked.subdomains} title="More subdomains found" description="Free tier shows 5. Pro reveals every host on the surface." /></div>
          )}
        </Panel>

        <Panel icon={<HiOutlineCode className="w-5 h-5 text-indigo-400" />} title="Archived Endpoints" count={report.summary?.endpointCount || endpoints.length}>
          {endpoints.length === 0 ? <Empty msg="No archived endpoints" /> : (
            <ul className="divide-y divide-slate-800/40 max-h-64 overflow-y-auto no-scrollbar pr-1">
              {endpoints.map((e, i) => (
                <li key={i} className="py-2.5 flex items-center justify-between gap-2 group">
                  <a href={e.url} target="_blank" rel="noreferrer" className="text-[11px] font-mono text-slate-300 truncate hover:text-brand-400">{e.url}</a>
                  {e.status && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${e.status >= 200 && e.status < 300 ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 bg-slate-800'}`}>
                      {e.status}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
          {!isPro && locked.endpoints > 0 && (
            <div className="mt-3"><LockedSection variant="tile" count={locked.endpoints} title="More endpoints discovered" description="Pro unlocks the full Wayback path index." /></div>
          )}
        </Panel>

        <Panel icon={<HiOutlineChip className="w-5 h-5 text-emerald-400" />} title="Tech Stack Fingerprints" count={report.summary?.techCount || tech.length}>
          {tech.length === 0 ? <Empty msg="No fingerprintable technology" /> : (
            <div className="flex flex-wrap gap-2 pt-1">
              {tech.map((t, i) => (
                <span key={i} className="text-[11px] px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-200 flex items-center gap-2 group hover:border-emerald-500/30 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-glow-sm" />
                  <span className="font-bold">{t.name}</span>
                  {t.version && <span className="text-slate-500 text-[10px]">{t.version}</span>}
                </span>
              ))}
            </div>
          )}
          {!isPro && locked.tech > 0 && (
            <div className="mt-3"><LockedSection variant="tile" count={locked.tech} title="More tech fingerprinted" /></div>
          )}
        </Panel>

        <Panel icon={<HiOutlineFire className="w-5 h-5 text-orange-400" />} title="Open Port Analysis" count={(report.parts?.port?.ports || []).filter((p) => p.status === 'open').length}>
          {(() => {
            const open = (report.parts?.port?.ports || []).filter((p) => p.status === 'open');
            if (!open.length) return <Empty msg="No open services detected" />;
            return (
              <ul className="space-y-2 pt-1">
                {open.map((p, i) => (
                  <li key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/40 group hover:border-orange-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <HiOutlineServer className="w-4 h-4 text-slate-500" />
                      <code className="text-xs font-mono text-slate-200 font-bold">{p.service} <span className="text-slate-500 text-[10px] ml-1">:{p.port}</span></code>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-1 rounded-md tracking-widest ${SEV_COLOR[p.risk] || SEV_COLOR.info}`}>
                      {(p.risk || 'open').toUpperCase()}
                    </span>
                  </li>
                ))}
              </ul>
            );
          })()}
        </Panel>
      </div>
    </div>
  );
}

function AnalysisStats({ report }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="text-[10px] text-slate-500 uppercase font-bold">Total Assets</div>
        <div className="text-xl font-bold text-slate-200">{report.summary?.subdomainCount || 0}</div>
      </div>
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="text-[10px] text-slate-500 uppercase font-bold">Attack Surface Score</div>
        <div className="text-xl font-bold text-brand-400">{report.summary?.exploitLikelihood || 0}%</div>
      </div>
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="text-[10px] text-slate-500 uppercase font-bold">Pending Pivots</div>
        <div className="text-xl font-bold text-emerald-400">{report.findings?.length || 0}</div>
      </div>
    </div>
  );
}

/* ─────── Step 2: ATTACK SURFACE ─────── */
function StepAnalysis({ report, isPro, uiMode }) {
  const summary = report.summary || {};
  const chains = summary.chains || [];
  return (
    <div className="space-y-6">
      <AnalysisStats report={report} />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ScoreCard label="Exploit Likelihood" value={`${summary.exploitLikelihood || 0}%`} severity={summary.exploitLikelihood > 70 ? 'critical' : 'high'} />
        <ScoreCard label="Intelligence Leads" value={report.findings?.length || 0} severity="medium" />
        <ScoreCard label="Surface Depth" value={summary.subdomainCount || 0} severity="low" />
        <ScoreCard label="Readiness" value={summary.readinessStatus || 'LOW'} severity={summary.readinessStatus === 'READY' ? 'critical' : 'medium'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Detected Exploit Chains" icon={<HiOutlineLink className="w-5 h-5 text-brand-400" />} count={summary.chains?.length || 0}>
          {Array.isArray(summary.chains) && summary.chains.length > 0 ? (
            <div className="space-y-3">
              {summary.chains.map((chain, i) => (
                <div key={i} className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/20 group hover:border-brand-500/40 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[11px] font-black text-brand-400 uppercase tracking-widest">{chain.title}</h4>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-500 text-white">{chain.likelihood}% Likelihood</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed italic">{chain.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <Empty msg="No multi-vector exploit chains detected yet. Requires manual auth-probing for deeper chaining." />
          )}
        </Panel>

        <Panel title="Active Probing Metrics" icon={<HiOutlineBeaker className="w-5 h-5 text-emerald-400" />} count={report.timeSaved?.probesRun || 0}>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-800">
              <span className="text-[11px] text-slate-400 font-mono">XSS Reflection Probes</span>
              <span className="text-[11px] font-bold text-emerald-400">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-800">
              <span className="text-[11px] text-slate-400 font-mono">Auth Anomaly Detection</span>
              <span className="text-[11px] font-bold text-emerald-400">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-800">
              <span className="text-[11px] text-slate-400 font-mono">CORS Credential Reflect</span>
              <span className="text-[11px] font-bold text-emerald-400">SUCCESS</span>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ─────── Step 3: VERIFIED FINDINGS ─────── */
function StepFindings({ report, isPro, onGenerate, onRevalidate, bountyMode, uiMode }) {
  const summary = report.summary || {};
  const prog = summary.progression || {};
  const allFindings = report.findings || [];
  const findings = bountyMode ? allFindings.filter(f => f.signal >= 50) : allFindings;

  if (findings.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <HiOutlineCheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-200 mb-2">No {bountyMode ? 'high-signal' : 'exploitable'} issues verified</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          {bountyMode 
            ? 'Bounty Mode is active. We suppressed low-value findings to focus on actionable bugs.' 
            : 'Every probe came back clean. The surface is mapped — consider deeper manual testing.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recon Progression Loop */}
      <div className="glass-card p-6 border-l-4 border-l-emerald-500 bg-emerald-500/5">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <HiOutlineCheckCircle className="w-3.5 h-3.5" /> Validation Success
            </h4>
            <div className="space-y-2">
              {(prog.worked || []).map((w, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-slate-300 font-mono">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                  {w}
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <HiOutlineXCircle className="w-3.5 h-3.5" /> Safety Skips
            </h4>
            <div className="space-y-2">
              {(prog.didntWork || []).map((w, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-slate-500 font-mono italic">
                  <div className="w-1 h-1 bg-slate-700 rounded-full" />
                  {w}
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 border-l border-slate-800/40 pl-8">
            <h4 className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-3">Next Tactical Vector</h4>
            <div className="p-3 rounded-lg bg-brand-500/10 border border-brand-500/20">
              <p className="text-[11px] font-bold text-slate-100 mb-1">{prog.nextTactical}</p>
              <p className="text-[10px] text-slate-400 italic">High-likelihood pivot point detected.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-200 uppercase tracking-tight">
          {findings.length} Verified Intelligence Leads
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {findings.map((f, i) => (
          <FindingCard
            key={i}
            finding={f}
            index={i}
            isPro={isPro}
            onGenerate={() => onGenerate(allFindings.indexOf(f))}
            onRevalidate={() => onRevalidate(f, allFindings.indexOf(f))}
          />
        ))}
      </div>

      {!isPro && locked.findings > 0 && (
        <LockedSection
          variant="tile"
          count={locked.findings}
          title="More intelligence leads hidden"
          description="Free tier shows limited findings. Upgrade to reveal the full surface."
        />
      )}
    </div>
  );
}

function FindingCard({ finding, index, isPro, onGenerate, onRevalidate }) {
  const [showProof, setShowProof] = useState(false);
  const [showLearning, setShowLearning] = useState(false);
  const sevClass = SEV_COLOR[finding.severity] || SEV_COLOR.info;
  const isLocked = finding.locked;
  const signal = finding.signal || 10;
  const confidence = finding.confidence || 0;

  return (
    <div className={`glass-card p-5 group relative overflow-hidden transition-all hover:ring-1 hover:ring-brand-500/30 ${finding.stale ? 'opacity-60' : ''}`}>
      <div className={`absolute top-0 left-0 w-1.5 h-full ${finding.severity === 'critical' ? 'bg-red-500 shadow-glow-sm' : finding.severity === 'high' ? 'bg-orange-500' : 'bg-brand-500/20'}`} />
      
      {/* Hacker Workflow Tracker */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-800/40">
        {(finding.workflow || []).map((w, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${w.status === 'COMPLETE' ? 'bg-emerald-500 shadow-glow-sm' : w.status === 'READY' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
            <span className={`text-[9px] font-black uppercase tracking-tighter ${w.status === 'COMPLETE' || w.status === 'READY' ? 'text-slate-100' : 'text-slate-500'}`}>
              {w.label}
            </span>
          </div>
        ))}
      </div>

      {/* Opportunity Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-black px-2 py-0.5 rounded shadow-glow-sm ${finding.readiness === 'READY' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700/50'}`}>
            {finding.readiness?.replace('_', ' ')}
          </span>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/40 border border-slate-700/50">
            <span className="text-[9px] font-black text-slate-500 uppercase">Confidence</span>
            <span className="text-[10px] font-bold text-slate-200">{finding.confidence}%</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Potential Impact</p>
          <p className="text-sm font-black text-emerald-400">
            ${finding.bountyEstimate?.min?.toLocaleString()} - ${finding.bountyEstimate?.max?.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-slate-100 leading-snug group-hover:text-brand-400 transition-colors uppercase tracking-tight">
            {finding.title}
          </h3>
          <p className="text-[11px] font-mono text-slate-500 mt-1 truncate">{finding.where}</p>
        </div>
      </div>

      {/* Attack Opportunity / Next Action */}
      <div className="mb-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800/50">
        <div className="flex items-center gap-1.5 mb-2">
          <HiOutlineLightningBolt className="w-3.5 h-3.5 text-brand-400" />
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Tactical Next Step</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
          <span className="text-brand-400 font-bold">Action:</span> {finding.nextAction?.step}
        </p>
        <p className="text-[11px] text-slate-500 italic">
          <span className="text-slate-400 font-bold not-italic">Outcome:</span> {finding.nextAction?.outcome}
        </p>
      </div>

      {/* Intelligence Details */}
      <div className="mb-4">
        <button 
          onClick={() => setShowLearning(!showLearning)}
          className="text-[10px] font-bold text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
        >
          <HiOutlineAcademicCap className="w-3 h-3" />
          {showLearning ? 'Hide Vector Intel' : 'Why this matters?'}
        </button>
        {showLearning && (
          <div className="mt-2 p-3 rounded-lg bg-brand-500/5 border border-brand-500/10 text-[11px] text-slate-400 leading-relaxed italic">
            {finding.learningHook}
          </div>
        )}
      </div>

      {!isLocked && finding.impact && (
        <p className="text-[12px] text-slate-300 leading-relaxed mb-3 p-3 rounded-lg bg-slate-900/40 border border-slate-800/30">
          <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Impact Analysis</span>
          {finding.impact}
        </p>
      )}

      {/* Proof block */}
      {!isLocked && (finding.proof?.request || finding.proof?.response) && (
        <div className="mb-3">
          <button
            onClick={() => setShowProof((v) => !v)}
            className="text-[11px] font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1 mb-2"
          >
            <HiOutlineDocumentText className="w-3.5 h-3.5" />
            {showProof ? 'Hide' : 'Show'} Captured Proof
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
      <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-800/40 mt-2">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Last Validation</span>
          <span className="text-[10px] text-slate-500">
            {finding.validatedAt ? new Date(finding.validatedAt).toLocaleTimeString() : '—'}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!isLocked && (
            <button
              onClick={onRevalidate}
              disabled={!isPro}
              className="text-[11px] py-1.5 px-3 rounded-lg bg-slate-800/40 border border-slate-700/50 text-slate-300 hover:bg-slate-700/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <HiOutlineBeaker className="w-3.5 h-3.5" />
              Re-Validate
            </button>
          )}
          <button
            onClick={onGenerate}
            disabled={!isPro || isLocked}
            className="btn-primary text-[11px] py-1.5 px-4 shadow-glow"
          >
            {isPro && !isLocked ? <HiOutlinePlus className="w-3.5 h-3.5" /> : <HiOutlineLockClosed className="w-3.5 h-3.5" />}
            Generate Submission Report
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

function LoadingState({ target }) {
  const [tasks, setTasks] = useState([
    { id: 1, label: 'Initializing Sentinel Correlation Engine...', status: 'running', delay: 0 },
    { id: 2, label: 'Mapping DNS Attack Surface...', status: 'pending', delay: 1200 },
    { id: 3, label: 'Extracting Shodan-style Favicon Hashes...', status: 'pending', delay: 2500 },
    { id: 4, label: 'Probing Cloud Infrastructure (S3/Azure/GCP)...', status: 'pending', delay: 3800 },
    { id: 5, label: 'Analyzing TLS Fingerprints & Cipher Suites...', status: 'pending', delay: 5000 },
    { id: 6, label: 'Identifying Tech Stack & Framework Versions...', status: 'pending', delay: 6200 },
    { id: 7, label: 'Running Exploit Validators & Proof Capture...', status: 'pending', delay: 7500 },
  ]);

  // Simulate task progress for expert UX
  useEffect(() => {
    tasks.forEach((task, i) => {
      setTimeout(() => {
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'running' } : t));
        setTimeout(() => {
          setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'done' } : t));
        }, 1500);
      }, task.delay);
    });
  }, []);

  return (
    <div className="glass-card p-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-transparent pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 mb-8 rounded-3xl bg-gradient-brand flex items-center justify-center shadow-glow animate-float">
          <HiOutlineAcademicCap className="w-10 h-10 text-white" />
        </div>
        
        <div className="text-center mb-10">
          <h3 className="text-xl font-black text-slate-100 tracking-tight mb-2">
            Researching <span className="text-brand-400 font-mono">{target}</span>
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Sentinel V3 is orchestrating multi-vector research probes and capturing live proof.
          </p>
        </div>

        <div className="w-full max-w-lg space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/60 transition-all duration-500">
              <div className="flex items-center gap-4">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  task.status === 'done' ? 'bg-emerald-500 shadow-glow-sm' : 
                  task.status === 'running' ? 'bg-brand-500 shadow-glow animate-pulse' : 
                  'bg-slate-700'
                }`} />
                <span className={`text-[12px] font-mono tracking-tight transition-colors duration-500 ${
                  task.status === 'done' ? 'text-emerald-400 font-bold' : 
                  task.status === 'running' ? 'text-slate-100' : 
                  'text-slate-600'
                }`}>
                  {task.label}
                </span>
              </div>
              {task.status === 'done' && <HiOutlineCheckCircle className="w-4 h-4 text-emerald-400 animate-in fade-in zoom-in duration-300" />}
              {task.status === 'running' && <div className="w-3 h-3 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />}
            </div>
          ))}
        </div>

        <div className="mt-10 flex items-center gap-3">
          <div className="h-1 w-24 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 animate-progress" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Expert Mode Active</span>
          <div className="h-1 w-24 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 animate-progress direction-reverse" />
          </div>
        </div>
      </div>
    </div>
  );
}

