import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import SearchBar from '../components/SearchBar';
import ResultCard from '../components/ResultCard';
import RiskBadge from '../components/RiskBadge';
import { CardSkeleton } from '../components/LoadingSkeleton';
import {
  HiOutlineBookmark,
  HiOutlineDocumentDownload,
  HiOutlineShieldCheck,
  HiOutlineLightningBolt,
  HiOutlineEye,
  HiOutlineTerminal
} from 'react-icons/hi';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function OsintTool() {
  const { userProfile, refreshProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const toolType = searchParams.get('type') || 'osint';
  
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(1);

  const plan = userProfile?.plan || 'free';
  const isPaid = plan === 'pro' || plan === 'elite';

  const placeholders = {
    osint: 'Analyze domains, IPs, or email targets...',
    port: 'Scan specific target ranges.',
  };

  const handleSearch = async (query) => {
    setLoading(true);
    setError('');
    setReport(null);
    setActiveStep(1);
    try {
      const { data } = await client.post('/osint/investigate', { query, inputType: toolType });
      setReport(data);
      refreshProfile();
      toast.success('Workflow executed');
    } catch (err) {
      setError(err.response?.data?.error || 'Execution failed');
      toast.error('Scan stalled');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* SaaS workflow Header */}
      <div className="text-center max-w-xl mx-auto mb-6">
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">Stop Guessing. <span className="text-gradient">Start Exploiting.</span></h1>
        <p className="text-xs text-slate-400 mt-1">{placeholders[toolType] || 'Automated vulnerability workflows.'}</p>
      </div>

      <SearchBar onSearch={handleSearch} loading={loading} placeholder="Enter target (e.g., evilcorp.com)..." />

      {loading && <div className="p-12 text-center text-slate-400">Executing Deep Assessment Pipeline...</div>}

      {report && (
        <div className="space-y-6 animate-slide-up">
          {/* Steps Navigation */}
          <div className="flex items-center justify-around border-b border-slate-800/60 pb-3">
            <StepButton num={1} label="Recon" active={activeStep === 1} onClick={() => setActiveStep(1)} />
            <StepButton num={2} label="Analysis" active={activeStep === 2} onClick={() => setActiveStep(2)} />
            <StepButton num={3} label="Exploit" active={activeStep === 3} onClick={() => setActiveStep(3)} />
          </div>

          {/* Step 1: Recon */}
          {activeStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReconField label="Target Query" value={report.query} />
              <ReconField label="Threat Posture" value={`Index: ${report.riskScore}/100`} />
              {report.results.domain && (
                <div className="glass-card p-5 md:col-span-2">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">Subdomains Detected</h4>
                  <p className="text-sm font-mono text-slate-200">{report.results.domain.subdomains?.join(', ') || 'No mapped assets.'}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Analysis */}
          {activeStep === 2 && (
            <div className="space-y-4">
              {report.riskIndicators?.map((ind, i) => (
                <div key={i} className="glass-card p-4 border-l-4 border-l-amber-500 text-sm text-slate-200">
                  {ind}
                </div>
              ))}
            </div>
          )}

          {/* Step 3: Exploit / AI Suggestions */}
          {activeStep === 3 && (
            <div className="space-y-4 relative">
              {!isPaid && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                  <HiOutlineLockClosed className="w-10 h-10 text-brand-400 mb-2 shadow-glow" />
                  <p className="font-bold text-slate-100 text-sm">Actionable AI Vectors Locked</p>
                  <p className="text-xs text-slate-400 mb-4">Pro subscribers access direct penetration templates.</p>
                  <Link to="/billing" className="btn-primary text-xs py-2 px-6">Upgrade to Pro — ₹499</Link>
                </div>
              )}

              <div className="glass-card p-6 border-l-4 border-l-brand-500">
                <h4 className="text-xs uppercase tracking-wider font-bold text-brand-400 flex items-center gap-2">
                  <HiOutlineTerminal className="w-4 h-4" /> Strategic Assessment
                </h4>
                <p className="text-sm text-slate-100 mt-2 font-semibold">
                  {report.aiSuggestions?.nextAction || 'Map backend routing APIs directly.'}
                </p>
              </div>

              {report.aiSuggestions?.vectors?.map((v, i) => (
                <div key={i} className="glass-card p-5">
                  <span className="badge badge-yellow text-[10px]">{v.severity}</span>
                  <h4 className="text-sm font-bold text-slate-100 mt-1">{v.type}</h4>
                  <p className="text-xs text-slate-400 mt-1">{v.explanation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StepButton({ num, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 pb-2 border-b-2 font-bold text-sm transition-all ${
        active ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-300'
      }`}
    >
      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono ${
        active ? 'bg-brand-500 text-slate-900' : 'bg-slate-800 text-slate-400'
      }`}>{num}</span>
      {label}
    </button>
  );
}

function ReconField({ label, value }) {
  return (
    <div className="glass-card p-4">
      <span className="text-[10px] uppercase font-bold text-slate-500">{label}</span>
      <p className="text-sm font-mono text-slate-200 mt-1 font-bold">{value}</p>
    </div>
  );
}
