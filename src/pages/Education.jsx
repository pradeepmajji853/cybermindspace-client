// CyberMindSpace Education Module v2.1
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ACADEMY_BATCH1 } from '../data/academyData1';
import { ACADEMY_BATCH2 } from '../data/academyData2';
import { ACADEMY_BATCH3 } from '../data/academyData3';
import { ACADEMY_BATCH4 } from '../data/academyData4';
import { ACADEMY_BATCH5 } from '../data/academyData5';
import { ACADEMY_BATCH6 } from '../data/academyData6';
import { ACADEMY_BUG_BOUNTY } from '../data/academyBugBounty';
import { 
  HiOutlineSearch, HiOutlineArrowRight, HiOutlineExternalLink, HiOutlineStar, 
  HiOutlineAcademicCap, HiOutlineBookOpen, HiOutlineChevronRight, 
  HiOutlineChevronDown, HiOutlineLightningBolt, HiOutlineLockClosed, 
  HiOutlineCheck, HiOutlineShieldCheck, HiOutlineCode, HiOutlineGlobeAlt, 
  HiOutlineMenuAlt2, HiOutlineX, HiOutlineDownload, HiOutlineClock,
  HiOutlineFingerPrint, HiOutlineDatabase, HiOutlineLink, HiOutlineBeaker
} from 'react-icons/hi';

const ALL_TOOLS = [
  ...ACADEMY_BUG_BOUNTY, 
  ...ACADEMY_BATCH1, 
  ...ACADEMY_BATCH2, 
  ...ACADEMY_BATCH3, 
  ...ACADEMY_BATCH4, 
  ...ACADEMY_BATCH5, 
  ...ACADEMY_BATCH6
];

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || 'majjipradeepkumar@gmail.com,almadadali786@gmail.com,dhyeybhuva2003@gmail.com,pateltushar1734@gmail.com,acromatic.tech@gmail.com,pradeepmajji853@gmail.com,majjipradeep4677@gmail.com').split(',');

export default function Education() {
  const { userProfile } = useAuth();
  const isAdmin = userProfile && ADMIN_EMAILS.includes(userProfile.email);
  const plan = userProfile?.plan || 'free';
  const hasPro = isAdmin || plan === 'pro' || plan === 'elite';

  if (!hasPro) {
    return <AcademyShowcase />;
  }

  return <AcademyFull />;
}

/* ───────────────────────────────────────────────
   FREE USER: Rich animated feature showcase
   ─────────────────────────────────────────────── */
