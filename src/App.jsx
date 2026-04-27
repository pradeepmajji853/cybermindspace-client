import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ToolsHub from './pages/ToolsHub';
import OsintTool from './pages/OsintTool';
import XssPayloads from './pages/XssPayloads';
import History from './pages/History';
import Reports from './pages/Reports';
import Billing from './pages/Billing';
import Admin from './pages/Admin';
import Education from './pages/Education';
import SubdomainFinder from './pages/SubdomainFinder';
import DnsLookup from './pages/DnsLookup';
import JwtAnalyzer from './pages/JwtAnalyzer';
import SqliGenerator from './pages/SqliGenerator';
import HttpBuilder from './pages/HttpBuilder';
import RegexGenerator from './pages/RegexGenerator';
import Traceroute from './pages/Traceroute';
import EmailBreachChecker from './pages/EmailBreachChecker';
import { HiOutlineLockClosed, HiOutlineLightningBolt, HiOutlineArrowLeft } from 'react-icons/hi';

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

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'var(--color-bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow animate-pulse">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Loading CyberMindSpace...</p>
        </div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" />;
}

/**
 * PlanGate: Shows an inline upgrade prompt instead of redirecting.
 * Free users see a message + upgrade button. Pro/admin users pass through.
 */
function PlanGate({ children, feature = 'this feature' }) {
  const { userProfile, loading } = useAuth();
  
  if (loading) return null;
  
  const isAdmin = userProfile && ADMIN_EMAILS.includes(userProfile.email);
  const plan = userProfile?.plan || 'free';

  if (isAdmin || plan === 'pro' || plan === 'elite') {
    return children;
  }
  
  // Show inline upgrade message instead of redirecting
  return (
    <div className="pro-gate animate-fade-in">
      <div className="glass-card max-w-md w-full p-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-6 shadow-glow">
          <HiOutlineLockClosed className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          Pro Feature
        </h2>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <span className="font-semibold capitalize">{feature}</span> is available exclusively for CyberMindSpace Pro members. Upgrade to unlock all tools, unlimited scans, and premium content.
        </p>
        <Link
          to="/billing"
          className="btn-primary w-full py-3.5 text-sm justify-center mb-3 shadow-glow"
        >
          <HiOutlineLightningBolt className="w-5 h-5" />
          Upgrade to Pro — ₹199/mo
        </Link>
        <Link
          to="/dashboard"
          className="btn-ghost w-full py-2.5 justify-center text-xs"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      
      <Route 
        path="/cybermind-master-admin" 
        element={
          <ProtectedRoute>
            {user && ADMIN_EMAILS.includes(user.email) ? <Admin /> : <Navigate to="/dashboard" />}
          </ProtectedRoute>
        } 
      />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                {/* Free access — all users */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tools" element={<ToolsHub />} />
                <Route path="/learn" element={<Education />} />
                <Route path="/history" element={<History />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/reports" element={<Reports />} />

                {/* Free tools (with limited results) */}
                <Route path="/tools/osint" element={<OsintTool />} />
                <Route path="/tools/subdomain" element={<SubdomainFinder />} />
                <Route path="/tools/dns" element={<DnsLookup />} />
                <Route path="/tools/xss" element={<XssPayloads />} />

                {/* Pro tools */}
                <Route path="/tools/sqli" element={<PlanGate feature="SQLi Payload Generator"><SqliGenerator /></PlanGate>} />
                <Route path="/tools/jwt" element={<PlanGate feature="JWT Decoder"><JwtAnalyzer /></PlanGate>} />
                <Route path="/tools/http-builder" element={<PlanGate feature="HTTP Request Builder"><HttpBuilder /></PlanGate>} />
                <Route path="/tools/regex" element={<PlanGate feature="Regex Generator"><RegexGenerator /></PlanGate>} />
                <Route path="/tools/email-breach" element={<PlanGate feature="Email Breach Checker"><EmailBreachChecker /></PlanGate>} />
                <Route path="/tools/traceroute" element={<PlanGate feature="Traceroute Visualizer"><Traceroute /></PlanGate>} />

                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                borderRadius: '14px',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 8px 32px -8px rgba(0,0,0,0.12)',
              },
            }}
          />
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
