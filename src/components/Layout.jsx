import { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  HiOutlineViewGrid,
  HiOutlineCube,
  HiOutlineClock,
  HiOutlineDocumentReport,
  HiOutlineCreditCard,
  HiOutlineLogout,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineLightningBolt,
  HiOutlineBookOpen,
} from 'react-icons/hi';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
  { to: '/tools', label: 'Tools', icon: HiOutlineCube },
  { to: '/learn', label: 'Academy', icon: HiOutlineBookOpen },
  { to: '/history', label: 'History', icon: HiOutlineClock },
  { to: '/reports', label: 'Reports', icon: HiOutlineDocumentReport },
  { to: '/billing', label: 'Billing', icon: HiOutlineCreditCard },
];

export default function Layout({ children }) {
  const { user, userProfile, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const plan = userProfile?.plan || 'free';
  const isPro = plan === 'pro' || plan === 'elite';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-[260px] flex flex-col transition-transform duration-300 ease-in-out
          lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ background: 'var(--color-sidebar-bg)', borderRight: '1px solid var(--color-border)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <img src="/cybermindspace.webp" alt="CyberMindSpace" className="w-8 h-8 rounded-xl shadow-glow-sm object-cover" />
          <div className="flex-1 min-w-0">
            <h1 className="text-[13px] font-bold tracking-tight truncate" style={{ color: 'var(--color-text)' }}>CyberMindSpace</h1>
            <p className="text-[9px] font-semibold tracking-widest uppercase" style={{ color: 'var(--color-text-secondary)' }}>Security Platform</p>
          </div>
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <HiOutlineX className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <p className="px-4 mb-2 text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }}>Navigation</p>
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="px-3 pb-4 space-y-2.5 border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
          {/* Upgrade CTA */}
          {!isPro && (
            <Link
              to="/billing"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white text-xs font-semibold transition-all hover:shadow-glow"
              style={{ background: 'linear-gradient(135deg, #4F6EF7 0%, #3451D1 100%)' }}
            >
              <HiOutlineLightningBolt className="w-4 h-4" />
              <div>
                <p className="text-[11px] font-bold leading-tight">Upgrade to Pro</p>
                <p className="text-[9px] opacity-60">₹199/mo — Unlock everything</p>
              </div>
            </Link>
          )}

          {/* Theme toggle */}
          <button onClick={toggleTheme} className="sidebar-link w-full">
            {darkMode ? (
              <HiOutlineSun className="w-[18px] h-[18px] text-amber-400" />
            ) : (
              <HiOutlineMoon className="w-[18px] h-[18px] text-brand-600" />
            )}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* User info */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'var(--color-surface-hover)' }}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full ring-2 ring-brand-500/20" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {(userProfile?.displayName || user?.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                {userProfile?.displayName || 'User'}
              </p>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${isPro ? 'badge-blue' : 'badge-yellow'}`}>
                {isPro ? '⭐ Pro Plan' : 'Free Plan'}
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
          >
            <HiOutlineLogout className="w-[18px] h-[18px]" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header
          className="lg:hidden flex items-center gap-3 px-4 h-14 border-b"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <HiOutlineMenu className="w-5 h-5" style={{ color: 'var(--color-text)' }} />
          </button>
          <div className="flex items-center gap-2">
            <img src="/cybermindspace.webp" alt="" className="w-7 h-7 rounded-lg object-cover" />
            <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>CyberMindSpace</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}