function AcademyShowcase() {
  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in py-4">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-500 text-[10px] font-bold uppercase tracking-widest mx-auto">
          <HiOutlineAcademicCap className="w-4 h-4" /> Pro Academy
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
          Master Cybersecurity with<br />
          <span className="text-gradient">18 Expert Guides</span>
        </h1>
        <p className="text-sm max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Deep-dive methodology guides covering OSINT, web security, network reconnaissance, and vulnerability analysis. Written for beginners, detailed enough for experts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_TOOLS.map((tool, i) => (
          <div
            key={tool.id}
            className="glass-card p-5 group hover:border-brand-500/20 transition-all duration-300 relative overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center text-white text-[10px] font-black shadow-sm`}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[13px] font-bold truncate" style={{ color: 'var(--color-text)' }}>{tool.name}</h3>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${tool.tier === 'Free' ? 'bg-sky-500/10 text-sky-400' : 'bg-brand-500/10 text-brand-500'}`}>{tool.tier}</span>
              </div>
            </div>
            <p className="text-[11px] leading-relaxed line-clamp-2 mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              {tool.overview?.substring(0, 120)}...
            </p>
          </div>
        ))}
      </div>

      <div className="text-center space-y-4 pb-6">
        <Link to="/billing" className="btn-primary py-3.5 px-10 text-sm shadow-glow inline-flex">
          <HiOutlineLightningBolt className="w-5 h-5" />
          Get Pro Access
        </Link>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────
   INTERACTIVE ACADEMY: Live Context component
   ─────────────────────────────────────────────── */
function LiveContext({ toolId, report }) {
  if (!report) return null;

  const toolBase = toolId.toLowerCase().split('-')[0];
  const matchingVector = report.tacticalVectors?.find(v => 
    v.type.toLowerCase().includes(toolBase) || 
    v.action.toLowerCase().includes(toolBase)
  ) || report.findings?.find(f => f.kind.toLowerCase().includes(toolBase));

  if (!matchingVector) return null;

  return (
    <div className="p-5 rounded-2xl bg-brand-500/5 border border-brand-500/20 mb-6 relative overflow-hidden group">
       <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
         <HiOutlineLightningBolt className="w-8 h-8 text-brand-500" />
       </div>
       <div className="flex items-center gap-3 mb-3">
         <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
            <HiOutlineLightningBolt className="w-4 h-4 text-brand-400" />
         </div>
         <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Active Hunter Intelligence</p>
       </div>
       <p className="text-sm font-bold text-slate-100 mb-1">
         Potential {matchingVector.type || matchingVector.kind} found on <span className="text-brand-400">{report.target}</span>!
       </p>
       <p className="text-[11px] text-slate-500 leading-relaxed max-w-lg">
         While learning this module, we detected a matching signal in your latest research. You can apply this theory immediately.
       </p>
       <div className="mt-4 flex items-center gap-4">
         <Link to="/recon" className="btn-primary py-2 px-4 text-[10px] shadow-glow-sm">
           OPEN TACTICAL COCKPIT
         </Link>
         <span className="text-[10px] font-mono text-slate-600">Vector: {matchingVector.action || matchingVector.title}</span>
       </div>
    </div>
  );
}

/* ───────────────────────────────────────────────
   PRO USER: Full Interactive Academy
   ─────────────────────────────────────────────── */
function AcademyFull() {
  const [activeTool, setActiveTool] = useState(ALL_TOOLS[0]);
  const [activeSection, setActiveSection] = useState(-1);
  const [expandedTool, setExpandedTool] = useState(ALL_TOOLS[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [report, setReport] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const raw = localStorage.getItem('latest_research_report');
    if (raw) { 
      try { setReport(JSON.parse(raw)); } catch (_) {} 
    }
  }, []);

  const filtered = ALL_TOOLS.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
  const scrollTop = () => contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

  const selectTool = (tool) => {
    setActiveTool(tool);
    setActiveSection(-1);
    setExpandedTool(tool.id);
    setTimeout(scrollTop, 50);
  };

  const selectSection = (tool, sectionIdx) => {
    setActiveTool(tool);
    setActiveSection(sectionIdx);
    setExpandedTool(tool.id);
    setTimeout(scrollTop, 50);
  };

  const totalSections = activeTool.sections?.length || 0;

  return (
    <div className="flex h-[calc(100vh-120px)] animate-fade-in relative">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 flex-shrink-0 flex flex-col gap-3 overflow-hidden
        ${sidebarOpen ? 'mr-5 opacity-100' : 'mr-0 opacity-0'}
        fixed lg:relative inset-y-0 left-0 z-40 lg:z-auto bg-[var(--color-bg)] lg:bg-transparent`}>
        
        <div className="glass-card p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow-sm">
                <HiOutlineAcademicCap className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm font-bold text-slate-100">Pro Academy</h2>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500"><HiOutlineX /></button>
          </div>
          <input 
            type="text" value={search} onChange={e=>setSearch(e.target.value)} 
            placeholder="Search methodology..." 
            className="input-field py-2 text-xs w-full" 
          />
        </div>

        <div className="glass-card p-2 flex-1 overflow-y-auto">
          {filtered.map((tool, i) => (
            <div key={tool.id} className="mb-1">
              <button 
                onClick={() => selectTool(tool)}
                className={`w-full text-left p-2.5 rounded-xl transition-all text-xs font-bold ${
                  activeTool.id === tool.id ? 'bg-brand-500 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                {tool.name}
              </button>
              {activeTool.id === tool.id && (
                <div className="ml-4 mt-2 space-y-1">
                  <button onClick={() => selectSection(tool, -1)} className={`text-[10px] block ${activeSection === -1 ? 'text-brand-400' : 'text-slate-500'}`}>Overview</button>
                  {tool.sections?.map((s, idx) => (
                    <button key={idx} onClick={() => selectSection(tool, idx)} className={`text-[10px] block truncate w-full text-left ${activeSection === idx ? 'text-brand-400' : 'text-slate-500'}`}>
                      {s.t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto pr-2">
        <LiveContext toolId={activeTool.id} report={report} />
        
        <div className="glass-card p-8">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activeTool.color} flex items-center justify-center text-white font-black mb-6 shadow-glow-sm`}>
            {ALL_TOOLS.indexOf(activeTool) + 1}
          </div>
          <h1 className="text-3xl font-black text-slate-100 mb-4">{activeTool.name}</h1>
          <p className="text-sm text-slate-400 leading-relaxed mb-8">{activeTool.overview}</p>

          <div className="space-y-8">
            {(activeSection === -1 ? activeTool.sections || [] : [activeTool.sections[activeSection]]).map((s, i) => (
              <div key={i} className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800/60">
                <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                  {s.t}
                </h3>
                <div className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {s.c}
                </div>
              </div>
            ))}
          </div>

          {activeTool.tip && (
            <div className="mt-8 p-6 rounded-3xl bg-brand-500/5 border border-brand-500/20 border-l-4 border-l-brand-500">
               <div className="flex items-center gap-2 mb-2">
                 <HiOutlineStar className="w-5 h-5 text-brand-400" />
                 <p className="text-xs font-black text-brand-400 uppercase tracking-widest">Pro Hunter Tip</p>
               </div>
               <p className="text-sm text-slate-300 italic">{activeTool.tip}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
