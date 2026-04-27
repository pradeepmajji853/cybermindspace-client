import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { HiOutlineSearch, HiOutlineDocumentReport, HiOutlineStar, HiOutlineLightningBolt, HiOutlineArrowRight, HiOutlineShieldCheck, HiOutlineCode, HiOutlineLockClosed, HiOutlineGlobeAlt, HiOutlineCube } from 'react-icons/hi';

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
      {/* Welcome */}
      <div className="glass-card overflow-hidden">
        <div className="relative p-7 lg:p-8">
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px]" style={{background:'linear-gradient(135deg, #4F6EF7, #A855F7)'}} />
          </div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-[28px] font-bold mb-1.5 tracking-tight" style={{ color: 'var(--color-text)' }}>
                Welcome back, <span className="text-gradient">{userProfile?.displayName || 'Agent'}</span>
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Your cybersecurity command center is ready.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`badge ${isFree ? 'badge-yellow' : 'badge-blue'}`}>
                {isFree ? 'Free Plan' : '⭐ Pro Plan'}
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard icon={<HiOutlineSearch className="w-5 h-5" />} label="Investigations" value={stats.totalSearches} color="brand" loading={loadingStats} />
        <StatsCard icon={<HiOutlineDocumentReport className="w-5 h-5" />} label="Saved Reports" value={stats.savedReports} color="emerald" loading={loadingStats} />
        <StatsCard icon={<HiOutlineStar className="w-5 h-5" />} label="Searches Today" value={isFree ? `${usedToday}/${dailyLimit}` : `${usedToday}`} color="amber" loading={loadingStats} />
      </div>

      {/* Usage bar */}
      {isFree && (
        <div className="glass-card p-5" style={{borderLeft:'3px solid #F59E42'}}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HiOutlineLightningBolt className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>Daily Usage</span>
            </div>
            <span className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
              {usedToday} of {dailyLimit} scans
            </span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{background:'var(--color-surface-hover)'}}>
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usagePercent >= 80 ? 'bg-red-500' : usagePercent >= 50 ? 'bg-amber-500' : 'bg-brand-500'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          {usagePercent >= 80 && (
            <p className="mt-2 text-[10px] text-amber-500 font-semibold">
              Running low! <Link to="/billing" className="text-brand-500 underline">Upgrade to Pro</Link> for unlimited scans.
            </p>
          )}
        </div>
      )}

      {/* Quick Access */}
      <div>
        <h2 className="text-base font-bold mb-4" style={{ color: 'var(--color-text)' }}>Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickTool to="/tools/osint" icon={<HiOutlineShieldCheck className="w-5 h-5" />} name="OSINT Investigation" desc="Email, domain & IP intelligence" gradient="from-brand-500 to-brand-700" />
          <QuickTool to="/tools/xss" icon={<HiOutlineCode className="w-5 h-5" />} name="XSS Arsenal" desc="500+ cross-site scripting payloads" gradient="from-amber-500 to-orange-600" />
          <QuickTool to="/tools/subdomain" icon={<HiOutlineGlobeAlt className="w-5 h-5" />} name="Subdomain Finder" desc="Enumerate target subdomains" gradient="from-emerald-500 to-teal-600" />
        </div>
      </div>

      {/* Locked preview for free */}
      {isFree && (
        <div className="glass-card overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/90 dark:to-[#0B0F1A]/90 z-10 pointer-events-none" />
          <div className="p-6 opacity-30 blur-[2px]">
            <h3 className="text-sm font-bold mb-3">Pro Tools Preview</h3>
            <div className="grid grid-cols-3 gap-3">
              {['SQLi Generator', 'JWT Analyzer', 'HTTP Builder'].map(t => (
                <div key={t} className="p-3 rounded-xl text-xs font-bold text-center" style={{background:'var(--color-surface-hover)'}}>{t}</div>
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
          <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>Recent Activity</h2>
          <Link to="/history" className="text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors">
            View all →
          </Link>
        </div>
        <div className="glass-card overflow-hidden">
          {loadingStats ? (
            <div className="p-6 space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="flex gap-4">
                  <div className="skeleton h-4 w-20 rounded" />
                  <div className="skeleton h-4 flex-1 rounded" />
                  <div className="skeleton h-4 w-14 rounded" />
                </div>
              ))}
            </div>
          ) : stats.recentActivity.length === 0 ? (
            <div className="p-10 text-center">
              <HiOutlineSearch className="w-9 h-9 mx-auto mb-3" style={{ color: 'var(--color-text-secondary)', opacity: 0.4 }} />
              <p className="text-sm font-medium mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                No investigations yet. Start by running a scan!
              </p>
              <Link to="/tools/osint" className="btn-primary text-xs py-2 px-4 inline-flex">
                Start Investigation
              </Link>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {stats.recentActivity.map(item => (
                <div key={item.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
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

      {/* Pro CTA */}
      {isFree && (
        <div className="glass-card overflow-hidden">
          <div className="relative p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="absolute inset-0 opacity-[0.03]">
              <div className="absolute inset-0 rounded-2xl" style={{background:'linear-gradient(135deg, #4F6EF7, #A855F7)'}} />
            </div>
            <div className="relative z-10">
              <h3 className="text-base font-bold mb-1" style={{ color: 'var(--color-text)' }}>Unlock Full Potential</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Upgrade to Pro for unlimited scans, full results, and all 18 tools.
              </p>
            </div>
            <Link to="/billing" className="btn-primary whitespace-nowrap relative z-10">
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
  const colors = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors[color]}`}>
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

function QuickTool({ to, icon, name, desc, gradient }) {
  return (
    <Link to={to} className="glass-card p-5 group hover:border-brand-500/20 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-sm group-hover:shadow-glow-sm transition-shadow`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[13px] font-bold mb-0.5 truncate" style={{ color: 'var(--color-text)' }}>{name}</h3>
          <p className="text-[11px] truncate" style={{ color: 'var(--color-text-secondary)' }}>{desc}</p>
        </div>
        <HiOutlineArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-60 group-hover:translate-x-0.5 transition-all flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }} />
      </div>
    </Link>
  );
}
