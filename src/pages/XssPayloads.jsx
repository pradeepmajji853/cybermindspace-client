import { useState, useMemo, useCallback } from 'react';
import { 
  HiOutlineSearch, HiOutlineClipboardCopy, HiOutlineCheck, HiOutlineCode, 
  HiOutlineFilter, HiOutlineTerminal, HiOutlineEye, HiOutlineInformationCircle,
  HiOutlineShieldCheck, HiOutlineGlobeAlt, HiOutlineLightningBolt, HiOutlineSparkles,
  HiOutlineTrash, HiOutlineDownload, HiOutlineRefresh, HiOutlineCollection,
  HiOutlineDesktopComputer
} from 'react-icons/hi';
import Fuse from 'fuse.js';
import toast from 'react-hot-toast';
import payloadsData from '../data/xssPayloads.json';

// --- Constants ---
const BROWSER_ICONS = {
  'Chrome': HiOutlineGlobeAlt,
  'Firefox': HiOutlineGlobeAlt,
  'Safari': HiOutlineGlobeAlt,
  'Edge': HiOutlineGlobeAlt,
};

const DIFFICULTY_COLORS = {
  'beginner': 'text-emerald-500 bg-emerald-500/10',
  'intermediate': 'text-amber-500 bg-amber-500/10',
  'advanced': 'text-red-500 bg-red-500/10',
};

const WAF_BYPASSES = {
  cloudflare: { 'script': 'ſcript', 'alert': '\u0061lert', 'onerror': 'on\u0065rror', 'javascript': 'java\u0073cript' },
  aws: { '<script>': '<ſcript>', 'javascript:': 'data:text/html,<script>', 'eval': 'setTimeout' },
  akamai: { 'script': 'SCRIPT', 'src=': 'src =', 'onerror': 'oN\u0065rror' },
  modsecurity: { 'script': 'scr<>ipt', 'alert': 'confirm' },
  f5: { '<': '%3C', '>': '%3E', 'script': 'ſcript' },
};

const CONTEXT_MAP = {
  html: ['html', 'tag', 'element'],
  javascript: ['script', 'js', 'javascript'],
  css: ['css', 'style'],
  url: ['url', 'parameter', 'query'],
  attribute: ['attribute', 'attr'],
  dom: ['dom', 'javascript'],
};

