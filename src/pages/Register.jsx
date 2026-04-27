import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlineEye, HiOutlineEyeOff, HiOutlineCheck, HiOutlineLightningBolt } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';

const FREE_FEATURES = [
  'OSINT Intelligence Hub with risk scoring',
  'Subdomain enumeration via crt.sh & OTX',
  'Full DNS record lookup (A, MX, TXT, NS, SOA)',
  'XSS payload library with 500+ payloads',
  '5 scans per day',
];

const PRO_FEATURES = [
  'Unlimited scans & full results',
  'All 18 security tools unlocked',
  'SQLi, JWT, HTTP Builder & more',
  'Pro Academy — 18 expert methodology guides',
  'PDF report exports & priority processing',
];

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(email, password, name);
      toast.success('Account created!');
    } catch (err) {
      const msg = err.message?.includes('already-in-use')
        ? 'Email already registered'
        : err.message?.includes('weak-password')
        ? 'Password too weak'
        : 'Registration failed';
      toast.error(msg);
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
      {/* Left — Plans overview */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden" style={{ background: '#080C18' }}>
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-20" style={{background:'radial-gradient(circle, #4F6EF7 0%, transparent 70%)'}} />
        <div className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] rounded-full opacity-15" style={{background:'radial-gradient(circle, #60A5FA 0%, transparent 70%)'}} />

        <div className="relative z-10 flex flex-col justify-center px-14 xl:px-20 py-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3.5 mb-12">
            <img src="/cybermindspace.webp" alt="CyberMindSpace" className="w-11 h-11 rounded-xl shadow-glow-sm object-cover" />
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">CyberMindSpace</h1>
              <p className="text-[10px] font-semibold text-brand-400 tracking-widest uppercase">Security Platform</p>
            </div>
          </div>

          <h2 className="text-[28px] xl:text-[32px] font-bold text-white leading-tight mb-3 tracking-tight">
            Start Free, <span className="text-gradient">Upgrade Anytime</span>
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-10 max-w-md">
            Create your account and get instant access to professional security tools. No credit card required.
          </p>

          {/* Two-column plan comparison */}
          <div className="grid grid-cols-2 gap-4">
            {/* Free */}
            <div className="rounded-xl border border-white/[0.06] p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mb-1">Free Forever</p>
              <p className="text-2xl font-bold text-white mb-4">₹0</p>
              <ul className="space-y-2.5">
                {FREE_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2 text-[11px] text-slate-400">
                    <HiOutlineCheck className="w-3.5 h-3.5 text-sky-400 flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="rounded-xl border border-brand-500/20 p-5 relative" style={{ background: 'rgba(79,110,247,0.04)' }}>
              <div className="absolute -top-2.5 left-4 bg-brand-500 text-white text-[8px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Popular</div>
              <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1">Pro Plan</p>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-2xl font-bold text-white">₹199</span>
                <span className="text-[11px] text-slate-500">/mo</span>
              </div>
              <ul className="space-y-2.5">
                {PRO_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2 text-[11px] text-slate-400">
                    <HiOutlineLightningBolt className="w-3.5 h-3.5 text-brand-400 flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[400px]">
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <img src="/cybermindspace.webp" alt="CyberMindSpace" className="w-9 h-9 rounded-xl object-cover" />
            <h1 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>CyberMindSpace</h1>
          </div>

          <h2 className="text-[22px] font-bold mb-1.5 tracking-tight" style={{ color: 'var(--color-text)' }}>Create your account</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>Start your cybersecurity journey for free</p>

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
            <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>or register with email</span>
            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Full Name</label>
              <div className="relative">
                <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                <input id="register-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field pl-11" placeholder="Your name" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Email</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                <input id="register-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-11" placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                <input id="register-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-11 pr-11" placeholder="Min 6 characters" />
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
              ) : 'Create Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
