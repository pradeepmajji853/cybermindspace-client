import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { HiOutlineSearch, HiOutlineDocumentReport, HiOutlineStar, HiOutlineLightningBolt, HiOutlineArrowRight, HiOutlineShieldCheck, HiOutlineCode, HiOutlineLockClosed } from 'react-icons/hi';

export default function Dashboard() {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({ totalSearches: 0, savedReports: 0, recentActivity: [] });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [historyRes, reportsRes] = await Promise.allSettled([
        client.get('/user/history?limit=5'),
        client.get('/user/reports'),
      ]);

      setStats({
        totalSearches: historyRes.status === 'fulfilled' ? historyRes.value.data.count : 0,
        savedReports: reportsRes.status === 'fulfilled' ? reportsRes.value.data.count : 0,
        recentActivity: historyRes.status === 'fulfilled' ? historyRes.value.data.history : [],
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const plan = userProfile?.plan || 'free';
  const isFree = plan === 'free';
  const dailyLimit = 5;
  const usedToday = userProfile?.searchesToday || 0;
  const usagePercent = Math.min(100, Math.round((usedToday / dailyLimit) * 100));

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Welcome banner */}
      <div className="glass-card overflow-hidden">
        <div className="relative p-6 lg:p-8">
          <div className="absolute inset-0 bg-gradient-brand opacity-5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                  Welcome back, <span className="text-gradient">{userProfile?.displayName || 'Agent'}</span>
                </h1>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Your cybersecurity command center is ready. Start investigating.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${plan === 'elite' ? 'badge-purple' : plan === 'pro' ? 'badge-blue' : 'badge-yellow'}`}>
                  {plan === 'elite' ? '🔥 Elite Plan' : plan === 'pro' ? '⭐ Pro Plan' : 'Free Plan'}
                </span>
                {isFree && (
                  <Link to="/billing" className="btn-primary text-xs py-2 px-4">
                    <HiOutlineLightningBolt className="w-4 h-4" />
                    Upgrade
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          icon={<HiOutlineSearch className="w-6 h-6" />}
          label="Investigations"
          value={stats.totalSearches}
          color="brand"
          loading={loadingStats}
        />
        <StatsCard
          icon={<HiOutlineDocumentReport className="w-6 h-6" />}
          label="Saved Reports"
          value={stats.savedReports}
          color="emerald"
          loading={loadingStats}
        />
        <StatsCard
          icon={<HiOutlineStar className="w-6 h-6" />}
          label="Searches Today"
          value={isFree ? `${usedToday}/${dailyLimit}` : `${usedToday}`}
          color="amber"
          loading={loadingStats}
        />
      </div>

      {/* Usage bar for free users */}
      {isFree && (
        <div className="glass-card p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HiOutlineLightningBolt className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>Daily Usage</span>
            </div>
            <span className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
              {usedToday} of {dailyLimit} scans used
            </span>
          </div>
          <div className="w-full h-2 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usagePercent >= 80 ? 'bg-red-500' : usagePercent >= 50 ? 'bg-amber-500' : 'bg-brand-500'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          {usagePercent >= 80 && (
            <p className="mt-2 text-[10px] text-amber-500 font-bold">
              Running low! <Link to="/billing" className="text-brand-500 underline">Upgrade to Pro</Link> for unlimited scans.
            </p>
          )}
        </div>
      )}

      {/* Quick access tools */}
      <div>
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text)' }}>Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/tools/osint" className="glass-card p-5 group hover:border-brand-500/30 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-shadow">
                  <HiOutlineShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--color-text)' }}>OSINT Investigation</h3>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    Email, domain, IP & username intelligence
                  </p>
                </div>
              </div>
              <HiOutlineArrowRight className="w-5 h-5 text-brand-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link to="/tools/xss" className="glass-card p-5 group hover:border-brand-500/30 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                  <HiOutlineCode className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--color-text)' }}>XSS Payloads</h3>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    200+ cross-site scripting payloads
                  </p>
                </div>
              </div>
              <HiOutlineArrowRight className="w-5 h-5 text-purple-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </div>
      </div>

      {/* Locked feature preview for free users */}
      {isFree && (
        <div className="glass-card overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/80 dark:to-black/80 z-10 pointer-events-none" />
          <div className="p-6 opacity-40 blur-[2px]">
            <h3 className="text-sm font-bold mb-3">Advanced Tools Preview</h3>
            <div className="grid grid-cols-3 gap-3">
              {['SQLi Generator', 'JWT Analyzer', 'HTTP Builder'].map(t => (
                <div key={t} className="p-3 rounded-xl bg-surface-100 dark:bg-surface-800 text-xs font-bold text-center">{t}</div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <Link to="/billing" className="btn-primary py-3 px-6 text-xs shadow-glow flex items-center gap-2">
              <HiOutlineLockClosed className="w-4 h-4" />
              Unlock Pro Tools
            </Link>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Recent Activity</h2>
          <Link to="/history" className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline">
            View all →
          </Link>
        </div>
        <div className="glass-card overflow-hidden">
          {loadingStats ? (
            <div className="p-6 space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex gap-4">
                  <div className="skeleton h-4 w-24 rounded" />
                  <div className="skeleton h-4 flex-1 rounded" />
                  <div className="skeleton h-4 w-16 rounded" />
                </div>
              ))}
            </div>
          ) : stats.recentActivity.length === 0 ? (
            <div className="p-8 text-center">
              <HiOutlineSearch className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-text-secondary)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                No investigations yet. Start by running an OSINT search!
              </p>
              <Link to="/tools/osint" className="btn-primary mt-4 text-xs py-2 px-4 inline-flex">
                Start Investigation
              </Link>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {stats.recentActivity.map(item => (
                <div key={item.id} className="flex items-center justify-between px-5 py-3 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`badge ${
                      item.inputType === 'email' ? 'badge-blue' :
                      item.inputType === 'ip' ? 'badge-purple' :
                      item.inputType === 'domain' ? 'badge-green' : 'badge-yellow'
                    }`}>
                      {item.inputType}
                    </span>
                    <span className="text-sm font-mono" style={{ color: 'var(--color-text)' }}>{item.query}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.riskScore !== undefined && (
                      <span className={`text-xs font-mono ${
                        item.riskScore <= 30 ? 'risk-low' : item.riskScore <= 60 ? 'risk-medium' : 'risk-high'
                      }`}>
                        Risk: {item.riskScore}
                      </span>
                    )}
                    <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pro upgrade CTA */}
      {isFree && (
        <div className="glass-card overflow-hidden bg-gradient-to-r from-brand-600/5 to-purple-600/5">
          <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text)' }}>Unlock Full Potential</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Upgrade to Pro for unlimited scans, full results, PDF exports, and advanced tools.
              </p>
            </div>
            <Link to="/billing" className="btn-primary whitespace-nowrap">
              <HiOutlineLightningBolt className="w-4 h-4" />
              View Plans
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function StatsCard({ icon, label, value, color, loading }) {
  const colorMap = {
    brand: 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
        <div>
          {loading ? (
            <div className="skeleton h-7 w-12 rounded mb-1" />
          ) : (
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{value}</p>
          )}
          <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
        </div>
      </div>
    </div>
  );
}
