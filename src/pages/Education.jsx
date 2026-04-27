import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ACADEMY_BATCH1 } from '../data/academyData1';
import { ACADEMY_BATCH2 } from '../data/academyData2';
import { ACADEMY_BATCH3 } from '../data/academyData3';
import { ACADEMY_BATCH4 } from '../data/academyData4';
import { ACADEMY_BATCH5 } from '../data/academyData5';
import { ACADEMY_BATCH6 } from '../data/academyData6';
import { HiOutlineSearch, HiOutlineArrowRight, HiOutlineExternalLink, HiOutlineStar, HiOutlineAcademicCap, HiOutlineBookOpen, HiOutlineChevronRight, HiOutlineChevronDown, HiOutlineLightningBolt, HiOutlineLockClosed, HiOutlineCheck, HiOutlineShieldCheck, HiOutlineCode, HiOutlineGlobeAlt, HiOutlineMenuAlt2, HiOutlineX } from 'react-icons/hi';

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
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${tool.tier === 'Free' ? 'bg-sky-500/10 text-sky-400' : 'bg-brand-500/10 text-brand-500'}`}>{tool.tier}</span>
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
              { icon: HiOutlineCode, title: 'Technical Deep-Dive', desc: 'Methodology breakdowns, output analysis, and real-world examples with explained results.', color: 'text-sky-400' },
              { icon: HiOutlineStar, title: 'Expert Pro Tips', desc: 'Bug bounty strategies, common pitfalls, and advanced techniques used by professionals.', color: 'text-blue-300' },
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


function AcademyFull() {
  const [activeTool, setActiveTool] = useState(ALL_TOOLS[0]);
  const [activeSection, setActiveSection] = useState(-1); // -1 = overview
  const [expandedTool, setExpandedTool] = useState(ALL_TOOLS[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState('');
  const filtered = ALL_TOOLS.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  const selectTool = (tool) => {
    setActiveTool(tool);
    setActiveSection(-1);
    setExpandedTool(tool.id);
  };

  const selectSection = (tool, sectionIdx) => {
    setActiveTool(tool);
    setActiveSection(sectionIdx);
    setExpandedTool(tool.id);
  };

  const totalSections = activeTool.sections?.length || 0;
  const toolIdx = ALL_TOOLS.indexOf(activeTool);

  return (
    <div className="flex h-[calc(100vh-120px)] animate-fade-in relative">
      {/* Mobile sidebar toggle */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-6 left-6 z-50 lg:hidden w-12 h-12 rounded-xl bg-gradient-brand text-white shadow-glow flex items-center justify-center">
        {sidebarOpen ? <HiOutlineX className="w-5 h-5" /> : <HiOutlineMenuAlt2 className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 flex-shrink-0 flex flex-col gap-3 overflow-hidden
        ${sidebarOpen ? 'mr-5 opacity-100' : 'mr-0 opacity-0'}
        fixed lg:relative inset-y-0 left-0 z-40 lg:z-auto bg-[var(--color-bg)] lg:bg-transparent`}>

        {/* Sidebar header */}
        <div className="glass-card p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow-sm">
                <HiOutlineAcademicCap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Pro Academy</h2>
                <p className="text-[9px] font-semibold text-brand-500 uppercase tracking-widest">{ALL_TOOLS.length} Guides</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors" style={{color:'var(--color-text-secondary)'}}>
              <HiOutlineX className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-40" />
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tools..." className="input-field pl-8 py-2 text-xs" />
          </div>
        </div>

        {/* Tool list with accordion */}
        <div className="glass-card p-2 flex-1 overflow-y-auto" style={{scrollbarWidth:'thin'}}>
          {filtered.map((tool, ti) => {
            const isExpanded = expandedTool === tool.id;
            const isActive = activeTool.id === tool.id;
            return (
              <div key={tool.id} className="mb-1">
                {/* Tool header */}
                <button onClick={() => { selectTool(tool); setExpandedTool(isExpanded && !isActive ? null : tool.id); }}
                  className={`w-full text-left p-2.5 rounded-xl transition-all duration-200 flex items-center gap-2.5 ${
                    isActive ? 'bg-gradient-to-r from-brand-500 to-blue-500 text-white shadow-md' : 'hover:bg-surface-100 dark:hover:bg-surface-800'
                  }`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-black ${
                    isActive ? 'bg-white/20' : 'bg-surface-100 dark:bg-surface-800'
                  }`}>{ALL_TOOLS.indexOf(tool) + 1}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold truncate">{tool.name}</p>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider inline-block mt-0.5 ${
                      isActive ? 'bg-white/20 text-white' : tool.tier === 'Free' ? 'bg-sky-500/10 text-sky-400' : 'bg-brand-500/10 text-brand-500'
                    }`}>{tool.tier}</span>
                  </div>
                  {isExpanded ? <HiOutlineChevronDown className="w-3 h-3 flex-shrink-0" /> : <HiOutlineChevronRight className="w-3 h-3 flex-shrink-0 opacity-30" />}
                </button>

                {/* Sections sub-items */}
                {isExpanded && tool.sections && (
                  <div className="ml-4 mt-1 mb-2 pl-3 space-y-0.5" style={{borderLeft:'2px solid var(--color-border)'}}>
                    <button onClick={() => selectSection(tool, -1)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
                        isActive && activeSection === -1 ? 'bg-brand-500/10 text-brand-500' : 'hover:bg-surface-100 dark:hover:bg-surface-800'
                      }`} style={isActive && activeSection === -1 ? {} : {color:'var(--color-text-secondary)'}}>
                      <HiOutlineBookOpen className="w-3 h-3 inline mr-1.5" />Overview
                    </button>
                    {tool.sections.map((s, si) => (
                      <button key={si} onClick={() => selectSection(tool, si)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-[10px] transition-colors truncate ${
                          isActive && activeSection === si ? 'bg-brand-500/10 text-brand-500 font-semibold' : 'hover:bg-surface-100 dark:hover:bg-surface-800'
                        }`} style={isActive && activeSection === si ? {} : {color:'var(--color-text-secondary)'}}>
                        <span className="text-[9px] font-bold text-brand-500/50 mr-1.5">{si+1}</span>
                        {s.t.replace(/^[🔥🚨🔍⚡📊🧠]\s*/, '')}
                      </button>
                    ))}
                    {tool.tip && (
                      <button onClick={() => selectSection(tool, totalSections)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-[10px] transition-colors ${
                          isActive && activeSection === totalSections ? 'bg-brand-500/10 text-brand-500 font-semibold' : 'hover:bg-surface-100 dark:hover:bg-surface-800'
                        }`} style={isActive && activeSection === totalSections ? {} : {color:'var(--color-text-secondary)'}}>
                        <HiOutlineStar className="w-3 h-3 inline mr-1.5" />Pro Tip
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar collapsed toggle */}
      {!sidebarOpen && (
        <button onClick={() => setSidebarOpen(true)}
          className="hidden lg:flex flex-shrink-0 w-10 h-10 rounded-xl glass-card items-center justify-center self-start hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors mr-4"
          style={{color:'var(--color-text-secondary)'}}>
          <HiOutlineMenuAlt2 className="w-5 h-5" />
        </button>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-1 min-w-0" style={{scrollbarWidth:'thin'}}>

        {/* Open Tool CTA */}
        <Link to={activeTool.path} className="block glass-card group hover:border-brand-500/20 transition-all overflow-hidden">
          <div className={`h-1.5 bg-gradient-to-r ${activeTool.color}`} />
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activeTool.color} flex items-center justify-center text-white font-black shadow-glow-sm`}>
                {String(toolIdx + 1).padStart(2,'0')}
              </div>
              <div>
                <h1 className="text-lg font-bold" style={{color:'var(--color-text)'}}>{activeTool.name}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${activeTool.tier==='Free'?'bg-sky-500/10 text-sky-400':'bg-brand-500/10 text-brand-500'}`}>{activeTool.tier}</span>
                  <span className="text-[10px]" style={{color:'var(--color-text-secondary)'}}>{totalSections} sections</span>
                </div>
              </div>
            </div>
            <div className="btn-primary py-3 px-6 text-sm shadow-glow-sm group-hover:shadow-glow transition-shadow flex items-center gap-2">
              <HiOutlineExternalLink className="w-4 h-4" />
              Open Tool
            </div>
          </div>
        </Link>

        {/* Section navigation pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{scrollbarWidth:'thin'}}>
          <button onClick={() => setActiveSection(-1)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
              activeSection===-1 ? 'bg-brand-500 text-white shadow-glow-sm' : 'glass-card hover:bg-surface-100 dark:hover:bg-surface-800'
            }`} style={activeSection===-1?{}:{color:'var(--color-text-secondary)'}}>Overview</button>
          {activeTool.sections?.map((s,i) => (
            <button key={i} onClick={() => setActiveSection(i)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                activeSection===i ? 'bg-brand-500 text-white shadow-glow-sm' : 'glass-card hover:bg-surface-100 dark:hover:bg-surface-800'
              }`} style={activeSection===i?{}:{color:'var(--color-text-secondary)'}}>
              {i+1}. {s.t.replace(/^[🔥🚨🔍⚡📊🧠]\s*/, '').substring(0,30)}{s.t.length>35?'…':''}
            </button>
          ))}
          {activeTool.tip && (
            <button onClick={() => setActiveSection(totalSections)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                activeSection===totalSections ? 'bg-brand-500 text-white shadow-glow-sm' : 'glass-card hover:bg-surface-100 dark:hover:bg-surface-800'
              }`} style={activeSection===totalSections?{}:{color:'var(--color-text-secondary)'}}>
              <HiOutlineStar className="w-3 h-3" />Pro Tip
            </button>
          )}
        </div>

        {/* Content: Overview */}
        {activeSection === -1 && (
          <div className="glass-card p-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-bold text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-full">Overview</span>
            </div>
            <p className="text-[14px] leading-[1.9]" style={{color:'var(--color-text-secondary)'}}>{activeTool.overview}</p>

            {/* Section cards grid */}
            <div className="mt-6 pt-6" style={{borderTop:'1px solid var(--color-border)'}}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{color:'var(--color-text-secondary)'}}>
                {totalSections} Sections in this guide
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeTool.sections?.map((s,i) => (
                  <button key={i} onClick={() => setActiveSection(i)}
                    className="text-left p-4 rounded-xl border border-transparent hover:border-brand-500/15 transition-all group"
                    style={{background:'var(--color-surface-hover)'}}>
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-brand-500/10 text-brand-500 text-[10px] font-black flex items-center justify-center flex-shrink-0">{i+1}</span>
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold mb-1 leading-tight" style={{color:'var(--color-text)'}}>{s.t}</p>
                        <p className="text-[10px] line-clamp-2 leading-relaxed" style={{color:'var(--color-text-secondary)'}}>{s.c?.substring(0,100)}...</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-[9px] font-semibold text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity ml-10">
                      Read section <HiOutlineArrowRight className="w-3 h-3" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content: Individual Section */}
        {activeSection >= 0 && activeSection < totalSections && (
          <div className="glass-card p-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[10px] font-bold text-brand-500 bg-brand-500/10 px-2.5 py-1 rounded-full">Section {activeSection+1} of {totalSections}</span>
            </div>
            <h2 className="text-lg font-bold mb-5" style={{color:'var(--color-text)'}}>{activeTool.sections[activeSection].t}</h2>
            <SectionContent content={activeTool.sections[activeSection].c} />

            {/* Prev / Next navigation */}
            <div className="flex items-center justify-between mt-8 pt-5" style={{borderTop:'1px solid var(--color-border)'}}>
              {activeSection > 0 ? (
                <button onClick={() => setActiveSection(activeSection-1)} className="flex items-center gap-2 text-xs font-semibold text-brand-500 hover:underline">
                  <HiOutlineArrowRight className="w-3 h-3 rotate-180" /> Previous
                </button>
              ) : <div />}
              {activeSection < totalSections - 1 ? (
                <button onClick={() => setActiveSection(activeSection+1)} className="btn-primary py-2 px-5 text-xs">
                  Next Section <HiOutlineArrowRight className="w-3 h-3" />
                </button>
              ) : activeTool.tip ? (
                <button onClick={() => setActiveSection(totalSections)} className="btn-primary py-2 px-5 text-xs">
                  <HiOutlineStar className="w-3 h-3" /> Pro Tip
                </button>
              ) : null}
            </div>
          </div>
        )}

        {/* Content: Pro Tip */}
        {activeSection === totalSections && activeTool.tip && (
          <div className="glass-card p-6 animate-fade-in" style={{borderLeft:'3px solid #5B8DEF'}}>
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineStar className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold text-blue-400">Expert Pro Tip</h2>
            </div>
            <p className="text-[14px] leading-[1.9]" style={{color:'var(--color-text-secondary)'}}>{activeTool.tip}</p>
          </div>
        )}

        {/* Next Tool */}
        {toolIdx < ALL_TOOLS.length - 1 && (
          <button onClick={() => selectTool(ALL_TOOLS[toolIdx+1])}
            className="glass-card w-full p-5 group hover:border-brand-500/20 transition-all flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${ALL_TOOLS[toolIdx+1].color} flex items-center justify-center text-white text-[9px] font-black`}>
                {String(toolIdx+2).padStart(2,'0')}
              </div>
              <div className="text-left">
                <p className="text-[10px] font-semibold text-brand-500 uppercase tracking-wider">Next Guide</p>
                <p className="text-sm font-bold" style={{color:'var(--color-text)'}}>{ALL_TOOLS[toolIdx+1].name}</p>
              </div>
            </div>
            <HiOutlineArrowRight className="w-5 h-5 opacity-30 group-hover:opacity-70 group-hover:translate-x-1 transition-all" style={{color:'var(--color-text-secondary)'}} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Rich Section Content Renderer ─── */
function SectionContent({ content }) {
  if (!content) return null;
  const lines = content.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Empty line = spacer
    if (!line) {
      elements.push(<div key={i} className="h-3" />);
      i++;
      continue;
    }

    // Divider line
    if (line === '---' || line === '⸻') {
      elements.push(<hr key={i} className="border-none h-px my-4" style={{ background: 'var(--color-border)' }} />);
      i++;
      continue;
    }

    // Callout heading lines (🔥 🚨 🔍 ⚡ 📊 🧠 1️⃣-6️⃣)
    const isCalloutHeading = /^(🔥|🚨|🔍|⚡|📊|🧠|1️⃣|2️⃣|3️⃣|4️⃣|5️⃣|6️⃣)/.test(line);
    if (isCalloutHeading) {
      const emoji = line.match(/^(🔥|🚨|🔍|⚡|📊|🧠|1️⃣|2️⃣|3️⃣|4️⃣|5️⃣|6️⃣)/)?.[0];
      const bgMap = {
        '🔥': 'bg-blue-500/8 border-blue-500/15',
        '🚨': 'bg-sky-500/8 border-sky-500/15',
        '🔍': 'bg-indigo-500/8 border-indigo-500/15',
        '⚡': 'bg-brand-500/8 border-brand-500/15',
        '📊': 'bg-slate-500/8 border-slate-500/15',
        '🧠': 'bg-sky-500/8 border-sky-500/15',
      };
      const bg = bgMap[emoji] || 'bg-brand-500/8 border-brand-500/15';

      // Collect sub-lines (bullets/text under this heading until next heading or blank+heading)
      const subLines = [];
      let j = i + 1;
      while (j < lines.length) {
        const next = lines[j].trim();
        if (!next) {
          // Check if next non-empty line is a new heading
          let k = j + 1;
          while (k < lines.length && !lines[k].trim()) k++;
          if (k < lines.length && /^(🔥|🚨|🔍|⚡|📊|🧠|1️⃣|2️⃣|3️⃣|4️⃣|5️⃣|6️⃣)/.test(lines[k].trim())) break;
          subLines.push('');
          j++;
          continue;
        }
        if (/^(🔥|🚨|🔍|⚡|📊|🧠|1️⃣|2️⃣|3️⃣|4️⃣|5️⃣|6️⃣)/.test(next)) break;
        subLines.push(next);
        j++;
      }

      elements.push(
        <div key={i} className={`rounded-xl border p-4 my-3 ${bg}`}>
          <p className="text-[13px] font-bold mb-2" style={{ color: 'var(--color-text)' }}>{line}</p>
          {subLines.length > 0 && (
            <div className="space-y-1.5">
              {subLines.map((sl, si) => {
                if (!sl) return <div key={si} className="h-2" />;
                return <ContentLine key={si} line={sl} />;
              })}
            </div>
          )}
        </div>
      );
      i = j;
      continue;
    }

    // Arrow callout (👉)
    if (line.startsWith('👉')) {
      elements.push(
        <div key={i} className="flex items-start gap-2 pl-3 py-2 my-1 border-l-2 border-brand-500/30">
          <span className="text-[13px] leading-relaxed font-medium" style={{ color: 'var(--color-text)' }}>{line}</span>
        </div>
      );
      i++;
      continue;
    }

    // Warning/important callout (⚠️)
    if (line.startsWith('⚠️')) {
      elements.push(
        <div key={i} className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-3 my-2">
          <p className="text-[12px] font-medium leading-relaxed" style={{ color: 'var(--color-text)' }}>{line}</p>
        </div>
      );
      i++;
      continue;
    }

    // Contrast lines (❌ / ✅)
    if (line.startsWith('❌') || line.startsWith('✅')) {
      const isGood = line.startsWith('✅');
      elements.push(
        <div key={i} className={`flex items-start gap-2 px-3 py-1.5 rounded-lg my-1 ${isGood ? 'bg-brand-500/5' : 'bg-slate-500/5'}`}>
          <span className="text-[13px] leading-relaxed" style={{ color: 'var(--color-text)' }}>{line}</span>
        </div>
      );
      i++;
      continue;
    }

    // Bullet point lines (• or →)
    if (line.startsWith('•') || line.startsWith('→')) {
      // Collect consecutive bullets
      const bullets = [line];
      let j = i + 1;
      while (j < lines.length && (lines[j].trim().startsWith('•') || lines[j].trim().startsWith('→'))) {
        bullets.push(lines[j].trim());
        j++;
      }
      elements.push(
        <ul key={i} className="space-y-1.5 my-2 ml-1">
          {bullets.map((b, bi) => (
            <li key={bi} className="flex items-start gap-2.5 text-[13px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500/50 flex-shrink-0 mt-[7px]" />
              <span>{b.replace(/^[•→]\s*/, '')}</span>
            </li>
          ))}
        </ul>
      );
      i = j;
      continue;
    }

    // Default: regular paragraph
    elements.push(
      <p key={i} className="text-[13px] leading-[1.85] my-1" style={{ color: 'var(--color-text-secondary)' }}>{line}</p>
    );
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}

function ContentLine({ line }) {
  if (!line) return null;

  // Bullet
  if (line.startsWith('•') || line.startsWith('→')) {
    return (
      <div className="flex items-start gap-2 text-[12px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        <span className="w-1 h-1 rounded-full bg-brand-400/60 flex-shrink-0 mt-[7px]" />
        <span>{line.replace(/^[•→]\s*/, '')}</span>
      </div>
    );
  }

  // Arrow callout inside block
  if (line.startsWith('👉')) {
    return (
      <p className="text-[12px] leading-relaxed font-medium pl-1 mt-1" style={{ color: 'var(--color-text)' }}>{line}</p>
    );
  }

  // Contrast
  if (line.startsWith('❌') || line.startsWith('✅')) {
    return (
      <p className={`text-[12px] leading-relaxed rounded px-2 py-1 ${line.startsWith('✅') ? 'bg-brand-500/5' : 'bg-slate-500/5'}`} style={{ color: 'var(--color-text)' }}>{line}</p>
    );
  }

  // Regular text
  return <p className="text-[12px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{line}</p>;
}
