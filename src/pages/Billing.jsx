import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { HiOutlineCreditCard, HiOutlineLightningBolt, HiOutlineCheck, HiOutlineShieldCheck, HiOutlineLogout, HiOutlineX, HiOutlineArrowLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    period: '',
    tagline: 'Get started with basic access.',
    features: [
      { text: '5 scans per day', included: true },
      { text: 'OSINT Hub (partial results)', included: true },
      { text: 'Subdomain Finder (top 10)', included: true },
      { text: 'DNS Lookup', included: true },
      { text: 'XSS Payload Library', included: true },
      { text: 'Full scan results', included: false },
      { text: 'Report exports', included: false },
      { text: 'Advanced tools (SQLi, JWT, etc.)', included: false },
      { text: 'Pro Academy content', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹199',
    period: '/month',
    tagline: 'Full power for serious researchers.',
    popular: true,
    features: [
      { text: 'Unlimited scans', included: true },
      { text: 'Full OSINT results', included: true },
      { text: 'All 18 security tools unlocked', included: true },
      { text: 'SQLi Payload Generator', included: true },
      { text: 'JWT Decoder & Analyzer', included: true },
      { text: 'HTTP Request Builder', included: true },
      { text: 'Email Breach Checker', included: true },
      { text: 'Traceroute Visualizer', included: true },
      { text: 'Tech Stack Detector', included: true },
      { text: 'Subdomain Takeover Checker', included: true },
      { text: 'WHOIS Privacy Audit', included: true },
      { text: 'Pro Academy (18 expert guides)', included: true },
      { text: 'Unlimited PDF report exports', included: true },
      { text: 'Priority processing', included: true },
    ],
  },
];

export default function Billing() {
  const { userProfile, refreshProfile, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const currentPlan = userProfile?.plan || 'free';
  const isPro = currentPlan === 'pro' || currentPlan === 'elite';

  const handleLogout = async () => {
    await logout();
  };

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { data } = await client.post('/payment/create-order', { planType: 'pro' });
      const options = {
        key: data.key,
        order_id: data.orderId,
        name: 'CyberMindSpace',
        description: 'Pro Plan',
        theme: { color: '#4F6EF7' },
        handler: async function (response) {
          try {
            await client.post('/payment/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            await refreshProfile();
            toast.success('🎉 Welcome to CyberMindSpace Pro!');
            navigate('/dashboard');
          } catch (err) {
            toast.error('Payment verification failed.');
          }
        },
        prefill: {
          email: userProfile?.email || '',
          name: userProfile?.displayName || '',
        },
        modal: { ondismiss: () => setLoading(false) },
      };

      if (typeof window.Razorpay === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => new window.Razorpay(options).open();
        document.body.appendChild(script);
      } else {
        new window.Razorpay(options).open();
      }
    } catch (err) {
      toast.error('Failed to create order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in py-4">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-[10px] font-bold uppercase tracking-widest">
          <HiOutlineLightningBolt className="w-3 h-3" /> Simple Pricing
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
          Free to Start, <span className="text-gradient">Pro to Master</span>
        </h1>
        <p className="max-w-lg mx-auto text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Start with free tools. Upgrade to Pro for unlimited access to all 18 security tools, academy content, and report exports.
        </p>
      </div>

      {/* 2-Column Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PLANS.map(plan => {
          const isCurrent = (plan.id === 'free' && !isPro) || (plan.id === 'pro' && isPro);

          return (
            <div
              key={plan.id}
              className={`glass-card overflow-hidden relative flex flex-col ${
                plan.popular ? 'ring-2 ring-brand-500/50 shadow-glow' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-gradient-brand text-white text-center text-[9px] font-bold py-2 tracking-widest uppercase">
                  ⭐ Most Popular
                </div>
              )}
              <div className={`p-8 flex-1 flex flex-col`}>
                <div className="flex items-center gap-2 mb-1">
                  {plan.popular ? <HiOutlineLightningBolt className="w-5 h-5 text-brand-500" /> :
                   <HiOutlineShieldCheck className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />}
                  <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{plan.name}</h2>
                </div>
                <p className="text-xs mb-5" style={{ color: 'var(--color-text-secondary)' }}>{plan.tagline}</p>
                <div className="flex items-baseline gap-1 mb-7">
                  <span className="text-4xl font-bold" style={{ color: 'var(--color-text)' }}>{plan.price}</span>
                  {plan.period && <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{plan.period}</span>}
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map(feature => (
                    <li key={feature.text} className="flex items-start gap-3 text-[13px]">
                      {feature.included ? (
                        <HiOutlineCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <HiOutlineX className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-20" />
                      )}
                      <span style={{ color: feature.included ? 'var(--color-text)' : 'var(--color-text-secondary)', opacity: feature.included ? 1 : 0.4 }}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button disabled className="btn-secondary w-full justify-center opacity-60 py-3.5">
                    Current Plan
                  </button>
                ) : plan.id === 'free' ? (
                  <button disabled className="btn-secondary w-full justify-center py-3.5 opacity-40 text-xs">
                    Free Forever
                  </button>
                ) : (
                  <button
                    onClick={handleUpgrade}
                    disabled={loading}
                    className="btn-primary w-full py-3.5 text-sm justify-center shadow-glow"
                  >
                    {loading ? (
                      <div className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full" />
                    ) : (
                      <>
                        <HiOutlineLightningBolt className="w-4 h-4" />
                        Upgrade to Pro
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-center space-y-3">
        <p className="text-[10px] opacity-30">Secured by Razorpay. All prices in INR. Cancel anytime.</p>
        {!isPro ? (
          <button
            onClick={handleLogout}
            className="text-xs font-semibold text-red-400 hover:text-red-500 transition-colors"
          >
            <HiOutlineLogout className="w-3 h-3 inline mr-1" /> Sign Out
          </button>
        ) : (
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors flex items-center gap-1 mx-auto"
          >
            <HiOutlineArrowLeft className="w-3 h-3" /> Back to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
