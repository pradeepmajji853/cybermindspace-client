import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiOutlineSearch, HiOutlineShieldCheck, HiOutlineCode, HiOutlineArrowRight, 
  HiOutlineLockClosed, HiOutlineSparkles, HiOutlineGlobeAlt, HiOutlineServer,
  HiOutlineTerminal, HiOutlineLightningBolt, HiOutlineFilter,
  HiOutlineClock, HiOutlineShieldExclamation
} from 'react-icons/hi';

const CATEGORIES = [
  { id: 'recon', name: 'Reconnaissance (OSINT)', icon: HiOutlineSearch },
  { id: 'web', name: 'Web Security', icon: HiOutlineGlobeAlt },
  { id: 'network', name: 'Network Security', icon: HiOutlineServer },
  { id: 'automation', name: 'Automation & Utilities', icon: HiOutlineTerminal },
  { id: 'intelligence', name: 'Advanced Intel', icon: HiOutlineShieldExclamation },
];

const TOOLS = [
  // Reconnaissance — FREE tier
  {
    id: 'osint',
    category: 'recon',
    name: 'OSINT Intelligence Hub',
    description: 'Multi-vector intelligence gathering for emails, domains, and IPs.',
    icon: <HiOutlineShieldCheck className="w-6 h-6" />,
    path: '/tools/osint',
    badge: 'Free',
    tier: 'free',
  },
  {
    id: 'subdomain',
    category: 'recon',
    name: 'Subdomain Finder',
    description: 'Enumerate subdomains for a target domain using public records.',
    icon: <HiOutlineSearch className="w-6 h-6" />,
    path: '/tools/subdomain',
    badge: 'Free',
    tier: 'free',
  },
  {
    id: 'dns',
    category: 'recon',
    name: 'DNS Lookup Tool',
    description: 'Retrieve A, MX, TXT, and NS records for any domain.',
    icon: <HiOutlineGlobeAlt className="w-6 h-6" />,
    path: '/tools/dns',
    badge: 'Free',
    tier: 'free',
  },
  {
    id: 'email-breach',
    category: 'recon',
    name: 'Email Breach Checker',
    description: 'Check if an email has been exposed in known data breaches.',
    icon: <HiOutlineFilter className="w-6 h-6" />,
    path: '/tools/email-breach',
    badge: 'Pro',
    tier: 'pro',
  },
  {
    id: 'wayback',
    category: 'recon',
    name: 'Wayback Machine Explorer',
    description: 'Explore historical snapshots and hidden endpoints from the past.',
    icon: <HiOutlineClock className="w-6 h-6" />,
    path: '/tools/osint?type=osint',
    badge: 'Free',
    tier: 'free',
  },
  {
    id: 'cert',
    category: 'recon',
    name: 'Certificate Transparency Search',
    description: 'Search public certificate logs for subdomains and assets.',
    icon: <HiOutlineLockClosed className="w-6 h-6" />,
    path: '/tools/subdomain',
    badge: 'Free',
    tier: 'free',
  },

  // Web Security — Mixed tiers
  {
    id: 'xss',
    category: 'web',
    name: 'XSS Arsenal',
    description: 'Library of 500+ payloads and a context-aware generator.',
    icon: <HiOutlineCode className="w-6 h-6" />,
    path: '/tools/xss',
    badge: 'Free',
    tier: 'free',
  },
  {
    id: 'sqli',
    category: 'web',
    name: 'SQLi Payload Generator',
    description: 'Generate bypass payloads for various SQL injection vulnerabilities.',
    icon: <HiOutlineLightningBolt className="w-6 h-6" />,
    path: '/tools/sqli',
    badge: 'Pro',
    tier: 'pro',
  },
  {
    id: 'jwt',
    category: 'web',
    name: 'JWT Decoder & Analyzer',
    description: 'Decode and analyze JSON Web Tokens for security flaws.',
    icon: <HiOutlineLockClosed className="w-6 h-6" />,
    path: '/tools/jwt',
    badge: 'Pro',
    tier: 'pro',
  },
  {
    id: 'headers',
    category: 'web',
    name: 'Security Headers Analyzer',
    description: 'Audit HTTP security headers (CSP, HSTS, etc.) of a website.',
    icon: <HiOutlineGlobeAlt className="w-6 h-6" />,
    path: '/tools/osint?type=vuln',
    badge: 'Pro',
    tier: 'pro',
  },
  {
    id: 'tech-stack',
    category: 'web',
    name: 'Tech Stack Detector',
    description: 'Identify CMS, frameworks, and infrastructure of any website.',
    icon: <HiOutlineSparkles className="w-6 h-6" />,
    path: '/tools/osint?type=osint',
    badge: 'Pro',
    tier: 'pro',
  },
  {
    id: 'takeover',
    category: 'web',
    name: 'Subdomain Takeover Checker',
    description: 'Check for dangling CNAMEs pointing to expired cloud services.',
    icon: <HiOutlineShieldExclamation className="w-6 h-6" />,
    path: '/tools/osint?type=takeover',
    badge: 'Pro',
    tier: 'pro',
  },
  {
    id: 'whois-privacy',
    category: 'intelligence',
    name: 'WHOIS Privacy Audit',
    description: 'Identify exposed registrant details and contact information.',
    icon: <HiOutlineSearch className="w-6 h-6" />,
    path: '/tools/osint?type=whois-privacy',
    badge: 'Pro',
    tier: 'pro',
  },

  // Network — Mixed tiers
  {
    id: 'port',
    category: 'network',
    name: 'Port Scanner',
    description: 'Identify open services and management ports on a target.',
    icon: <HiOutlineServer className="w-6 h-6" />,
    path: '/tools/osint?type=port',
    badge: 'Pro',
    tier: 'pro',
  },
  {
    id: 'ip-intel',
    category: 'network',
    name: 'IP Intelligence',
    description: 'Detailed Geo, ISP, and ASN data for any IP address.',
    icon: <HiOutlineSearch className="w-6 h-6" />,
    path: '/tools/osint?type=ip',
    badge: 'Pro',
    tier: 'pro',
  },
  {
    id: 'traceroute',
    category: 'network',
    name: 'Traceroute Visualizer',
    description: 'Visualize the network path to a remote host.',
    icon: <HiOutlineArrowRight className="w-6 h-6" />,
    path: '/tools/traceroute',
    badge: 'Pro',
    tier: 'pro',
  },

  // Automation — Pro tier
  {
    id: 'http-builder',
    category: 'automation',
    name: 'HTTP Request Builder',
    description: 'Build, test, and debug raw HTTP/API requests.',
    icon: <HiOutlineTerminal className="w-6 h-6" />,
    path: '/tools/http-builder',
    badge: 'Pro',
    tier: 'pro',
  },
  {
    id: 'regex',
    category: 'automation',
    name: 'Regex Generator',
    description: 'Generate complex regular expressions from plain text.',
    icon: <HiOutlineSparkles className="w-6 h-6" />,
    path: '/tools/regex',
    badge: 'Pro',
    tier: 'pro',
  },

];

