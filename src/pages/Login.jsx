import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineShieldCheck, HiOutlineSearch, HiOutlineCode, HiOutlineGlobeAlt, HiOutlineDocumentReport, HiOutlineLightningBolt } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';

const FEATURES = [
  { icon: HiOutlineSearch, title: 'OSINT Intelligence', desc: 'Email, domain, IP & username reconnaissance' },
  { icon: HiOutlineCode, title: 'Security Arsenal', desc: 'XSS, SQLi payloads & JWT analysis tools' },
  { icon: HiOutlineGlobeAlt, title: 'DNS & Subdomain Recon', desc: 'Enumerate subdomains, DNS records & cert transparency' },
  { icon: HiOutlineDocumentReport, title: 'Automated Reports', desc: 'Risk scoring & exportable PDF investigation reports' },
  { icon: HiOutlineShieldCheck, title: '18 Security Tools', desc: 'Port scanning, traceroute, tech stack & more' },
  { icon: HiOutlineLightningBolt, title: 'Pro Academy', desc: '18 expert guides with methodology & workflows' },
];

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.message?.includes('invalid') ? 'Invalid credentials' : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      toast.success('Welcome!');
    } catch (err) {
      if (!err.message?.includes('popup-closed')) {
        toast.error('Google sign-in failed');
      }
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg)' }}>
      {/* Left — Features Panel */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden" style={{ background: '#080C18' }}>
        {/* Ambient glow effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20" style={{background:'radial-gradient(circle, #4F6EF7 0%, transparent 70%)'}} />
        <div className="absolute bottom-[-15%] right-[-5%] w-[400px] h-[400px] rounded-full opacity-15" style={{background:'radial-gradient(circle, #60A5FA 0%, transparent 70%)'}} />
        <div className="absolute top-[40%] right-[20%] w-[200px] h-[200px] rounded-full opacity-10" style={{background:'radial-gradient(circle, #3B82F6 0%, transparent 70%)'}} />
        
        <div className="relative z-10 flex flex-col justify-center px-14 xl:px-20 py-12 w-full">
          {/* Logo + Brand */}
          <div className="flex items-center gap-3.5 mb-12">
            <img src="/cybermindspace.webp" alt="CyberMindSpace" className="w-11 h-11 rounded-xl shadow-glow-sm object-cover" />
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">CyberMindSpace</h1>
              <p className="text-[10px] font-semibold text-brand-400 tracking-widest uppercase">Security Platform</p>
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-[28px] xl:text-[32px] font-bold text-white leading-tight mb-3 tracking-tight">
            Your Cybersecurity<br />
            <span className="text-gradient">Intelligence Platform</span>
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-10 max-w-md">
            Professional-grade security tools for bug bounty hunters, penetration testers, and security researchers.
          </p>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="group p-4 rounded-xl border border-white/[0.06] hover:border-brand-500/20 transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.02)', animationDelay: `${i * 100}ms` }}
              >
                <Icon className="w-5 h-5 text-brand-400 mb-2.5 group-hover:text-brand-300 transition-colors" />
                <p className="text-[12px] font-semibold text-white mb-0.5">{title}</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Bottom stat */}
          <div className="mt-10 flex items-center gap-6 text-[11px] text-slate-500">
            <span><strong className="text-white font-semibold">18</strong> Security Tools</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span><strong className="text-white font-semibold">Free</strong> Tier Available</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span><strong className="text-white font-semibold">₹499</strong>/mo Pro</span>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <img src="/cybermindspace.webp" alt="CyberMindSpace" className="w-9 h-9 rounded-xl object-cover" />
            <h1 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>CyberMindSpace</h1>
          </div>

          <h2 className="text-[22px] font-bold mb-1.5 tracking-tight" style={{ color: 'var(--color-text)' }}>Welcome back</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>Sign in to your account</p>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-[1.5px] font-medium text-sm transition-all duration-200 hover:border-brand-500/30 hover:shadow-md mb-6"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)', background: 'var(--color-surface)' }}
          >
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
            <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>or sign in with email</span>
            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Email</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-11" placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                <input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-11 pr-11" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-secondary)' }}>
                  {showPassword ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm disabled:opacity-50">
              {loading ? (
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-500 font-semibold hover:underline">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
