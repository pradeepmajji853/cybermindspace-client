import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ACADEMY_BATCH1 } from '../data/academyData1';
import { ACADEMY_BATCH2 } from '../data/academyData2';
import { ACADEMY_BATCH3 } from '../data/academyData3';
import { ACADEMY_BATCH4 } from '../data/academyData4';
import { ACADEMY_BATCH5 } from '../data/academyData5';
import { ACADEMY_BATCH6 } from '../data/academyData6';
import { HiOutlineSearch, HiOutlineArrowRight, HiOutlineExternalLink, HiOutlineStar, HiOutlineAcademicCap, HiOutlineBookOpen, HiOutlineChevronRight, HiOutlineLightningBolt, HiOutlineLockClosed, HiOutlineCheck, HiOutlineShieldCheck, HiOutlineCode, HiOutlineGlobeAlt } from 'react-icons/hi';

const ALL_TOOLS = [...ACADEMY_BATCH1, ...ACADEMY_BATCH2, ...ACADEMY_BATCH3, ...ACADEMY_BATCH4, ...ACADEMY_BATCH5, ...ACADEMY_BATCH6];

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

      {/* Animated tool showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_TOOLS.map((tool, i) => (
          <div
            key={tool.id}
            className="glass-card p-5 group hover:border-brand-500/20 transition-all duration-300 relative overflow-hidden"
            style={{ animationDelay: `${i * 60}ms`, animation: 'slideUp 0.5s ease forwards', opacity: 0 }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.03] rounded-full -translate-y-6 translate-x-6" style={{background:`linear-gradient(135deg, #4F6EF7, #A855F7)`}} />
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center text-white text-[10px] font-black shadow-sm`}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[13px] font-bold truncate" style={{ color: 'var(--color-text)' }}>{tool.name}</h3>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${tool.tier === 'Free' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand-500/10 text-brand-500'}`}>{tool.tier}</span>
              </div>
            </div>
            <p className="text-[11px] leading-relaxed line-clamp-2 mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              {tool.overview?.substring(0, 120)}...
            </p>
            <div className="flex items-center gap-3 text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
              <span className="flex items-center gap-1"><HiOutlineBookOpen className="w-3 h-3" /> {tool.sections?.length || 3} Sections</span>
              <span className="flex items-center gap-1"><HiOutlineStar className="w-3 h-3" /> Pro Tip</span>
            </div>
          </div>
        ))}
      </div>

      {/* What's Inside */}
      <div className="glass-card overflow-hidden">
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>What's Inside Each Guide</h2>
          <p className="text-sm mb-8 max-w-lg mx-auto" style={{ color: 'var(--color-text-secondary)' }}>Every guide is crafted for beginners with deep technical detail</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: HiOutlineShieldCheck, title: 'Tool Overview', desc: 'Understand what the tool does, how it works, and when to use it in real investigations.', color: 'text-brand-500' },
              { icon: HiOutlineCode, title: 'Technical Deep-Dive', desc: 'Methodology breakdowns, output analysis, and real-world examples with explained results.', color: 'text-emerald-500' },
              { icon: HiOutlineStar, title: 'Expert Pro Tips', desc: 'Bug bounty strategies, common pitfalls, and advanced techniques used by professionals.', color: 'text-amber-500' },
            ].map(({ icon: Icon, title, desc, color }, i) => (
              <div key={title} className="p-5 rounded-xl border border-white/[0.06] hover:border-brand-500/10 transition-all" style={{ background: 'var(--color-surface)' }}>
                <Icon className={`w-7 h-7 ${color} mb-3`} />
                <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--color-text)' }}>{title}</h3>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Blurred preview */}
      <div className="glass-card overflow-hidden relative">
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-transparent to-[var(--color-bg)] pointer-events-none" />
        <div className="p-8 opacity-30 blur-[3px] select-none pointer-events-none">
          <h2 className="text-lg font-bold mb-4">{ALL_TOOLS[0].name}</h2>
          <p className="text-sm leading-relaxed mb-6">{ALL_TOOLS[0].overview?.substring(0, 300)}...</p>
          <div className="space-y-3">
            {ALL_TOOLS[0].sections?.slice(0, 2).map((s, i) => (
              <div key={i} className="p-4 rounded-xl" style={{background:'var(--color-surface-hover)'}}>
                <h3 className="text-sm font-bold mb-2">{s.t}</h3>
                <p className="text-xs leading-relaxed">{s.c?.substring(0, 200)}...</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto shadow-glow">
              <HiOutlineLockClosed className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text)' }}>Unlock Full Academy</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>18 expert guides with complete methodology breakdowns</p>
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
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          18 tools • Beginner-friendly • Expert methodology
        </p>
        <Link to="/billing" className="btn-primary py-3.5 px-10 text-sm shadow-glow inline-flex">
          <HiOutlineLightningBolt className="w-5 h-5" />
          Get Pro Access
        </Link>
        <p className="text-[10px] opacity-30">₹199/month • Cancel anytime • Instant access</p>
      </div>

      {/* Keyframe for staggered entrance */}
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
   PRO USER: Full Academy experience
   ─────────────────────────────────────────────── */
function AcademyFull() {
  const [activeTool, setActiveTool] = useState(ALL_TOOLS[0]);
  const [search, setSearch] = useState('');
  const [animKey, setAnimKey] = useState(0);
  const filtered = ALL_TOOLS.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  const selectTool = (tool) => {
    setActiveTool(tool);
    setAnimKey(k => k + 1);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] gap-5 animate-fade-in">
      {/* Sidebar */}
      <div className="w-full lg:w-72 flex flex-col gap-3 flex-shrink-0">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow-sm">
              <HiOutlineAcademicCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Pro Academy</h2>
              <p className="text-[9px] font-semibold text-brand-500 uppercase tracking-widest">{ALL_TOOLS.length} Expert Guides</p>
            </div>
          </div>
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-40" />
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tools..." className="input-field pl-8 py-2 text-xs" />
          </div>
        </div>

        <div className="glass-card p-2 flex-1 overflow-y-auto space-y-0.5" style={{scrollbarWidth:'thin'}}>
          {filtered.map(tool => {
            const isActive = activeTool.id === tool.id;
            return (
              <button key={tool.id} onClick={() => selectTool(tool)}
                className={`w-full text-left p-2.5 rounded-xl transition-all duration-200 flex items-center gap-2.5 ${
                  isActive ? 'bg-gradient-to-r ' + tool.color + ' text-white shadow-lg' : 'hover:bg-surface-100 dark:hover:bg-surface-800'
                }`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-black ${
                  isActive ? 'bg-white/20' : 'bg-surface-100 dark:bg-surface-800'
                }`}>
                  {ALL_TOOLS.indexOf(tool) + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold truncate leading-tight">{tool.name}</p>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider inline-block mt-0.5 ${
                    isActive ? 'bg-white/20 text-white' : tool.tier === 'Free' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand-500/10 text-brand-500'
                  }`}>{tool.tier}</span>
                </div>
                <HiOutlineChevronRight className={`w-3 h-3 flex-shrink-0 transition-transform ${isActive ? 'translate-x-0.5' : 'opacity-30'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div key={animKey} className="flex-1 overflow-y-auto space-y-5 pr-1" style={{scrollbarWidth:'thin'}}>
        {/* Header */}
        <div className="glass-card overflow-hidden">
          <div className={`h-1.5 bg-gradient-to-r ${activeTool.color}`} />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeTool.color} flex items-center justify-center text-white text-xs font-black`}>
                {String(ALL_TOOLS.indexOf(activeTool) + 1).padStart(2,'0')}
              </div>
              <div>
                <h1 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{activeTool.name}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${activeTool.tier === 'Free' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand-500/10 text-brand-500'}`}>{activeTool.tier}</span>
                  <Link to={activeTool.path} className="text-[10px] text-brand-500 font-semibold flex items-center gap-1 hover:underline">
                    Open Tool <HiOutlineExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{activeTool.overview}</p>
          </div>
        </div>

        {/* Sections */}
        {activeTool.sections?.map((section, i) => (
          <div key={i} className="glass-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-full">Section {i+1}</span>
              <h2 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{section.t}</h2>
            </div>
            <p className="text-[13px] leading-[1.9] whitespace-pre-wrap" style={{ color: 'var(--color-text-secondary)' }}>{section.c}</p>
          </div>
        ))}

        {/* Pro Tip */}
        {activeTool.tip && (
          <div className="glass-card p-6" style={{borderLeft:'3px solid #F59E42'}}>
            <div className="flex items-center gap-2 mb-3">
              <HiOutlineStar className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-amber-500">Expert Pro Tip</h2>
            </div>
            <p className="text-[13px] leading-[1.9]" style={{ color: 'var(--color-text-secondary)' }}>{activeTool.tip}</p>
          </div>
        )}

        {/* Next */}
        {ALL_TOOLS.indexOf(activeTool) < ALL_TOOLS.length - 1 && (
          <button onClick={() => selectTool(ALL_TOOLS[ALL_TOOLS.indexOf(activeTool) + 1])}
            className="glass-card w-full p-5 group hover:border-brand-500/20 transition-all flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${ALL_TOOLS[ALL_TOOLS.indexOf(activeTool)+1].color} flex items-center justify-center text-white text-[9px] font-black`}>
                {String(ALL_TOOLS.indexOf(activeTool)+2).padStart(2,'0')}
              </div>
              <div className="text-left">
                <p className="text-[10px] font-semibold text-brand-500 uppercase tracking-wider">Next Guide</p>
                <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{ALL_TOOLS[ALL_TOOLS.indexOf(activeTool)+1].name}</p>
              </div>
            </div>
            <HiOutlineArrowRight className="w-5 h-5 opacity-30 group-hover:opacity-70 group-hover:translate-x-1 transition-all" style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        )}
      </div>
    </div>
  );
}
