import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ACADEMY_BATCH1 } from '../data/academyData1';
import { ACADEMY_BATCH2 } from '../data/academyData2';
import { ACADEMY_BATCH3 } from '../data/academyData3';
import { ACADEMY_BATCH4 } from '../data/academyData4';
import { ACADEMY_BATCH5 } from '../data/academyData5';
import { ACADEMY_BATCH6 } from '../data/academyData6';
import { HiOutlineSearch, HiOutlineArrowRight, HiOutlineExternalLink, HiOutlineStar, HiOutlineAcademicCap, HiOutlineBookOpen, HiOutlineChevronRight } from 'react-icons/hi';

const ALL_TOOLS = [...ACADEMY_BATCH1, ...ACADEMY_BATCH2, ...ACADEMY_BATCH3, ...ACADEMY_BATCH4, ...ACADEMY_BATCH5, ...ACADEMY_BATCH6];

export default function Education() {
  const { userProfile } = useAuth();
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
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow-sm">
              <HiOutlineAcademicCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight" style={{color:'var(--color-text)'}}>Pro Academy</h2>
              <div className="flex items-center gap-1">
                <HiOutlineStar className="w-3 h-3 text-amber-500" />
                <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Premium Content</p>
              </div>
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

        <div className="glass-card p-3 text-center">
          <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">{ALL_TOOLS.length} Expert Guides</p>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 glass-card overflow-hidden flex flex-col min-w-0">
        {/* Gradient Hero */}
        <div className={`relative px-8 py-7 overflow-hidden bg-gradient-to-r ${activeTool.color}`}>
          <div className="absolute inset-0 opacity-[0.07]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white rounded-full blur-2xl translate-y-1/2" />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white uppercase tracking-widest">{activeTool.tier}</span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white uppercase tracking-widest flex items-center gap-1">
                  <HiOutlineBookOpen className="w-3 h-3" />Expert Guide
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white uppercase tracking-widest">
                  {activeTool.sections.length} Chapters
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{activeTool.name}</h1>
            </div>
            <Link to={activeTool.path} className="bg-white/20 hover:bg-white/30 backdrop-blur text-white py-2.5 px-5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap border border-white/10 hover:border-white/30 hover:shadow-lg">
              <HiOutlineExternalLink className="w-4 h-4" /> Launch Tool
            </Link>
          </div>
        </div>

        {/* Scrollable Content */}
        <div key={animKey} className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8" style={{scrollbarWidth:'thin'}}>
          {/* Overview */}
          <section className="acad-section" style={{animationDelay:'0ms'}}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-1 h-6 rounded-full bg-gradient-to-b ${activeTool.color}`} />
              <h3 className="text-xs font-black uppercase tracking-[0.15em] opacity-60">Overview</h3>
            </div>
            <p className="text-[13.5px] leading-[2] opacity-80" style={{color:'var(--color-text)'}}>{activeTool.overview}</p>
          </section>

          {/* Chapters */}
          {activeTool.sections.map((s, i) => (
            <section key={i} className="acad-section glass-card rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500" style={{animationDelay:`${(i+1)*80}ms`}}>
              <div className={`h-1 bg-gradient-to-r ${activeTool.color}`} />
              <div className="p-6 lg:p-7">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${activeTool.color} flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-lg`}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 mb-0.5">Chapter {i + 1}</p>
                    <h3 className="text-sm font-black tracking-tight" style={{color:'var(--color-text)'}}>{s.t}</h3>
                  </div>
                </div>
                <p className="text-[13px] leading-[2] opacity-75 pl-12" style={{color:'var(--color-text)'}}>{s.c}</p>
              </div>
            </section>
          ))}

          {/* Pro Tip */}
          <section className="acad-section relative rounded-2xl overflow-hidden" style={{animationDelay:`${(activeTool.sections.length+1)*80}ms`}}>
            <div className={`absolute inset-0 bg-gradient-to-r ${activeTool.color} opacity-[0.04]`} />
            <div className="relative p-6 lg:p-7 border-l-4 border-amber-500">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">💡</span>
                <h3 className="text-xs font-black uppercase tracking-[0.15em] text-amber-600 dark:text-amber-400">Expert Pro Tip</h3>
              </div>
              <p className="text-[13px] leading-[2] opacity-80" style={{color:'var(--color-text)'}}>{activeTool.tip}</p>
            </div>
          </section>

          {/* Launch CTA */}
          <div className="flex items-center gap-4 pt-2 pb-4">
            <Link to={activeTool.path} className="btn-primary py-3 px-8 text-sm flex items-center gap-2 shadow-glow hover:shadow-glow-lg transition-shadow">
              <HiOutlineArrowRight className="w-4 h-4" /> Launch {activeTool.name}
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .acad-section {
          animation: acadFadeUp 0.5s ease-out both;
        }
        @keyframes acadFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