function ToolCard({ tool }) {
  const badgeColors = {
    Free: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    Pro: 'bg-brand-500/10 text-brand-500 border-brand-500/20',
  };

  return (
    <Link
      to={tool.path}
      className="glass-card p-5 group hover:border-brand-500/30 transition-all duration-300 animate-slide-up"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors`}>
            {tool.icon}
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{tool.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${badgeColors[tool.badge] || badgeColors.Pro}`}>
                {tool.badge}
              </span>
              {tool.tier !== 'free' && <HiOutlineLockClosed className="w-3 h-3 text-purple-500" />}
            </div>
          </div>
        </div>
        <HiOutlineArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" style={{ color: 'var(--color-text-secondary)' }} />
      </div>
      <p className="mt-4 text-xs leading-relaxed opacity-60" style={{ color: 'var(--color-text)' }}>
        {tool.description}
      </p>
    </Link>
  );
}

export default function ToolsHub() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredTools = TOOLS.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) ||
                         tool.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Recon Engine promo — push the workflow first */}
      <Link
        to="/recon"
        className="glass-card p-6 flex items-center justify-between gap-6 border-l-4 border-l-brand-500 hover:shadow-glow transition-all group relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-brand opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative">
          <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm flex-shrink-0">
            <HiOutlineLightningBolt className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gradient-brand text-white tracking-widest uppercase">New</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-brand-400">Recommended Workflow</span>
            </div>
            <h2 className="text-base md:text-lg font-bold text-slate-100">Use the Unified Recon Engine</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              One target → subdomains, endpoints, tech, vulns, takeover signals & AI exploit playbook in 30 seconds. The tools below are for follow-up deep dives.
            </p>
          </div>
        </div>
        <HiOutlineArrowRight className="w-5 h-5 text-brand-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            Advanced <span className="text-gradient">Tools</span>
          </h1>
          <p className="text-sm opacity-60" style={{ color: 'var(--color-text)' }}>
            Specialised utilities for when the Recon Engine surfaces something worth pivoting on.
          </p>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search arsenal..."
            className="input-field pl-11 text-sm py-2.5"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
            activeCategory === 'all' 
            ? 'bg-brand-500 text-white border-brand-500 shadow-glow-sm' 
            : 'bg-surface-100 dark:bg-surface-900 text-surface-500 border-border hover:border-brand-500/50'
          }`}
        >
          All Tools
        </button>
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-2 ${
                activeCategory === cat.id 
                ? 'bg-brand-500 text-white border-brand-500 shadow-glow-sm' 
                : 'bg-surface-100 dark:bg-surface-900 text-surface-500 border-border hover:border-brand-500/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Tools Sectioned by Category */}
      {CATEGORIES.map(category => {
        const categoryTools = filteredTools.filter(t => t.category === category.id);
        if (categoryTools.length === 0) return null;

        return (
          <div key={category.id} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
                {category.name}
              </h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryTools.map(tool => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        );
      })}

      {filteredTools.length === 0 && (
        <div className="text-center py-20 glass-card">
          <HiOutlineSearch className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-sm opacity-40">No tools found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
