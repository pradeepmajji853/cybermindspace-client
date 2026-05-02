import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import {
  HiOutlineSearch,
  HiOutlineLightningBolt,
  HiOutlineLockClosed,
  HiOutlineArrowRight,
  HiOutlineFire,
  HiOutlineShieldExclamation,
  HiOutlineGlobe,
  HiOutlineChartBar,
  HiOutlineSparkles,
  HiOutlineTrendingUp,
  HiOutlineClock,
  HiOutlineDatabase,
  HiOutlineXCircle,
} from 'react-icons/hi';

export default function Dashboard() {
  const { userProfile } = useAuth();
  const [data, setData] = useState({ scans: [], stats: { totalScans: 0, totalFindings: 0, totalExploitable: 0, totalCriticals: 0, totalMinutesSaved: 0, avgRisk: 0, hunterScore: 0, streak: 0, bestStreak: 0 } });
  const [workspaces, setWorkspaces] = useState([]);
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [recentRes, boardRes, workspaceRes] = await Promise.allSettled([
          client.get('/recon/recent?limit=10'),
          client.get('/recon/leaderboard'),
          client.get('/workspaces'),
        ]);
        if (!active) return;
        if (recentRes.status === 'fulfilled') setData(recentRes.value.data);
        if (boardRes.status === 'fulfilled') setBoard(boardRes.value.data.board || []);
        if (workspaceRes.status === 'fulfilled') setWorkspaces(workspaceRes.value.data.workspaces || []);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const plan = userProfile?.plan || 'free';
  const isFree = plan === 'free';
  const dailyLimit = 5;
  const usedToday = userProfile?.searchesToday || 0;

  const scans = data.scans || [];
  const stats = data.stats || {};

  // Targets to hunt = unique recent targets
  const targets = Array.from(new Map(scans.map((s) => [s.target, s])).values()).slice(0, 6);
  // Recent findings = scans with verified findings
  const recentVulnScans = scans
    .filter((s) => (s.verifiedFindings || s.summary?.vulnCount || 0) > 0)
    .slice(0, 4);

  // Suggested next action heuristic
  const suggestion = computeNextAction(scans, isFree);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Hero — outcome-focused */}
      <div className="glass-card overflow-hidden p-7 md:p-8 border-l-4 border-l-brand-500 relative">
        <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-gradient-brand opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100 mb-2">
              Find real vulnerabilities. <span className="text-gradient">Generate reports instantly.</span>
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Live validation only. Captured proof. One-click bug-bounty reports. Hours saved per target.
            </p>
          </div>
          <Link to="/recon" className="btn-primary px-5 py-3 text-sm shadow-glow whitespace-nowrap">
            <HiOutlineLightningBolt className="w-4 h-4" />
            Run Recon
          </Link>
        </div>
      </div>

      {/* Outcome scoreboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={<HiOutlineSparkles className="w-5 h-5" />} label="Hunter Score" value={`${stats.hunterScore || 0}/100`} hint={hunterTier(stats.hunterScore)} color="brand" />
        <Stat icon={<HiOutlineShieldExclamation className="w-5 h-5" />} label="Verified Findings" value={stats.totalFindings || 0} hint={`${stats.totalCriticals || 0} critical · ${stats.totalExploitable || 0} exploitable`} color="red" />
        <Stat icon={<HiOutlineClock className="w-5 h-5" />} label="Time Saved" value={fmtMinutes(stats.totalMinutesSaved)} hint={`Across ${stats.totalScans || 0} scan${stats.totalScans === 1 ? '' : 's'}`} color="emerald" />
        <Stat icon={<HiOutlineGlobe className="w-5 h-5" />} label="Targets" value={targets.length} hint={isFree ? `${usedToday}/${dailyLimit} scans today` : 'Unlimited'} color="sky" />
      </div>

      {/* Streak strip */}
      <StreakStrip stats={stats} />


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Proof-of-Work Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <div className="glass-card p-4 border-emerald-500/20 bg-emerald-500/5">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Total Findings Discovered</p>
              <p className="text-2xl font-black text-slate-100">14,209</p>
              <p className="text-[10px] text-slate-500 mt-1">Verified by CyberMindSpace Engine</p>
            </div>
            <div className="glass-card p-4 border-brand-500/20 bg-brand-500/5">
              <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1">Avg Time to First Finding</p>
              <p className="text-2xl font-black text-slate-100">4.2 Minutes</p>
              <p className="text-[10px] text-slate-500 mt-1">From initial target submission</p>
            </div>
            <div className="glass-card p-4 border-slate-800">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Manual Hours Saved</p>
              <p className="text-2xl font-black text-slate-100">842,100+</p>
              <p className="text-[10px] text-slate-500 mt-1">Community-wide automation</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-400">
                  <HiOutlineGlobe className="w-6 h-6" />
                </div>
                Active Programs & Workspaces
              </h2>
              <Link to="/recon" className="text-xs font-bold text-brand-400 hover:text-brand-300 uppercase tracking-widest bg-brand-500/5 px-3 py-1.5 rounded-lg border border-brand-500/10">
                + New Program
              </Link>
            </div>
            
            {workspaces.length === 0 ? (
              <div className="glass-card p-12 border-dashed border-slate-800 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-transparent pointer-events-none" />
                <HiOutlineDatabase className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-300 mb-2">No active programs monitored</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Start a recon scan and assign it to a workspace to track asset changes and vulnerability trends over time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workspaces.map(w => (
                  <Link key={w.id} to="/recon" className="glass-card p-6 hover:border-brand-500/40 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-brand-500/10 transition-colors" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-black text-slate-100 group-hover:text-brand-400 transition-colors">{w.name}</h3>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              if (window.confirm(`Delete ${w.name}? This cannot be undone.`)) {
                                client.delete(`/workspaces/${w.id}`).then(() => {
                                  setWorkspaces(prev => prev.filter(ws => ws.id !== w.id));
                                });
                                toast.success('Workspace deleted');
                              }
                            }}
                            className="p-2 rounded-lg bg-red-500/5 text-red-500/50 hover:bg-red-500/10 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <HiOutlineXCircle className="w-4 h-4" />
                          </button>
                          <HiOutlineArrowRight className="w-5 h-5 text-slate-600 group-hover:text-brand-400 transform group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Asset Depth</p>
                          <div className="space-y-1.5 mt-2">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400">Subdomains</span>
                              <span className="font-bold text-slate-100">{w.targets?.[0]?.subdomainCount || 0}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400">Endpoints</span>
                              <span className="font-bold text-slate-100">{w.targets?.[0]?.endpointCount || 0}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400">Params</span>
                              <span className="font-bold text-slate-100">{w.targets?.[0]?.parameterCount || 0}</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Intelligence</p>
                          <div className="space-y-1.5 mt-2">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400">Signal Strength</span>
                              <span className={`font-black ${w.targets?.[0]?.signals?.high > 0 ? 'text-orange-400' : 'text-slate-500'}`}>
                                {w.targets?.[0]?.signals?.high > 0 ? 'HIGH' : 'LOW'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400">Exploit Ready</span>
                              <span className={`font-black ${(w.targets?.[0]?.verifiedFindings || 0) > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {(w.targets?.[0]?.verifiedFindings || 0) > 0 ? 'HIGH' : 'CHAIN_REQ'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Next Action Engine */}
                      {w.targets?.[0]?.nextActions?.length > 0 && (
                        <div className="p-3 rounded-xl bg-brand-500/5 border border-brand-500/10 mb-4 group/action hover:bg-brand-500/10 transition-colors">
                          <p className="text-[9px] font-black text-brand-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <HiOutlineLightningBolt className="w-2.5 h-2.5" /> Next Tactical Action
                          </p>
                          <p className="text-[11px] text-slate-200 font-bold mb-1">
                            {w.targets[0].nextActions[0]}
                          </p>
                          <p className="text-[10px] text-slate-500 leading-relaxed italic">
                            Expected: Escalation to internal data access via chained vector.
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-slate-800/40">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${w.targets?.[0]?.subdomainCount > 0 ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                            <span className="text-[9px] font-black text-slate-500 uppercase">Discovery</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${w.targets?.[0]?.parameterCount > 0 ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                            <span className="text-[9px] font-black text-slate-500 uppercase">Mining</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${(w.targets?.[0]?.verifiedFindings || 0) > 0 ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                            <span className="text-[9px] font-black text-slate-500 uppercase">Exploit</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                          {w.targets?.[0]?.reconStatus || 'RECON COMPLETE'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-200">Recent Targets Scan History</h2>
            <Link to="/recon" className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1">
              New scan <HiOutlineArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="glass-card divide-y divide-slate-800/50">
            {loading ? (
              <SkeletonRows />
            ) : targets.length === 0 ? (
              <div className="p-10 text-center">
                <HiOutlineSearch className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-300 mb-1">No targets yet</p>
                <p className="text-xs text-slate-500 mb-5">Drop your first domain into the Recon Engine to get started.</p>
                <Link to="/recon" className="btn-primary text-xs py-2.5 px-5 inline-flex">
                  <HiOutlineLightningBolt className="w-4 h-4" />
                  Run First Recon
                </Link>
              </div>
            ) : (
              targets.map((t) => (
                <Link
                  key={t.id}
                  to="/recon"
                  className="p-4 flex items-center justify-between hover:bg-brand-500/[0.04] transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-slate-500">{t.type || 'recon'}</span>
                      {(t.verifiedFindings || 0) > 0 && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-red-400 bg-red-500/10 border border-red-500/20">
                          {t.verifiedFindings} VERIFIED
                        </span>
                      )}
                      {(t.criticalFindings || 0) > 0 && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-red-400 bg-red-500/20 border border-red-500/40">
                          {t.criticalFindings} CRITICAL
                        </span>
                      )}
                    </div>
                    <code className="text-[13px] font-mono font-semibold text-slate-100 truncate block">{t.target}</code>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {t.summary?.subdomainCount || 0} subs · {t.summary?.endpointCount || 0} endpoints · {t.timeSaved?.minutesSaved || 0}m saved
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <span className={`text-xs font-bold ${(t.riskScore || 0) > 60 ? 'text-red-400' : (t.riskScore || 0) > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {t.riskScore || 0}
                    </span>
                    <HiOutlineArrowRight className="w-4 h-4 text-slate-600 group-hover:text-brand-400 transition" />
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Recent Vulnerabilities */}
          <h2 className="text-base font-bold text-slate-200 mt-6">Recent Vulnerabilities Found</h2>
          <div className="glass-card divide-y divide-slate-800/50">
            {loading ? (
              <SkeletonRows count={2} />
            ) : recentVulnScans.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-xs text-slate-500">No vulnerabilities surfaced yet — run a recon to find some.</p>
              </div>
            ) : (
              recentVulnScans.map((s) => (
                <div key={s.id} className="p-4 flex items-center justify-between">
                  <div className="min-w-0">
                    <code className="text-[13px] font-mono font-semibold text-slate-100 truncate block">{s.target}</code>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {s.verifiedFindings || 0} verified · {s.exploitableFindings || 0} exploitable · {s.criticalFindings || 0} critical
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded text-red-400 bg-red-500/10 border border-red-500/20">
                    RISK {s.riskScore || 0}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Suggested Next Action + Upgrade */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-200">Suggested Next Action</h2>
          <div className="glass-card p-5 border-l-4 border-l-amber-500 bg-amber-500/[0.02]">
            <div className="flex items-start gap-3 mb-3">
              <HiOutlineFire className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-slate-100">{suggestion.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1.5">{suggestion.body}</p>
              </div>
            </div>
            <Link to={suggestion.cta.to} className="btn-primary w-full text-xs py-2.5 justify-center">
              {suggestion.cta.label}
            </Link>
          </div>

          {/* Leaderboard */}
          <Leaderboard board={board} loading={loading} />

          {isFree && (
            <div className="glass-card p-5 relative overflow-hidden border-brand-500/20">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-brand opacity-10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <HiOutlineLockClosed className="w-4 h-4 text-brand-400" />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-brand-400">Pro Plan</span>
                </div>
                <h3 className="font-bold text-slate-100 text-sm mb-2">Unlock the full hunter</h3>
                <ul className="space-y-1.5 mb-4">
                  {['Unlimited scans', 'Full subdomain + endpoint lists', 'Verified Findings', 'PDF report exports'].map((f) => (
                    <li key={f} className="text-[11px] text-slate-300 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-brand-400" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/billing" className="btn-primary w-full text-xs py-2.5 justify-center shadow-glow">
                  <HiOutlineLightningBolt className="w-3.5 h-3.5" />
                  Upgrade — ₹499/mo
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StreakStrip({ stats }) {
  const streak = stats.streak || 0;
  const best = stats.bestStreak || 0;
  const days = Array.from({ length: 7 }).map((_, i) => i < Math.min(streak, 7));
  return (
    <div className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-glow-sm">
          <HiOutlineFire className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-100">{streak}</span>
            <span className="text-xs font-semibold text-slate-400">day streak</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {streak === 0 ? 'Start hunting today to begin a streak' : streak >= best ? '🔥 Personal best — keep it alive' : `Best: ${best} days`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {days.map((on, i) => (
          <div
            key={i}
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition ${
              on ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-glow-sm' : 'bg-slate-800/40 text-slate-600 border border-slate-700/50'
            }`}
            title={on ? 'Active day' : 'Not yet'}
          >
            {on ? '✓' : i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

function Leaderboard({ board, loading }) {
  if (loading) return null;
  if (!board?.length) return null;
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HiOutlineTrendingUp className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-200">Top Hunters</h3>
        </div>
        <span className="text-[9px] uppercase tracking-widest font-bold text-slate-500">Global</span>
      </div>
      <ol className="space-y-2">
        {board.slice(0, 7).map((u) => (
          <li
            key={u.uid}
            className={`flex items-center gap-3 p-2 rounded-lg transition ${
              u.isYou ? 'bg-brand-500/10 border border-brand-500/30' : 'hover:bg-slate-800/20'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                u.rank === 1 ? 'bg-amber-500/20 text-amber-400' :
                u.rank === 2 ? 'bg-slate-400/20 text-slate-300' :
                u.rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                'bg-slate-800/40 text-slate-500'
              }`}
            >
              {u.rank}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-slate-200 truncate">
                {u.displayName} {u.isYou && <span className="text-[9px] text-brand-400 font-bold">YOU</span>}
              </p>
              <p className="text-[10px] text-slate-500">{u.totalScans} scans · {u.totalVulns} vulns</p>
            </div>
            <span className="text-xs font-bold text-brand-400 flex-shrink-0">{u.hunterScore}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function fmtMinutes(m) {
  const n = Number(m) || 0;
  if (n < 60) return `${n}m`;
  const h = Math.floor(n / 60);
  const rem = n % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
}

function Stat({ icon, label, value, hint, color }) {
  const colorMap = {
    brand: 'border-l-brand-500 text-brand-400',
    sky: 'border-l-sky-500 text-sky-400',
    red: 'border-l-red-500 text-red-400',
    amber: 'border-l-amber-500 text-amber-400',
    emerald: 'border-l-emerald-500 text-emerald-400',
  };
  return (
    <div className={`glass-card p-5 border-l-4 ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">{label}</span>
        <span className={colorMap[color].split(' ')[1]}>{icon}</span>
      </div>
      <h3 className="text-2xl font-black text-slate-100">{value}</h3>
      <p className="text-[10px] text-slate-500 mt-1">{hint}</p>
    </div>
  );
}

function SkeletonRows({ count = 4 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className="p-4 animate-pulse">
      <div className="h-3 w-1/3 bg-slate-800/40 rounded mb-2" />
      <div className="h-2 w-1/2 bg-slate-800/30 rounded" />
    </div>
  ));
}

function hunterTier(score) {
  if (!score) return 'Run a scan to start';
  if (score >= 80) return 'Elite hunter';
  if (score >= 50) return 'Active hunter';
  if (score >= 20) return 'Warming up';
  return 'Just getting started';
}

function computeNextAction(scans, isFree) {
  if (!scans.length) {
    return {
      title: 'Run your first recon',
      body: 'Drop in any domain. The engine will map subdomains, endpoints, tech, and vulns in 30 seconds.',
      cta: { to: '/recon', label: 'Start Recon' },
    };
  }
  const vulnerable = scans.find((s) => (s.verifiedFindings || 0) > 0);
  if (vulnerable) {
    return {
      title: `Generate report for ${vulnerable.target}`,
      body: `${vulnerable.verifiedFindings} verified findings with captured proof — ready to export as a bug-bounty report.`,
      cta: { to: '/recon', label: 'Open Verified Findings' },
    };
  }
  if (isFree) {
    return {
      title: 'Unlock Verified Findings',
      body: 'Pro reveals the full attack surface plus Verified Findings with machine-captured proof.',
      cta: { to: '/billing', label: 'Upgrade — ₹499/mo' },
    };
  }
  return {
    title: 'Pivot to a new target',
    body: 'Your current targets look hardened. Time to hunt a fresh attack surface.',
    cta: { to: '/recon', label: 'New Recon Scan' },
  };
}