// --- Components ---
export default function XssPayloads() {
  const [activeTab, setActiveTab] = useState('arsenal'); // 'arsenal' or 'generator'
  
  // Arsenal State
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: 'All', context: 'All', difficulty: 'All' });
  
  // Generator State
  const [genContext, setGenContext] = useState('html');
  const [genWaf, setGenWaf] = useState('none');
  const [genRestrictions, setGenRestrictions] = useState({
    noAngles: false, noQuotes: false, noParens: false,
    noSlash: false, noSemicolon: false, lengthLimit: false, maxLength: 100,
  });
  const [genResults, setGenResults] = useState([]);
  
  // Shared State
  const [copiedId, setCopiedId] = useState(null);
  const [showSandbox, setShowSandbox] = useState(false);
  const [sandboxPayload, setSandboxPayload] = useState('');

  // Arsenal Logic
  const categories = ['All', ...new Set(payloadsData.map(p => p.category))];
  const contexts = ['All', ...new Set(payloadsData.map(p => p.context))];
  const difficulties = ['All', 'beginner', 'intermediate', 'advanced'];

  const fuse = useMemo(() => new Fuse(payloadsData, {
    keys: ['payload', 'description', 'tags', 'category', 'context'],
    threshold: 0.3,
  }), []);

  const filteredPayloads = useMemo(() => {
    let result = search ? fuse.search(search).map(r => r.item) : payloadsData;
    if (filters.category !== 'All') result = result.filter(p => p.category === filters.category);
    if (filters.context !== 'All') result = result.filter(p => p.context === filters.context);
    if (filters.difficulty !== 'All') result = result.filter(p => p.difficulty === filters.difficulty);
    return result;
  }, [search, filters, fuse]);

  // Generator Logic
  const generate = useCallback(() => {
    const matchesContext = (p, ctx) => {
      const tags = CONTEXT_MAP[ctx] || [];
      return tags.some(t => p.tags.some(pt => pt.toLowerCase().includes(t))) || p.payload.toLowerCase().includes(ctx);
    };

    const passesRestrictions = (code, r) => {
      if (r.noAngles && (code.includes('<') || code.includes('>'))) return false;
      if (r.noQuotes && (code.includes('"') || code.includes("'"))) return false;
      if (r.noParens && (code.includes('(') || code.includes(')'))) return false;
      if (r.noSlash && code.includes('/')) return false;
      if (r.noSemicolon && code.includes(';')) return false;
      if (r.lengthLimit && code.length > r.maxLength) return false;
      return true;
    };

    const applyBypass = (code, waf, r) => {
      let result = code;
      if (waf !== 'none' && WAF_BYPASSES[waf]) {
        for (const [orig, repl] of Object.entries(WAF_BYPASSES[waf])) {
          result = result.replace(new RegExp(orig.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), repl);
        }
      }
      if (r.noParens) result = result.replace(/alert\([^)]*\)/gi, 'alert`1`').replace(/confirm\([^)]*\)/gi, 'confirm`1`');
      if (r.noSemicolon) result = result.replace(/;/g, '');
      return result;
    };

    let candidates = payloadsData.filter(p => matchesContext(p, genContext) && passesRestrictions(p.payload, genRestrictions));
    if (candidates.length === 0) candidates = payloadsData.filter(p => passesRestrictions(p.payload, genRestrictions));
    
    if (candidates.length === 0) {
      toast.error('No matching payloads found. Relax restrictions.');
      return;
    }

    const selected = [...candidates].sort(() => 0.5 - Math.random()).slice(0, 5);
    const generated = selected.map(p => ({
      code: applyBypass(p.payload, genWaf, genRestrictions),
      original: p,
      effectiveness: Math.max(30, 90 - (genWaf !== 'none' ? 10 : 0) - (genRestrictions.noAngles ? 20 : 0))
    })).filter(g => passesRestrictions(g.code, genRestrictions));

    setGenResults(generated);
    if (generated.length > 0) toast.success(`Generated ${generated.length} payloads`);
  }, [genContext, genWaf, genRestrictions]);

  const handleCopy = (payload, id) => {
    navigator.clipboard.writeText(payload);
    setCopiedId(id);
    toast.success('Copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm">
            <HiOutlineCode className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>XSS Arsenal & Generator</h1>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Professional toolkit with {payloadsData.length} vectors and context-aware generation
            </p>
          </div>
        </div>
        <div className="flex p-1 rounded-xl bg-surface-100 dark:bg-surface-800 border border-border">
          <button 
            onClick={() => setActiveTab('arsenal')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'arsenal' ? 'bg-white dark:bg-surface-700 shadow-sm text-brand-600 dark:text-brand-400' : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'}`}
          >
            <HiOutlineCollection className="w-4 h-4 inline mr-1.5" /> Arsenal
          </button>
          <button 
            onClick={() => setActiveTab('generator')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'generator' ? 'bg-white dark:bg-surface-700 shadow-sm text-brand-600 dark:text-brand-400' : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'}`}
          >
            <HiOutlineSparkles className="w-4 h-4 inline mr-1.5" /> Generator
          </button>
        </div>
      </div>

      {activeTab === 'arsenal' ? (
        <>
          {/* Arsenal Search & Filters */}
          <div className="glass-card p-4 space-y-4">
            <div className="relative">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Fuzzy search (e.g. 'waf bypass', 'svg', 'polyglot')..."
                className="input-field pl-12 text-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              <select onChange={(e) => setFilters({...filters, category: e.target.value})} className="bg-transparent focus:outline-none cursor-pointer hover:text-brand-500">
                {categories.map(c => <option key={c} value={c} className="bg-surface-800">{c} Category</option>)}
              </select>
              <select onChange={(e) => setFilters({...filters, context: e.target.value})} className="bg-transparent focus:outline-none cursor-pointer hover:text-brand-500">
                {contexts.map(c => <option key={c} value={c} className="bg-surface-800">{c} Context</option>)}
              </select>
              <select onChange={(e) => setFilters({...filters, difficulty: e.target.value})} className="bg-transparent focus:outline-none cursor-pointer hover:text-brand-500">
                {difficulties.map(d => <option key={d} value={d} className="bg-surface-800">{d} Level</option>)}
              </select>
              <span className="ml-auto opacity-50">{filteredPayloads.length} payloads found</span>
            </div>
          </div>

          {/* Arsenal Grid */}
          <div className="grid grid-cols-1 gap-4">
            {filteredPayloads.slice(0, 50).map((p, idx) => (
              <div key={p.id} className="glass-card p-4 group hover:border-brand-500/30 transition-all animate-slide-up" style={{ animationDelay: `${idx * 20}ms` }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${DIFFICULTY_COLORS[p.difficulty]}`}>{p.difficulty}</span>
                    <span className="text-[10px] font-mono text-brand-500 font-bold">{p.category} • {p.context}</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleCopy(p.payload, p.id)} className="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-800 rounded">
                      {copiedId === p.id ? <HiOutlineCheck className="text-emerald-500" /> : <HiOutlineClipboardCopy />}
                    </button>
                    <button onClick={() => { setSandboxPayload(p.payload); setShowSandbox(true); }} className="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-800 rounded">
                      <HiOutlineEye className="text-brand-500" />
                    </button>
                  </div>
                </div>
                <pre className="p-3 bg-surface-50 dark:bg-black/30 rounded border border-border overflow-x-auto text-xs font-mono text-brand-700 dark:text-brand-300">
                  {p.payload}
                </pre>
                <p className="mt-2 text-[11px] opacity-60 italic">{p.description}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Generator Tab */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-5 glass-card p-5">
            <h2 className="text-sm font-bold flex items-center gap-2"><HiOutlineFilter className="text-brand-500" /> Generator Options</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase opacity-50 block mb-1.5">Context</label>
                <select value={genContext} onChange={e => setGenContext(e.target.value)} className="input-field py-2 text-xs">
                  {Object.keys(CONTEXT_MAP).map(c => <option key={c} value={c}>{c.toUpperCase()} Context</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase opacity-50 block mb-1.5">WAF Target</label>
                <select value={genWaf} onChange={e => setGenWaf(e.target.value)} className="input-field py-2 text-xs">
                  <option value="none">No WAF</option>
                  <option value="cloudflare">Cloudflare</option>
                  <option value="aws">AWS WAF</option>
                  <option value="akamai">Akamai</option>
                  <option value="modsecurity">ModSecurity</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase opacity-50 block mb-1.5">Restrictions</label>
                {Object.entries({
                  noAngles: 'No < > Brackets',
                  noQuotes: 'No Quotes (\' ")',
                  noParens: 'No Parentheses ( )',
                  noSlash: 'No Forward Slash /',
                  noSemicolon: 'No Semicolons ;'
                }).map(([k, label]) => (
                  <label key={k} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={genRestrictions[k]} 
                      onChange={() => setGenRestrictions({...genRestrictions, [k]: !genRestrictions[k]})}
                      className="w-4 h-4 rounded border-border text-brand-600 focus:ring-brand-500 accent-brand-600"
                    />
                    <span className="text-xs opacity-70 group-hover:opacity-100 transition-opacity">{label}</span>
                  </label>
                ))}
              </div>

              <button 
                onClick={generate}
                className="btn-primary w-full py-3 mt-4 text-xs shadow-glow-sm"
              >
                <HiOutlineSparkles className="w-4 h-4" /> Generate Payloads
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-card p-4 border-b-0 rounded-b-none flex items-center justify-between bg-surface-50 dark:bg-surface-900/30">
              <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <HiOutlineTerminal className="text-emerald-500" /> Generated Vectors
              </h2>
              {genResults.length > 0 && <span className="text-[10px] font-mono opacity-50">{genResults.length} unique results</span>}
            </div>
            
            <div className="space-y-4">
              {genResults.length === 0 ? (
                <div className="glass-card py-20 flex flex-col items-center justify-center opacity-40 italic text-sm">
                  <HiOutlineRefresh className="w-10 h-10 mb-3 animate-spin-slow" />
                  Select options and click Generate
                </div>
              ) : (
                genResults.map((r, i) => (
                  <div key={i} className="glass-card p-5 border-l-4 border-l-emerald-500 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                          {r.effectiveness}% Effective
                        </span>
                        <span className="text-[10px] font-mono opacity-50">{r.code.length} chars</span>
                      </div>
                      <button onClick={() => handleCopy(r.code, `gen-${i}`)} className="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-800 rounded">
                        {copiedId === `gen-${i}` ? <HiOutlineCheck className="text-emerald-500" /> : <HiOutlineClipboardCopy className="opacity-50" />}
                      </button>
                    </div>
                    <pre className="p-3 bg-black/40 rounded border border-border text-xs font-mono text-emerald-400 break-all whitespace-pre-wrap">
                      {r.code}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sandbox Modal */}
      {showSandbox && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="glass-card w-full max-w-2xl shadow-2xl animate-scale-in">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2"><HiOutlineEye className="text-brand-500" /> Payload Preview</h3>
              <button onClick={() => setShowSandbox(false)} className="text-xs opacity-50 hover:opacity-100">Close</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase opacity-40">Code</p>
                <div className="p-3 bg-black rounded border border-border text-xs font-mono text-brand-400 break-all">{sandboxPayload}</div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase opacity-40">DOM Projection</p>
                <div className="p-8 border border-dashed rounded bg-surface-50 dark:bg-surface-900/50 flex flex-col items-center justify-center text-center">
                  <div className="text-xs font-mono opacity-30 mb-4">&lt;div class="vulnerable-context"&gt;</div>
                  <div className="text-brand-500 font-mono text-sm">{sandboxPayload}</div>
                  <div className="text-xs font-mono opacity-30 mt-4">&lt;/div&gt;</div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-surface-50 dark:bg-surface-800/50 flex justify-end gap-3">
              <button onClick={() => setShowSandbox(false)} className="btn-secondary text-xs">Close</button>
              <button onClick={() => { handleCopy(sandboxPayload, 'sb'); setShowSandbox(false); }} className="btn-primary text-xs">Copy & Exit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
