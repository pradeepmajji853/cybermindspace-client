import { Link } from 'react-router-dom';
import { HiOutlineLockClosed, HiOutlineLightningBolt } from 'react-icons/hi';

/**
 * Wraps either teaser content (blurred) or a CTA tile.
 * Use `count` to advertise how many extra results are hidden.
 */
export default function LockedSection({
  title = 'Locked for Free Plan',
  count,
  description,
  children,
  ctaLabel = 'Unlock with Pro — ₹499/mo',
  variant = 'overlay',
}) {
  if (variant === 'tile') {
    return (
      <div className="relative glass-card p-6 border border-dashed border-brand-500/30 bg-brand-500/[0.03]">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm flex-shrink-0">
            <HiOutlineLockClosed className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-100">{title}</h4>
            {count != null && (
              <p className="text-xs text-brand-400 font-semibold mt-0.5">
                +{count} more {count === 1 ? 'result' : 'results'} available
              </p>
            )}
            {description && (
              <p className="text-xs text-slate-400 leading-relaxed mt-2">{description}</p>
            )}
            <Link to="/billing" className="btn-primary text-[11px] py-2 px-3 mt-3 inline-flex">
              <HiOutlineLightningBolt className="w-3.5 h-3.5" />
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Overlay variant — children rendered behind a blur+CTA
  return (
    <div className="relative">
      <div className="select-none pointer-events-none filter blur-[6px] opacity-60">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="glass-card p-5 max-w-xs text-center bg-surface/95 backdrop-blur-md border-brand-500/30 shadow-glow">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand mx-auto mb-3 flex items-center justify-center shadow-glow-sm">
            <HiOutlineLockClosed className="w-4 h-4 text-white" />
          </div>
          <h4 className="text-sm font-bold text-slate-100 mb-1">{title}</h4>
          {count != null && (
            <p className="text-xs text-brand-400 font-semibold mb-2">
              {count} hidden {count === 1 ? 'result' : 'results'}
            </p>
          )}
          {description && (
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{description}</p>
          )}
          <Link to="/billing" className="btn-primary text-[11px] py-2 px-3 w-full justify-center">
            <HiOutlineLightningBolt className="w-3.5 h-3.5" />
            {ctaLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
