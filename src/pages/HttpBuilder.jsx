import { useState } from 'react';
import {
  HiOutlineTerminal, HiOutlinePlay, HiOutlineTrash, HiOutlinePlus,
  HiOutlineClipboardCopy, HiOutlineCheck,
} from 'react-icons/hi';
import client from '../api/client';
import toast from 'react-hot-toast';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

export default function HttpBuilder() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState([{ k: '', v: '' }]);
  const [body, setBody] = useState('');
  const [bodyType, setBodyType] = useState('json');
  const [tab, setTab] = useState('headers');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [responseTab, setResponseTab] = useState('body');
  const [copied, setCopied] = useState(false);

  const addHeader = () => setHeaders([...headers, { k: '', v: '' }]);
  const updateHeader = (i, key, val) => {
    const next = [...headers]; next[i] = { ...next[i], [key]: val }; setHeaders(next);
  };
  const removeHeader = (i) => setHeaders(headers.filter((_, idx) => idx !== i));

  const send = async () => {
    if (!url.trim()) return toast.error('URL required');
    setLoading(true); setResponse(null);
    try {
      const headerObj = {};
      for (const h of headers) if (h.k.trim()) headerObj[h.k.trim()] = h.v;
      if (bodyType === 'json' && body && !headerObj['Content-Type']) headerObj['Content-Type'] = 'application/json';
      if (bodyType === 'form' && body && !headerObj['Content-Type']) headerObj['Content-Type'] = 'application/x-www-form-urlencoded';

      const { data } = await client.post('/tools/http-request', {
        method, url: url.trim(), headers: headerObj,
        body: ['GET', 'HEAD'].includes(method) ? undefined : body,
      });
      setResponse(data);
      toast.success(`${data.status} • ${data.elapsedMs} ms • ${(data.sizeBytes / 1024).toFixed(1)} KB`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Request failed');
    } finally { setLoading(false); }
  };

  const copyBody = () => {
    if (!response) return;
    navigator.clipboard.writeText(response.body || '');
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  let prettyBody = response?.body || '';
  let bodyLang = 'plain';
  if (response?.body) {
    try {
      const parsed = JSON.parse(response.body);
      prettyBody = JSON.stringify(parsed, null, 2);
      bodyLang = 'json';
    } catch (_) {
      if (response.body.trim().startsWith('<')) bodyLang = 'html';
    }
  }

  const statusColor =
    !response ? 'badge-blue' :
    response.status >= 200 && response.status < 300 ? 'badge-green' :
    response.status >= 300 && response.status < 400 ? 'badge-yellow' :
    'badge-red';

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm">
          <HiOutlineTerminal className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>HTTP Request Studio</h1>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Server-side execution — bypasses CORS, captures timing, full response data
          </p>
        </div>
      </div>

      <div className="glass-card p-4 space-y-3">
        <div className="flex gap-2 flex-wrap">
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="input-field w-28 font-bold text-xs">
            {METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="https://api.example.com/v1/resource"
            className="input-field flex-1 text-sm font-mono"
          />
          <button onClick={send} disabled={loading} className="btn-primary">
            {loading ? <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" /> : <HiOutlinePlay className="w-4 h-4" />}
            Send
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button onClick={() => setTab('headers')} className={`px-3 py-1.5 rounded ${tab === 'headers' ? 'bg-brand-500 text-white' : 'bg-surface-100 dark:bg-surface-800'}`}>
            Headers ({headers.filter(h => h.k.trim()).length})
          </button>
          <button onClick={() => setTab('body')} className={`px-3 py-1.5 rounded ${tab === 'body' ? 'bg-brand-500 text-white' : 'bg-surface-100 dark:bg-surface-800'}`}>
            Body
          </button>
        </div>

        {tab === 'headers' && (
          <div className="space-y-2">
            {headers.map((h, i) => (
              <div key={i} className="flex gap-2">
                <input value={h.k} onChange={(e) => updateHeader(i, 'k', e.target.value)} placeholder="Header name" className="input-field text-xs font-mono flex-1" />
                <input value={h.v} onChange={(e) => updateHeader(i, 'v', e.target.value)} placeholder="Value" className="input-field text-xs font-mono flex-1" />
                <button onClick={() => removeHeader(i)} className="p-2 rounded text-red-400 hover:bg-red-500/10"><HiOutlineTrash className="w-4 h-4" /></button>
              </div>
            ))}
            <button onClick={addHeader} className="btn-ghost text-xs"><HiOutlinePlus className="w-4 h-4" /> Add header</button>
          </div>
        )}

        {tab === 'body' && (
          <div className="space-y-2">
            <div className="flex gap-2">
              {['json', 'form', 'text'].map(t => (
                <button key={t} onClick={() => setBodyType(t)} className={`px-3 py-1 rounded text-[10px] font-bold uppercase ${bodyType === t ? 'bg-brand-500 text-white' : 'bg-surface-100 dark:bg-surface-800 opacity-60'}`}>{t}</button>
              ))}
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={bodyType === 'json' ? '{\n  "key": "value"\n}' : bodyType === 'form' ? 'key1=value1&key2=value2' : 'Plain text body'}
              className="input-field font-mono text-xs min-h-[120px]"
            />
          </div>
        )}
      </div>

      {response && (
        <div className="space-y-4 animate-slide-up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="glass-card p-3">
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-50 mb-1">Status</p>
              <span className={`badge ${statusColor} text-xs`}>{response.status} {response.statusText}</span>
            </div>
            <Stat label="Time"      value={`${response.elapsedMs} ms`} />
            <Stat label="Size"      value={`${(response.sizeBytes / 1024).toFixed(1)} KB`} />
            <Stat label="Protocol"  value={response.httpVersion || '—'} />
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setResponseTab('body')} className={`px-3 py-1.5 rounded text-xs font-bold ${responseTab === 'body' ? 'bg-brand-500 text-white' : 'bg-surface-100 dark:bg-surface-800'}`}>
              Body
            </button>
            <button onClick={() => setResponseTab('headers')} className={`px-3 py-1.5 rounded text-xs font-bold ${responseTab === 'headers' ? 'bg-brand-500 text-white' : 'bg-surface-100 dark:bg-surface-800'}`}>
              Headers ({Object.keys(response.headers).length})
            </button>
            <span className="text-[10px] opacity-50 ml-auto">{bodyLang.toUpperCase()}</span>
            <button onClick={copyBody} className="p-1.5 rounded hover:bg-surface-100 dark:hover:bg-surface-800">
              {copied ? <HiOutlineCheck className="w-4 h-4 text-emerald-500" /> : <HiOutlineClipboardCopy className="w-4 h-4 opacity-60" />}
            </button>
          </div>

          <div className="glass-card p-4">
            {responseTab === 'body' ? (
              <pre className="p-4 rounded-xl bg-surface-100 dark:bg-black/40 text-[11px] font-mono overflow-auto max-h-[500px] leading-relaxed">
                {prettyBody}
              </pre>
            ) : (
              <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                {Object.entries(response.headers).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 text-[11px] border-b border-border/40 py-1.5">
                    <span className="font-bold opacity-60 font-mono">{k}</span>
                    <span className="font-mono text-right break-all">{Array.isArray(v) ? v.join(', ') : String(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="glass-card p-3">
      <p className="text-[9px] font-bold uppercase tracking-widest opacity-50 mb-1">{label}</p>
      <p className="text-sm font-bold font-mono" style={{ color: 'var(--color-text)' }}>{value}</p>
    </div>
  );
}
