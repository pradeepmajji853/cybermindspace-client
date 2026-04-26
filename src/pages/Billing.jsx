import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { HiOutlineCreditCard, HiOutlineLightningBolt, HiOutlineCheck, HiOutlineShieldCheck, HiOutlineLogout, HiOutlineX, HiOutlineStar } from 'react-icons/hi';
import toast from 'react-hot-toast';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    period: '',
    description: 'Get started with limited access.',
    features: [
      { text: '5 scans per day', included: true },
      { text: 'OSINT Hub (partial results)', included: true },
      { text: 'Subdomain Finder (top 10)', included: true },
      { text: 'DNS Lookup', included: true },
      { text: 'XSS Payload Viewer', included: true },
      { text: 'Full scan results', included: false },
      { text: 'Report exports', included: false },
      { text: 'Advanced tools', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹299',
    period: '/month',
    description: 'Full access for serious researchers.',
    popular: true,
    features: [
      { text: 'Unlimited scans', included: true },
      { text: 'Full OSINT results', included: true },
      { text: 'SQLi Payload Generator', included: true },
      { text: 'JWT Decoder & Analyzer', included: true },
      { text: 'HTTP Request Builder', included: true },
      { text: 'Email Breach Checker', included: true },
      { text: 'Basic report exports', included: true },
      { text: 'Priority processing', included: false },
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '₹799',
    period: '/month',
    description: 'Maximum power for professionals.',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Subdomain Takeover Checker', included: true },
      { text: 'Tech Stack Detector', included: true },
      { text: 'Traceroute Visualizer', included: true },
      { text: 'WHOIS Privacy Audit', included: true },
      { text: 'Unlimited PDF exports', included: true },
      { text: 'Priority processing', included: true },
      { text: 'Early access to new tools', included: true },
    ],
  },
];

export default function Billing() {
  const { userProfile, refreshProfile, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const currentPlan = userProfile?.plan || 'free';
  const isPaid = currentPlan === 'pro' || currentPlan === 'elite';

  const handleLogout = async () => {
    await logout();
  };

  const handleUpgrade = async (planType) => {
    if (planType === 'free' || planType === currentPlan) return;
    setLoading(true);
    try {
      const { data } = await client.post('/payment/create-order', { planType });
      const options = {
        key: data.key,
        order_id: data.orderId,
        name: 'CyberMindSpace',
        description: `${planType === 'elite' ? 'Elite' : 'Pro'} Plan`,
        theme: { color: '#2563EB' },
        handler: async function (response) {
          try {
            await client.post('/payment/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            await refreshProfile();
            toast.success(`🎉 Welcome to ${planType === 'elite' ? 'Elite' : 'Pro'}!`);
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
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in py-6">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-[10px] font-bold uppercase tracking-widest">
          <HiOutlineLightningBolt className="w-3 h-3" /> Choose Your Plan
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: 'var(--color-text)' }}>
          From Beginner to <span className="text-gradient">Bug Bounty Ready</span>
        </h1>
        <p className="max-w-xl mx-auto text-sm opacity-60 leading-relaxed">
          Start free. Upgrade when you need the full power of professional security tools.
        </p>
      </div>

      {/* 3-Column Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map(plan => {
          const isCurrent = currentPlan === plan.id;
          const isDowngrade = (currentPlan === 'elite' && plan.id === 'pro') || (currentPlan === 'pro' && plan.id === 'free') || (currentPlan === 'elite' && plan.id === 'free');

          return (
            <div
              key={plan.id}
              className={`glass-card overflow-hidden relative flex flex-col ${
                plan.popular ? 'border-brand-500/50 shadow-glow' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-brand text-white text-center text-[9px] font-bold py-1.5 tracking-widest uppercase">
                  Most Popular
                </div>
              )}
              <div className={`p-7 flex-1 flex flex-col ${plan.popular ? 'pt-10' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  {plan.id === 'elite' ? <HiOutlineStar className="w-5 h-5 text-purple-500" /> :
                   plan.id === 'pro' ? <HiOutlineLightningBolt className="w-5 h-5 text-brand-600" /> :
                   <HiOutlineShieldCheck className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />}
                  <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{plan.name}</h2>
                </div>
                <p className="text-xs mb-4" style={{ color: 'var(--color-text-secondary)' }}>{plan.description}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-black" style={{ color: 'var(--color-text)' }}>{plan.price}</span>
                  {plan.period && <span className="text-sm opacity-40">{plan.period}</span>}
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map(feature => (
                    <li key={feature.text} className="flex items-center gap-3 text-xs">
                      {feature.included ? (
                        <HiOutlineCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <HiOutlineX className="w-4 h-4 flex-shrink-0 opacity-20" />
                      )}
                      <span style={{ color: feature.included ? 'var(--color-text)' : 'var(--color-text-secondary)', opacity: feature.included ? 1 : 0.4 }}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button disabled className="btn-secondary w-full justify-center opacity-60 py-3">
                    Current Plan
                  </button>
                ) : isDowngrade ? (
                  <button disabled className="btn-secondary w-full justify-center opacity-30 py-3 text-xs">
                    Included in your plan
                  </button>
                ) : plan.id === 'free' ? (
                  <button disabled className="btn-secondary w-full justify-center py-3 text-xs opacity-40">
                    Free Forever
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={loading}
                    className={`w-full py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                      plan.popular
                        ? 'btn-primary shadow-glow'
                        : 'btn-secondary hover:border-brand-500/50'
                    }`}
                  >
                    {loading ? (
                      <div className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full" />
                    ) : (
                      <>
                        <HiOutlineLightningBolt className="w-4 h-4" />
                        Upgrade to {plan.name}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="text-center space-y-2">
        <p className="text-[10px] opacity-30">Secured by Razorpay. All prices in INR. Cancel anytime.</p>
        {!isPaid && (
          <button
            onClick={handleLogout}
            className="text-xs font-bold text-red-400 hover:text-red-500 transition-colors"
          >
            <HiOutlineLogout className="w-3 h-3 inline mr-1" /> Sign Out
          </button>
        )}
        {isPaid && (
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs font-bold text-brand-500 hover:text-brand-600 transition-colors"
          >
            ← Back to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
