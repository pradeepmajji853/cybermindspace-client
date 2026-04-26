import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import SearchBar from '../components/SearchBar';
import ResultCard, { KVRow } from '../components/ResultCard';
import RiskBadge from '../components/RiskBadge';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { HiOutlineBookmark, HiOutlineDocumentDownload, HiOutlineShieldCheck, HiOutlineLightningBolt, HiOutlineGlobeAlt, HiOutlineServer, HiOutlineShieldExclamation } from 'react-icons/hi';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function OsintTool() {
  const { userProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const toolType = searchParams.get('type') || 'osint';
  
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  const plan = userProfile?.plan || 'free';
  const isPaid = plan === 'pro' || plan === 'elite';

  const placeholders = {
    osint: 'Enter email, domain, IP, or username...',
    port: 'Enter domain or IP to scan ports...',
    vuln: 'Enter URL to scan for vulnerabilities...',
    phishing: 'Enter URL to check for phishing traits...',
  };

  const handleSearch = async (query) => {
    setLoading(true);
    setError('');
    setReport(null);
    try {
      const { data } = await client.post('/osint/investigate', { query, inputType: toolType });
      setReport(data);
      toast.success('Investigation complete');
    } catch (err) {
      const msg = err.response?.data?.error || 'Investigation failed';
      const code = err.response?.data?.code;
      setError(msg);
      if (code === 'LIMIT_REACHED') {
        toast.error('Daily limit reached — upgrade to Pro for unlimited scans!');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!report) return;
    try {
      const { data } = await client.patch(`/osint/${report.id}/save`);
      setReport({ ...report, saved: data.saved });
      toast.success(data.saved ? 'Report saved' : 'Report unsaved');
    } catch (e) {
      toast.error('Failed to save');
    }
  };

  const handlePDF = async () => {
    if (!report) return;
    if (!isPaid) {
      toast.error('PDF export requires Pro plan');
      return;
    }
    
    const loadingToast = toast.loading('Generating PDF report...');
    try {
      const response = await client.get(`/reports/${report.id}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CyberMindSpace_Report_${report.query.replace(/[^a-z0-9]/gi, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded', { id: loadingToast });
    } catch (err) {
      console.error('PDF download failed:', err);
      toast.error('Failed to download report', { id: loadingToast });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm">
            {toolType === 'port' ? <HiOutlineServer className="w-6 h-6 text-white" /> :
             toolType === 'vuln' ? <HiOutlineShieldExclamation className="w-6 h-6 text-white" /> :
             toolType === 'phishing' ? <HiOutlineGlobeAlt className="w-6 h-6 text-white" /> :
             <HiOutlineShieldCheck className="w-6 h-6 text-white" />}
          </div>
          <div>
            <h1 className="text-xl font-bold capitalize" style={{ color: 'var(--color-text)' }}>
              {toolType === 'osint' ? 'Intelligence Hub' : `${toolType} Scanner`}
            </h1>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {placeholders[toolType]}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <SearchBar onSearch={handleSearch} loading={loading} placeholder={placeholders[toolType]} />

      {/* Error */}
      {error && (
        <div className="glass-card p-5 border-l-4 border-l-red-500 animate-slide-up">
          <p className="text-sm font-medium text-red-500 dark:text-red-400">{error}</p>
          {error.includes('limit') && (
            <Link to="/billing" className="btn-primary mt-3 text-xs py-2 px-4 inline-flex">
              <HiOutlineLightningBolt className="w-4 h-4" />
              Upgrade to Pro
            </Link>
          )}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {/* Results */}
      {report && (
        <div className="space-y-5 animate-slide-up">
          {/* Report header */}
          <div className="glass-card p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Intelligence Report</span>
                  <span className={`badge ${
                    report.inputType === 'email' ? 'badge-blue' :
                    report.inputType === 'ip' ? 'badge-purple' :
                    report.inputType === 'domain' ? 'badge-green' : 'badge-yellow'
                  }`}>
                    {report.inputType}
                  </span>
                </div>
                <p className="font-mono text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{report.query}</p>
              </div>
              <div className="flex items-center gap-3">
                <RiskBadge score={report.riskScore} />
                <button onClick={handleSave} className="btn-ghost text-xs">
                  <HiOutlineBookmark className={`w-4 h-4 ${report.saved ? 'fill-current text-brand-500' : ''}`} />
                  {report.saved ? 'Saved' : 'Save'}
                </button>
                <button onClick={handlePDF} className={`btn-ghost text-xs ${!isPaid ? 'opacity-50' : ''}`}>
                  <HiOutlineDocumentDownload className="w-4 h-4" />
                  PDF {!isPaid && '🔒'}
                </button>
              </div>
            </div>
          </div>

          {/* Risk Indicators */}
          {report.riskIndicators?.length > 0 && (
            <div className="glass-card p-6 border-l-4 border-l-red-500 space-y-4">
              <div className="flex items-center gap-2">
                <HiOutlineShieldExclamation className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider">Detailed Security Analysis</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase opacity-50 tracking-widest">Identified Threats</p>
                  <div className="space-y-2">
                    {report.riskIndicators.map((ind, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text)' }}>
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                        <span>{ind}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                  <p className="text-xs font-bold uppercase text-red-600 dark:text-red-400 tracking-widest">Expert Recommendation</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
                    {report.riskScore > 70 ? 
                      "CRITICAL: The target shows multiple high-risk indicators. Exposed management ports or critical vulnerabilities detected. Immediate isolation and remediation recommended." :
                      report.riskScore > 40 ?
                      "WARNING: Significant attack surface detected. Found multiple missing security headers or historical snapshots containing potential secrets. Review configuration immediately." :
                      report.riskScore > 20 ?
                      "NOTICE: Moderate exposure. Ensure all security headers are implemented and services are patched." :
                      "CLEAN: Low risk profile. Maintain periodic monitoring."
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Module Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {report.results.email && <EmailCard data={report.results.email} />}
            {report.results.domain && <DomainCard data={report.results.domain} />}
            {report.results.ip && <IpCard data={report.results.ip} />}
            {report.results.port && <PortCard data={report.results.port} />}
            {report.results.vuln && <VulnCard data={report.results.vuln} />}
            {report.results.phishing && <PhishingCard data={report.results.phishing} />}
            {report.results.takeover && <TakeoverCard data={report.results.takeover} />}
            {report.results.whoisPrivacy && <WhoisCard data={report.results.whoisPrivacy} />}
            {report.results.techStack?.technologies?.length > 0 && <TechCard data={report.results.techStack} />}
            {report.results.wayback?.snapshots?.length > 0 && <WaybackCard data={report.results.wayback} />}
            {report.results.username && <UsernameCard data={report.results.username} />}
          </div>

          {/* Remaining searches */}
          {report.searchesRemaining !== undefined && !isPaid && (
            <div className="text-center">
              <p className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                {report.searchesRemaining} free search{report.searchesRemaining !== 1 ? 'es' : ''} remaining today
              </p>
            </div>
          )}

          {/* Truncation Banner for Free Users */}
          {report.truncated && (
            <div className="glass-card overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/90 dark:to-black/90 z-10 pointer-events-none" />
              <div className="p-6 opacity-30 blur-[2px]">
                <div className="grid grid-cols-3 gap-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-12 rounded-xl bg-surface-200 dark:bg-surface-800" />
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3">
                <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                  {Object.values(report.truncationMeta || {}).reduce((a, b) => a + (b || 0), 0) - Object.keys(report.truncationMeta || {}).length * 2} more results hidden
                </p>
                <Link to="/billing" className="btn-primary py-2 px-6 text-xs shadow-glow flex items-center gap-2">
                  <HiOutlineLightningBolt className="w-4 h-4" /> Unlock Full Results
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =================== Premium Result Cards =================== */

const SEV_DOT = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-amber-500',
  low: 'bg-yellow-500',
  info: 'bg-brand-500',
  good: 'bg-emerald-500',
};

function GradeBadge({ grade, score }) {
  const colors = {
    A: 'bg-emerald-500/15 text-emerald-500',
    B: 'bg-brand-500/15 text-brand-500',
    C: 'bg-amber-500/15 text-amber-500',
    D: 'bg-orange-500/15 text-orange-500',
    F: 'bg-red-500/15 text-red-500',
  };
  return (
    <div className={`px-2 py-1 rounded font-bold ${colors[grade] || 'bg-surface-200'}`}>
      <span className="text-base">{grade}</span>
      {score !== undefined && <span className="text-[9px] ml-1 opacity-70">{score}</span>}
    </div>
  );
}

function CardShell({ title, icon, status = 'success', right, children }) {
  const border = status === 'danger' ? 'border-l-red-500' : status === 'warn' ? 'border-l-amber-500' : 'border-l-emerald-500';
  return (
    <div className={`glass-card overflow-hidden border-l-4 ${border}`}>
      <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <h3 className="text-sm font-bold tracking-wide" style={{ color: 'var(--color-text)' }}>{title}</h3>
        </div>
        {right}
      </div>
      <div className="px-5 py-4 space-y-2">{children}</div>
    </div>
  );
}

function EmailCard({ data }) {
  const status = data.breachCount > 0 || data.securityScore < 60 ? 'danger' : 'success';
  return (
    <CardShell title="Email Intelligence" icon="📧" status={status} right={<GradeBadge grade={data.grade} score={data.securityScore} />}>
      <div className="flex items-center gap-3 mb-2">
        {data.gravatar?.exists && <img src={data.gravatar.avatarUrl} alt="" className="w-10 h-10 rounded-full border border-brand-500/30" />}
        <div>
          <p className="text-xs font-mono font-bold" style={{ color: 'var(--color-text)' }}>{data.email}</p>
          <p className="text-[10px] opacity-60">{data.provider} • {data.type} • {data.format}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-[10px]">
        <Pill label="Breaches" value={data.breachCount} bad={data.breachCount > 0} />
        <Pill label="Disposable" value={data.disposable ? 'Yes' : 'No'} bad={data.disposable} />
        <Pill label="Deliverable" value={data.deliverable ? 'Yes' : 'No'} bad={!data.deliverable} />
      </div>
      <div className="grid grid-cols-2 gap-1 text-[10px] mt-2">
        <AuthMini label="SPF"     ok={!!data.spf} />
        <AuthMini label="DMARC"   ok={!!data.dmarc} />
        <AuthMini label="DKIM"    ok={data.dkim?.length > 0} />
        <AuthMini label="MTA-STS" ok={!!data.mtaSts} />
      </div>
      {data.issues?.length > 0 && (
        <div className="mt-3 p-2 rounded border border-red-500/20 bg-red-500/5">
          <p className="text-[9px] font-bold text-red-500 mb-1 uppercase tracking-widest">Issues</p>
          <ul className="space-y-1 text-[10px]">
            {data.issues.slice(0, 5).map((i, idx) => (
              <li key={idx} className="flex items-start gap-2"><span className={`mt-1.5 w-1 h-1 rounded-full ${SEV_DOT[i.severity] || 'bg-red-500'}`} />{typeof i === 'object' ? i.text : i}</li>
            ))}
          </ul>
        </div>
      )}
    </CardShell>
  );
}

function DomainCard({ data }) {
  const status = data.healthScore < 60 ? 'danger' : data.healthScore < 80 ? 'warn' : 'success';
  return (
    <CardShell title="Domain Intelligence" icon="🔗" status={status} right={<GradeBadge grade={data.healthGrade} score={data.healthScore} />}>
      <KVRow label="Domain" value={data.domain} highlight />
      {data.whois && (
        <>
          <KVRow label="Registrar" value={data.whois.registrar} />
          <KVRow label="Created" value={data.whois.creationDate} />
          <KVRow label="Expires" value={data.whois.expirationDate} />
        </>
      )}
      {data.tls?.cert && (
        <>
          <KVRow label="TLS Issuer"  value={data.tls.cert.issuer} />
          <KVRow label="TLS Expires" value={data.tls.cert.daysToExpiry !== null ? `${data.tls.cert.daysToExpiry} days` : '—'} highlight={data.tls.cert.daysToExpiry !== null && data.tls.cert.daysToExpiry < 30} />
          <KVRow label="Protocol"    value={data.tls.protocol} />
        </>
      )}
      <KVRow label="DNSSEC" value={data.dnssec?.enabled ? 'Validated ✓' : data.dnssec?.enabled === false ? 'Not enabled' : '—'} highlight={data.dnssec?.enabled === false} />
      <KVRow label="A"     value={data.dns?.a?.join(', ')} />
      <KVRow label="NS"    value={data.dns?.ns?.slice(0, 2).join(', ')} />
      <KVRow label="CAA"   value={data.dns?.caa?.length ? `${data.dns.caa.length} record(s)` : 'None'} />
      {data.techStack?.length > 0 && <KVRow label="Tech" value={data.techStack.join(', ')} />}

      {data.findings?.length > 0 && (
        <div className="mt-3 space-y-1 text-[10px]">
          {data.findings.slice(0, 5).map((f, i) => (
            <div key={i} className="flex items-start gap-2"><span className={`mt-1.5 w-1 h-1 rounded-full ${SEV_DOT[f.severity] || 'bg-amber-500'}`} />{f.text}</div>
          ))}
        </div>
      )}
    </CardShell>
  );
}

function IpCard({ data }) {
  const level = data.threatLevel || 'clean';
  const status = level === 'critical' || level === 'high' ? 'danger' : level === 'medium' ? 'warn' : 'success';
  return (
    <CardShell title="IP Intelligence" icon="🌐" status={status} right={
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
        level === 'critical' ? 'bg-red-500/15 text-red-500' :
        level === 'high' ? 'bg-orange-500/15 text-orange-500' :
        level === 'medium' ? 'bg-amber-500/15 text-amber-500' :
        level === 'low' ? 'bg-yellow-500/15 text-yellow-500' :
        'bg-emerald-500/15 text-emerald-500'
      }`}>
        {level} • {data.threatScore}
      </span>
    }>
      <KVRow label="IP" value={data.ip} highlight />
      <KVRow label="Location" value={[data.geo?.city, data.geo?.region, data.geo?.country].filter(Boolean).join(', ')} />
      <KVRow label="ASN" value={data.asn} />
      <KVRow label="ISP" value={data.isp} />
      <div className="flex flex-wrap gap-1 mt-2">
        {data.tor && <Tag color="red">Tor exit</Tag>}
        {data.proxy && <Tag color="orange">Proxy/VPN</Tag>}
        {data.hosting && <Tag color="amber">Datacenter</Tag>}
        {data.mobile && <Tag color="brand">Mobile</Tag>}
        {!data.tor && !data.proxy && !data.hosting && <Tag color="emerald">Residential</Tag>}
      </div>
      {data.dnsbl?.listed?.length > 0 && (
        <div className="mt-3 p-2 rounded border border-red-500/20 bg-red-500/5">
          <p className="text-[9px] font-bold text-red-500 mb-1 uppercase tracking-widest">Blocklists ({data.dnsbl.listed.length}/{data.dnsbl.checked})</p>
          <div className="flex flex-wrap gap-1">
            {data.dnsbl.listed.map((b, i) => <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/15 text-red-500">{b.name}</span>)}
          </div>
        </div>
      )}
      {data.reverseDns?.length > 0 && <p className="text-[10px] opacity-60">↳ {data.reverseDns.join(', ')}</p>}
    </CardShell>
  );
}

function PortCard({ data }) {
  const open = data.ports?.filter(p => p.status === 'open') || [];
  const status = data.summary?.posture === 'critical' || data.summary?.posture === 'poor' ? 'danger' : data.summary?.posture === 'fair' ? 'warn' : 'success';
  return (
    <CardShell title="Port & Service Scan" icon="📡" status={status} right={
      <span className="text-[10px] font-mono opacity-70">
        {data.summary?.open || open.length} open • {data.summary?.total || data.ports?.length} probed
      </span>
    }>
      <KVRow label="Host" value={`${data.host} (${data.resolvedIp || ''})`} highlight />
      {open.length === 0 && <p className="text-[11px] opacity-60">No open ports detected on common ranges.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
        {open.map(p => (
          <div key={p.port} className={`p-2 rounded border text-[10px] ${
            p.risk === 'critical' ? 'bg-red-500/10 border-red-500/30' :
            p.risk === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
            p.risk === 'medium' ? 'bg-amber-500/10 border-amber-500/30' :
            'bg-emerald-500/5 border-emerald-500/20'
          }`}>
            <div className="flex justify-between items-center">
              <span className="font-mono font-bold">{p.port} / {p.service}</span>
              <span className={`text-[9px] uppercase font-bold ${
                p.risk === 'critical' ? 'text-red-500' :
                p.risk === 'high' ? 'text-orange-500' :
                p.risk === 'medium' ? 'text-amber-500' : 'text-emerald-500'
              }`}>{p.risk}</span>
            </div>
            {p.fingerprint && <p className="text-[9px] opacity-70 mt-1">{p.fingerprint.product}{p.fingerprint.version ? ` ${p.fingerprint.version}` : ''}</p>}
            {p.banner && !p.fingerprint && <p className="text-[9px] font-mono truncate opacity-50 mt-1" title={p.banner}>{p.banner}</p>}
            {p.tls?.cert && <p className="text-[9px] opacity-50 mt-1">TLS: {p.tls.protocol} • {p.tls.cert.issuer}</p>}
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function VulnCard({ data }) {
  if (data.error) return <CardShell title="Web Vulnerability Scan" icon="🛡" status="warn"><p className="text-[11px] opacity-60">{data.error}</p></CardShell>;
  const status = data.summary?.critical > 0 ? 'danger' : data.summary?.high > 0 ? 'warn' : 'success';
  const findings = data.vulnerabilities?.filter(v => v.status === 'vulnerable') || [];
  return (
    <CardShell title="Web Vulnerability Scan" icon="🛡" status={status} right={<GradeBadge grade={data.grade} score={data.score} />}>
      <KVRow label="Target" value={data.url} highlight />
      <KVRow label="Server" value={data.server} />
      <div className="grid grid-cols-4 gap-1 mt-2 text-[10px]">
        <Sev count={data.summary?.critical} sev="critical" />
        <Sev count={data.summary?.high}     sev="high" />
        <Sev count={data.summary?.medium}   sev="medium" />
        <Sev count={data.summary?.low}      sev="low" />
      </div>
      <div className="space-y-1.5 mt-3 max-h-72 overflow-y-auto">
        {findings.slice(0, 12).map((v, i) => (
          <div key={i} className="p-2 rounded bg-surface-50 dark:bg-black/20 border border-border/40">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold" style={{ color: 'var(--color-text)' }}>{v.name}</p>
              <span className={`text-[9px] uppercase font-bold ${
                v.severity === 'critical' ? 'text-red-500' :
                v.severity === 'high' ? 'text-orange-500' :
                v.severity === 'medium' ? 'text-amber-500' : 'text-yellow-500'
              }`}>{v.severity}</span>
            </div>
            <p className="text-[10px] opacity-60 leading-relaxed">{v.description}</p>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function PhishingCard({ data }) {
  const lvl = data.threatLevel || 'clean';
  const status = lvl === 'critical' || lvl === 'high' ? 'danger' : lvl === 'medium' ? 'warn' : 'success';
  return (
    <CardShell title="Phishing Analysis" icon="🎣" status={status} right={
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
        lvl === 'critical' ? 'bg-red-500/15 text-red-500' :
        lvl === 'high' ? 'bg-orange-500/15 text-orange-500' :
        lvl === 'medium' ? 'bg-amber-500/15 text-amber-500' : 'bg-emerald-500/15 text-emerald-500'
      }`}>
        {lvl} • {data.threatScore}
      </span>
    }>
      <KVRow label="URL" value={data.url} highlight />
      {data.intel?.urlScan?.scanId && (
        <a href={`https://urlscan.io/result/${data.intel.urlScan.scanId}`} target="_blank" rel="noreferrer"
           className="text-[10px] text-brand-500 hover:underline block">View urlscan.io report →</a>
      )}
      <div className="space-y-1 mt-2">
        {data.reasons.slice(0, 8).map((r, i) => (
          <div key={i} className="flex items-start gap-2 text-[11px]">
            <span className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 ${SEV_DOT[r.severity] || 'bg-amber-500'}`} />
            <span style={{ color: 'var(--color-text)' }}>{typeof r === 'string' ? r : r.text}</span>
          </div>
        ))}
      </div>
      {data.sources?.length > 0 && <p className="text-[9px] opacity-50 mt-2 font-mono">Sources: {data.sources.join(', ')}</p>}
    </CardShell>
  );
}

function TakeoverCard({ data }) {
  const status = data.status === 'vulnerable' ? 'danger' : data.status === 'investigate' ? 'warn' : 'success';
  return (
    <CardShell title="Subdomain Takeover" icon="☠️" status={status}>
      <KVRow label="Target" value={data.domain} highlight />
      <KVRow label="Status" value={(data.status || '').toUpperCase()} highlight={data.status === 'vulnerable'} />
      {data.cname && <KVRow label="CNAME" value={data.cname} />}
      {data.provider && <KVRow label="Provider" value={data.provider} />}
      {data.matchedFingerprint && <KVRow label="Matched" value={`"${data.matchedFingerprint.substring(0, 60)}…"`} />}
      <div className={`mt-3 p-2 rounded text-[10px] font-medium border ${
        data.status === 'vulnerable' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
        data.status === 'investigate' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
        'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      }`}>{data.message}</div>
    </CardShell>
  );
}

function WhoisCard({ data }) {
  const status = data.opsecScore < 50 ? 'danger' : data.opsecScore < 80 ? 'warn' : 'success';
  return (
    <CardShell title="WHOIS Privacy Audit" icon="🕵️" status={status} right={<GradeBadge grade={data.grade} score={data.opsecScore} />}>
      <KVRow label="Domain" value={data.domain} highlight />
      <KVRow label="Registrar" value={data.registrar} />
      {data.exposures?.length > 0 && (
        <div className="mt-2 p-2 rounded border border-red-500/20 bg-red-500/5">
          <p className="text-[9px] font-bold text-red-500 mb-1 uppercase tracking-widest">Exposed Fields</p>
          {data.exposures.map((e, i) => (
            <div key={i} className="text-[10px]">
              <span className="font-bold text-red-500">{e.field}</span>
              {e.hint && <span className="opacity-50"> — {e.hint}</span>}
            </div>
          ))}
        </div>
      )}
      {data.privacyServices?.length > 0 && (
        <div className="mt-2 p-2 rounded border border-emerald-500/20 bg-emerald-500/5">
          <p className="text-[9px] font-bold text-emerald-500 mb-1 uppercase tracking-widest">Privacy Services</p>
          {data.privacyServices.map((p, i) => <p key={i} className="text-[10px]">{p}</p>)}
        </div>
      )}
      <p className="text-[10px] opacity-60 mt-2">{data.message}</p>
    </CardShell>
  );
}

function TechCard({ data }) {
  return (
    <CardShell title="Tech Stack Fingerprint" icon="💻" status="success" right={<span className="text-[10px] opacity-60 font-mono">{data.count} found</span>}>
      <div className="space-y-2">
        {Object.entries(data.grouped || {}).map(([cat, list]) => (
          <div key={cat}>
            <p className="text-[9px] font-bold uppercase tracking-widest opacity-50 mb-1">{cat}</p>
            <div className="flex flex-wrap gap-1.5">
              {list.map((t, i) => (
                <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/10 text-brand-500 border border-brand-500/20">
                  {t.name}{t.version ? ` ${t.version}` : ''}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function WaybackCard({ data }) {
  const years = Object.entries(data.perYear || {}).sort();
  const max = Math.max(1, ...years.map(([, c]) => c));
  return (
    <CardShell title="Wayback Machine Intel" icon="⏳" status="success" right={<span className="text-[10px] font-mono opacity-60">{data.count} snapshots</span>}>
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <KVRow label="First Seen" value={data.firstSeen} />
        <KVRow label="Last Seen" value={data.lastSeen} />
      </div>
      {years.length > 0 && (
        <div className="mt-3">
          <p className="text-[9px] font-bold uppercase tracking-widest opacity-50 mb-2">Timeline</p>
          <div className="flex items-end gap-0.5 h-12">
            {years.map(([y, c]) => (
              <div key={y} className="flex-1 flex flex-col items-center justify-end" title={`${y}: ${c}`}>
                <div className="w-full bg-brand-500/60 hover:bg-brand-500 transition-colors rounded-sm" style={{ height: `${(c / max) * 100}%` }} />
                <span className="text-[7px] opacity-50 mt-0.5">{String(y).slice(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {data.interesting?.length > 0 && (
        <div className="mt-3 p-2 rounded border border-amber-500/20 bg-amber-500/5">
          <p className="text-[9px] font-bold text-amber-500 mb-1 uppercase tracking-widest">⚠ Interesting Files</p>
          <div className="space-y-0.5 max-h-32 overflow-y-auto">
            {data.interesting.slice(0, 8).map((s, i) => (
              <a key={i} href={s.viewUrl} target="_blank" rel="noreferrer" className="block text-[10px] font-mono truncate text-amber-600 hover:underline">{s.url}</a>
            ))}
          </div>
        </div>
      )}
    </CardShell>
  );
}

function UsernameCard({ data }) {
  return (
    <CardShell title="Username OSINT" icon="🔍" status="success" right={<span className="text-[10px] opacity-60 font-mono">{data.foundCount}/{data.totalChecked} found</span>}>
      <KVRow label="Username" value={data.username} highlight />
      {data.githubProfile && (
        <div className="mt-2 p-2 rounded border border-border/40 bg-surface-50 dark:bg-black/20 flex items-center gap-3">
          <img src={data.githubProfile.avatarUrl} alt="" className="w-12 h-12 rounded-full" />
          <div className="text-[10px]">
            <p className="font-bold" style={{ color: 'var(--color-text)' }}>{data.githubProfile.name || data.username}</p>
            <p className="opacity-60">{data.githubProfile.bio?.substring(0, 80)}</p>
            <p className="opacity-50 mt-0.5">⭐ {data.githubProfile.followers} followers • {data.githubProfile.publicRepos} repos</p>
          </div>
        </div>
      )}
      <div className="mt-2 space-y-2">
        {Object.entries(data.grouped || {}).map(([cat, list]) => {
          const found = list.filter(p => p.found);
          if (found.length === 0) return null;
          return (
            <div key={cat}>
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-50 mb-1">{cat} ({found.length})</p>
              <div className="flex flex-wrap gap-1">
                {found.map(p => (
                  <a key={p.name} href={p.url} target="_blank" rel="noreferrer"
                     className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20">
                    {p.name}
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}

/* tiny helpers */
function Pill({ label, value, bad }) {
  return (
    <div className={`px-2 py-1 rounded text-center ${bad ? 'bg-red-500/10 text-red-500' : 'bg-surface-100 dark:bg-surface-800'}`}>
      <p className="text-[8px] uppercase tracking-widest opacity-60">{label}</p>
      <p className="text-[11px] font-bold font-mono">{value}</p>
    </div>
  );
}

function AuthMini({ label, ok }) {
  return (
    <div className={`px-2 py-1 rounded flex items-center justify-between ${ok ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
      <span className="font-bold uppercase">{label}</span>
      <span>{ok ? '✓' : '✕'}</span>
    </div>
  );
}

function Tag({ color, children }) {
  const map = {
    red: 'bg-red-500/15 text-red-500',
    orange: 'bg-orange-500/15 text-orange-500',
    amber: 'bg-amber-500/15 text-amber-500',
    emerald: 'bg-emerald-500/15 text-emerald-500',
    brand: 'bg-brand-500/15 text-brand-500',
  };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${map[color] || ''}`}>{children}</span>;
}

function Sev({ count, sev }) {
  const colors = {
    critical: 'bg-red-500/10 text-red-500 border-red-500/20',
    high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    low: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  };
  return (
    <div className={`p-1.5 rounded border text-center ${colors[sev]}`}>
      <p className="text-[8px] uppercase font-bold opacity-70">{sev}</p>
      <p className="text-sm font-bold">{count || 0}</p>
    </div>
  );
}
