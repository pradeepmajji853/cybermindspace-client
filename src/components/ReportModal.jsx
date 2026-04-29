import { useState } from 'react';
import {
  HiOutlineX,
  HiOutlineClipboardCopy,
  HiOutlineDownload,
  HiOutlineCheck,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function ReportModal({ report, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!report) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(report.markdown);
      setCopied(true);
      toast.success('Report copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      toast.error('Copy failed');
    }
  };

  const downloadMarkdown = () => {
    const safeName = report.title.replace(/[^a-z0-9]/gi, '_').slice(0, 60).toLowerCase();
    const blob = new Blob([report.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${safeName}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success('Markdown downloaded');
  };

  const sevColor = ({
    Critical: 'bg-red-500/15 text-red-400 border-red-500/30',
    High: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Low: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    Informational: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  })[report.severity] || 'bg-slate-500/15 text-slate-400 border-slate-500/30';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-card max-w-3xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-800/40">
          <div className="min-w-0 flex-1 pr-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${sevColor}`}>
                {report.severity?.toUpperCase()} · {report.priority}
              </span>
              <span className="text-[10px] text-slate-500">CVSS {report.cvssBand}</span>
            </div>
            <h2 className="text-base font-bold text-slate-100 leading-snug">{report.title}</h2>
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              {report.target} → <span className="font-mono">{report.asset}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800/40 transition flex-shrink-0"
            aria-label="Close"
          >
            <HiOutlineX className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <Section title="Summary">
            <p className="text-[13px] text-slate-300 leading-relaxed">{report.summary}</p>
          </Section>

          <Section title="Steps to Reproduce">
            <pre className="text-[11px] font-mono text-slate-300 bg-slate-900/40 p-3 rounded-lg border border-slate-800/40 whitespace-pre-wrap">
              {report.steps}
            </pre>
          </Section>

          <Section title="Proof of Concept">
            {report.proof?.request && (
              <ProofBlock label="Request" content={report.proof.request} />
            )}
            {report.proof?.response && (
              <ProofBlock label="Response" content={report.proof.response} />
            )}
            {report.proof?.secrets?.length > 0 && (
              <div className="mt-2 p-3 rounded-lg bg-red-500/5 border border-red-500/30">
                <p className="text-[10px] uppercase tracking-widest font-bold text-red-400 mb-2">
                  Secret patterns detected (redacted)
                </p>
                <ul className="space-y-1">
                  {report.proof.secrets.map((s, i) => (
                    <li key={i} className="text-[11px] font-mono text-red-300">
                      <span className="text-slate-400">{s.kind}:</span> {s.redacted}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Section>

          <Section title="Impact">
            <div className="text-[13px] text-slate-300 leading-relaxed whitespace-pre-line">
              {report.impact}
            </div>
          </Section>

          <Section title="Recommended Fix">
            <p className="text-[13px] text-slate-300 leading-relaxed">{report.remediation}</p>
          </Section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 p-4 border-t border-slate-800/40">
          <p className="text-[10px] text-slate-500">
            Captured live · no fabricated evidence
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadMarkdown}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <HiOutlineDownload className="w-4 h-4" />
              .md
            </button>
            <button
              onClick={copy}
              className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5"
            >
              {copied ? <HiOutlineCheck className="w-4 h-4" /> : <HiOutlineClipboardCopy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy Markdown'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-[10px] uppercase tracking-widest font-bold text-brand-400 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function ProofBlock({ label, content }) {
  return (
    <div className="mb-2">
      <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-500 mb-1">{label}</p>
      <pre className="text-[11px] font-mono text-slate-300 bg-slate-900/40 p-3 rounded-lg border border-slate-800/40 whitespace-pre-wrap break-all">
        {content}
      </pre>
    </div>
  );
}
