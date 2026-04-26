import { useState } from 'react';
import { HiOutlineSparkles, HiOutlineClipboardCopy, HiOutlineCode } from 'react-icons/hi';
import toast from 'react-hot-toast';

const COMMON_PATTERNS = [
  { name: 'Email Address', regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
  { name: 'IPv4 Address', regex: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$' },
  { name: 'URL (HTTP/S)', regex: '^https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)$' },
  { name: 'MAC Address', regex: '^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$' },
  { name: 'Strong Password', regex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$' },
  { name: 'Hex Color', regex: '^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$' },
];

export default function RegexGenerator() {
  const [testString, setTestString] = useState('');
  const [activeRegex, setActiveRegex] = useState(COMMON_PATTERNS[0].regex);

  const copy = () => {
    navigator.clipboard.writeText(activeRegex);
    toast.success('Regex copied!');
  };

  const isMatch = () => {
    try {
      const re = new RegExp(activeRegex);
      return re.test(testString);
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm">
          <HiOutlineSparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Regex Generator</h1>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Common patterns and real-time testing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-3">
          <p className="text-xs font-bold uppercase opacity-40 mb-2">Common Patterns</p>
          {COMMON_PATTERNS.map(p => (
            <button
              key={p.name}
              onClick={() => setActiveRegex(p.regex)}
              className={`w-full text-left p-3 rounded-xl text-xs font-medium border transition-all ${
                activeRegex === p.regex 
                ? 'bg-brand-500/10 border-brand-500 text-brand-500' 
                : 'bg-surface-100 dark:bg-surface-900 border-border hover:border-brand-500/30'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <HiOutlineCode className="text-brand-500" /> Pattern
              </h3>
              <button onClick={copy} className="btn-ghost text-xs py-1">
                <HiOutlineClipboardCopy className="w-4 h-4" /> Copy
              </button>
            </div>
            <textarea
              value={activeRegex}
              onChange={(e) => setActiveRegex(e.target.value)}
              className="input-field min-h-[80px] font-mono text-xs text-brand-500"
            />
          </div>

          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <span className="text-purple-500">Live Test</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${isMatch() ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {isMatch() ? 'Match Found' : 'No Match'}
              </span>
            </h3>
            <input
              type="text"
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Type something to test against the regex..."
              className="input-field text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
