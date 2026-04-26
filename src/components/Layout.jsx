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
  HiOutlineShieldCheck,
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

const ADMIN_EMAILS = [
  'admin@cybermindspace.com',
  'majjipradeepkumar@gmail.com',
  'almadadali786@gmail.com',
  'dhyeybhuva2003@gmail.com',
  'pateltushar1734@gmail.com',
  'acromatic.tech@gmail.com',
  'pradeepmajji853@gmail.com',
  'majjipradeep4677@gmail.com'
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
  const planLabel = plan === 'elite' ? '🔥 Elite Plan' : plan === 'pro' ? '⭐ Pro Plan' : 'Free Plan';
  const planBadgeClass = plan === 'elite' ? 'badge-purple' : plan === 'pro' ? 'badge-blue' : 'badge-yellow';
  const showUpgrade = plan === 'free';

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ease-in-out
          lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ background: 'var(--color-sidebar-bg)', borderRight: '1px solid var(--color-border)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <img src="/cybermindspace.webp" alt="CyberMindSpace" className="w-9 h-9 rounded-xl shadow-glow-sm object-cover" />
          <div>
            <h1 className="text-sm font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>CyberMindSpace</h1>
            <p className="text-[10px] font-medium tracking-wider uppercase" style={{ color: 'var(--color-text-secondary)' }}>Security Tools</p>
          </div>
          <button
            className="ml-auto lg:hidden p-1 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700"
            onClick={() => setSidebarOpen(false)}
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-4 space-y-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          {/* Upgrade CTA for free users */}
          {showUpgrade && (
            <Link
              to="/billing"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-brand text-white text-xs font-bold transition-all hover:shadow-glow"
            >
              <HiOutlineLightningBolt className="w-5 h-5" />
              <div>
                <p className="text-[11px] font-bold">Upgrade to Pro</p>
                <p className="text-[9px] opacity-70">Unlock all tools</p>
              </div>
            </Link>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="sidebar-link w-full"
          >
            {darkMode ? (
              <HiOutlineSun className="w-5 h-5 text-amber-400" />
            ) : (
              <HiOutlineMoon className="w-5 h-5 text-brand-600" />
            )}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* User info */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'var(--color-surface-hover, rgba(0,0,0,0.03))' }}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold">
                {(userProfile?.displayName || user?.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                {userProfile?.displayName || 'User'}
              </p>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${planBadgeClass}`}>
                {planLabel}
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
          >
            <HiOutlineLogout className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header
          className="lg:hidden flex items-center gap-3 px-4 py-3 border-b"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800"
          >
            <HiOutlineMenu className="w-5 h-5" style={{ color: 'var(--color-text)' }} />
          </button>
          <div className="flex items-center gap-2">
            <img src="/cybermindspace.webp" alt="" className="w-7 h-7 rounded-lg object-cover" />
            <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>CyberMindSpace</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
