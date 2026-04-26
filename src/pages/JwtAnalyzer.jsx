import { useState, useMemo } from 'react';
import {
  HiOutlineLockClosed, HiOutlineExclamationCircle, HiOutlineClipboardCopy,
  HiOutlineShieldCheck, HiOutlineShieldExclamation, HiOutlineClock,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const CLAIM_GLOSSARY = {
  iss:     'Issuer — who created/signed the token',
  sub:     'Subject — the user / entity the token is about',
  aud:     'Audience — who the token is intended for',
  exp:     'Expiration — Unix timestamp after which the token is invalid',
  nbf:     'Not Before — Unix timestamp before which token must be rejected',
  iat:     'Issued At — Unix timestamp when token was created',
  jti:     'JWT ID — unique identifier (replay prevention)',
  azp:     'Authorized Party — for whom the token was issued',
  scope:   'Scope — granted permissions',
  email:   'Email of the subject',
  name:    'Display name of the subject',
  role:    'Role assigned to the subject',
  roles:   'Roles assigned to the subject',
  email_verified: 'Whether email has been verified',
  preferred_username: 'Preferred username',
};

function base64UrlDecode(str) {
  let s = str.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return atob(s);
}

function decodeJwt(token) {
  const parts = token.trim().split('.');
  if (parts.length !== 3) throw new Error('Token must have 3 parts (header.payload.signature)');
  const header = JSON.parse(base64UrlDecode(parts[0]));
  const payload = JSON.parse(base64UrlDecode(parts[1]));
  return { header, payload, signature: parts[2], parts };
}

function formatDuration(secs) {
  if (secs < 60) return `${secs}s`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`;
  return `${Math.floor(secs / 86400)}d ${Math.floor((secs % 86400) / 3600)}h`;
}

function analyzeSecurity(decoded) {
  const findings = [];
  const { header, payload } = decoded;
  const now = Math.floor(Date.now() / 1000);

  if (header.alg === 'none') {
    findings.push({ severity: 'critical', title: 'Algorithm "none"', text: 'Token uses no signature — anyone can forge it. Reject immediately.' });
  } else if (header.alg && /HS\d+/.test(header.alg)) {
    findings.push({ severity: 'low', title: `Symmetric algorithm: ${header.alg}`, text: 'HMAC requires sharing the secret with verifiers — keep it well-protected.' });
  } else if (header.alg && /RS\d+|ES\d+|PS\d+/.test(header.alg)) {
    findings.push({ severity: 'good', title: `Asymmetric algorithm: ${header.alg}`, text: 'Asymmetric signing is recommended for distributed verification.' });
  }

  if (payload.exp) {
    const diff = payload.exp - now;
    if (diff <= 0) findings.push({ severity: 'high', title: 'Token expired', text: `Expired ${Math.abs(diff)} second(s) ago.` });
    else findings.push({ severity: 'good', title: 'Token currently valid', text: `Expires in ${formatDuration(diff)}.` });
    const lifetime = payload.exp - (payload.iat || payload.nbf || now);
    if (lifetime > 60 * 60 * 24 * 30) findings.push({ severity: 'medium', title: 'Long-lived token', text: `Lifetime ${formatDuration(lifetime)} — consider shorter-lived tokens with refresh.` });
  } else {
    findings.push({ severity: 'medium', title: 'No "exp" claim', text: 'Token does not expire — replay risk if leaked.' });
  }

  if (!payload.iat) findings.push({ severity: 'low', title: 'No "iat" claim', text: 'Cannot determine token age.' });
  if (!payload.iss) findings.push({ severity: 'low', title: 'No "iss" claim', text: 'Issuer not declared.' });
  if (!payload.aud) findings.push({ severity: 'low', title: 'No "aud" claim', text: 'Audience not restricted — token could be replayed against multiple services.' });
  if (!payload.jti) findings.push({ severity: 'info', title: 'No "jti" claim', text: 'No unique ID — replay-resistance relies on expiration only.' });
  if (header.kid) findings.push({ severity: 'good', title: '"kid" provided', text: 'Header includes Key ID for key rotation.' });

  return findings;
}

const SEV_COLORS = {
  critical: { border: 'border-l-red-500',     text: 'text-red-500' },
  high:     { border: 'border-l-orange-500',  text: 'text-orange-500' },
  medium:   { border: 'border-l-amber-500',   text: 'text-amber-500' },
  low:      { border: 'border-l-yellow-500',  text: 'text-yellow-500' },
  info:     { border: 'border-l-brand-500',   text: 'text-brand-500' },
  good:     { border: 'border-l-emerald-500', text: 'text-emerald-500' },
};

export default function JwtAnalyzer() {
  const [jwt, setJwt] = useState('');

  const decoded = useMemo(() => {
    if (!jwt.trim()) return null;
    try { return decodeJwt(jwt); } catch (e) { return { error: e.message }; }
  }, [jwt]);

  const findings = decoded && !decoded.error ? analyzeSecurity(decoded) : [];

  const copyClaim = (val) => {
    navigator.clipboard.writeText(typeof val === 'object' ? JSON.stringify(val) : String(val));
    toast.success('Copied');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm">
          <HiOutlineLockClosed className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>JWT Analyzer</h1>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Decode, validate, and audit JWTs for security issues — all done locally in your browser
          </p>
        </div>
      </div>

      <div className="glass-card p-6 space-y-3">
        <textarea
          value={jwt}
          onChange={(e) => setJwt(e.target.value)}
          placeholder="Paste your JWT here (header.payload.signature)…"
          className="input-field min-h-[120px] font-mono text-xs"
        />
        {decoded?.error && (
          <div className="flex items-center gap-2 text-xs text-red-500">
            <HiOutlineExclamationCircle className="w-4 h-4" /> {decoded.error}
          </div>
        )}
      </div>

      {decoded && !decoded.error && (
        <div className="space-y-5 animate-slide-up">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <HiOutlineShieldCheck className="w-5 h-5 text-brand-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>Security Audit</h3>
              <span className="ml-auto text-[10px] font-mono opacity-50">{findings.length} finding(s)</span>
            </div>
            <div className="space-y-2">
              {findings.map((f, i) => {
                const c = SEV_COLORS[f.severity] || { border: 'border-l-brand-500', text: 'text-brand-500' };
                return (
                  <div key={i} className={`p-3 border-l-4 rounded bg-surface-50 dark:bg-black/30 ${c.border}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>{f.title}</p>
                      <span className={`text-[9px] uppercase font-bold ${c.text}`}>{f.severity}</span>
                    </div>
                    <p className="text-[11px] opacity-70">{f.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Section title="Header" icon="📜" color="brand" data={decoded.header} copyClaim={copyClaim} />
            <Section title="Payload (Claims)" icon="🧾" color="purple" data={decoded.payload} copyClaim={copyClaim} />
          </div>

          <div className="glass-card p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text)' }}>Signature</h3>
            <pre className="p-3 rounded bg-surface-100 dark:bg-black/40 text-[10px] font-mono break-all overflow-auto">{decoded.signature}</pre>
            <p className="mt-2 text-[10px] opacity-50">
              <HiOutlineShieldExclamation className="w-3 h-3 inline mr-1" />
              Signature verification requires the secret/public key. This tool does not transmit your token anywhere.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, icon, color, data, copyClaim }) {
  const borderClass = color === 'brand' ? 'border-l-brand-500' : 'border-l-purple-500';
  return (
    <div className={`glass-card p-5 border-l-4 ${borderClass}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{icon}</span>
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>{title}</h3>
      </div>
      <div className="space-y-1.5">
        {Object.entries(data).map(([k, v]) => {
          const desc = CLAIM_GLOSSARY[k];
          const isTimestamp = ['exp', 'nbf', 'iat'].includes(k) && typeof v === 'number';
          return (
            <div key={k} className="group p-2 rounded bg-surface-50 dark:bg-black/20 hover:bg-surface-100 dark:hover:bg-black/40 transition">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono font-bold text-brand-500">{k}</span>
                <button onClick={() => copyClaim(v)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700">
                  <HiOutlineClipboardCopy className="w-3.5 h-3.5 opacity-60" />
                </button>
              </div>
              <p className="text-[11px] font-mono break-all" style={{ color: 'var(--color-text)' }}>
                {typeof v === 'object' ? JSON.stringify(v) : String(v)}
              </p>
              {isTimestamp && (
                <p className="text-[9px] opacity-50 flex items-center gap-1 mt-1">
                  <HiOutlineClock className="w-3 h-3" /> {new Date(v * 1000).toLocaleString()}
                </p>
              )}
              {desc && <p className="text-[9px] opacity-50 mt-1">{desc}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
