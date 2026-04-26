import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { HiOutlineLightningBolt, HiOutlineX, HiOutlineLockClosed, HiOutlineCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function UpgradeModal({ show, onClose, trigger }) {
  const { userProfile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('pro');

  if (!show) return null;

  const plans = [
    {
      id: 'pro',
      name: 'Pro',
      price: '₹299',
      period: '/month',
      features: ['Unlimited scans', 'Full results', 'All tools unlocked', 'Basic report exports'],
      popular: true,
    },
    {
      id: 'elite',
      name: 'Elite',
      price: '₹799',
      period: '/month',
      features: ['Everything in Pro', 'Subdomain Takeover', 'Tech Stack Detection', 'Unlimited PDF exports', 'Priority processing'],
      popular: false,
    },
  ];

  const handleUpgrade = async (planType) => {
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
            onClose();
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl glass-card overflow-hidden animate-slide-up shadow-2xl">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 z-10">
          <HiOutlineX className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
        </button>

        {/* Header */}
        <div className="p-8 pb-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-4">
            <HiOutlineLockClosed className="w-3 h-3" />
            {trigger || 'Premium Feature'}
          </div>
          <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--color-text)' }}>
            Unlock Full Power
          </h2>
          <p className="text-sm opacity-60 max-w-md mx-auto">
            You've reached the free tier limit. Upgrade to get unlimited scans, full results, and advanced tools.
          </p>
        </div>

        {/* Plans */}
        <div className="px-8 pb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 border-2 cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? 'border-brand-500 bg-brand-500/5 shadow-glow-sm'
                  : 'border-border hover:border-brand-500/30'
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-[9px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-black" style={{ color: 'var(--color-text)' }}>{plan.price}</span>
                <span className="text-xs opacity-40">{plan.period}</span>
              </div>
              <p className="text-xs font-bold mb-4" style={{ color: 'var(--color-text)' }}>{plan.name}</p>
              <ul className="space-y-2">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-[11px]">
                    <HiOutlineCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span style={{ color: 'var(--color-text-secondary)' }}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-8 pb-8">
          <button
            onClick={() => handleUpgrade(selectedPlan)}
            disabled={loading}
            className="btn-primary w-full py-4 text-sm shadow-glow flex justify-center items-center gap-3"
          >
            {loading ? (
              <div className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full" />
            ) : (
              <>
                <HiOutlineLightningBolt className="w-5 h-5" />
                Upgrade to {selectedPlan === 'elite' ? 'Elite' : 'Pro'} — {selectedPlan === 'elite' ? '₹799' : '₹299'}/mo
              </>
            )}
          </button>
          <p className="text-[10px] text-center opacity-30 mt-3">Secured by Razorpay. Cancel anytime.</p>
        </div>
      </div>
    </div>
  );
}
