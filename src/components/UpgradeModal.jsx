import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { HiOutlineLightningBolt, HiOutlineX, HiOutlineLockClosed, HiOutlineCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function UpgradeModal({ show, onClose, trigger }) {
  const { userProfile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const features = [
    'Unlimited scans',
    'All 18 tools unlocked',
    'Full OSINT results',
    'Pro Academy (18 guides)',
    'Unlimited PDF exports',
    'Priority processing',
  ];

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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md glass-card overflow-hidden animate-scale-in shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 z-10 transition-colors">
          <HiOutlineX className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
        </button>

        <div className="p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-5 shadow-glow">
            <HiOutlineLockClosed className="w-7 h-7 text-white" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-4">
            {trigger || 'Premium Feature'}
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            Upgrade to Pro
          </h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Unlock the full power of CyberMindSpace with unlimited access to all tools and features.
          </p>

          <div className="text-left glass-card p-5 mb-6">
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>₹199</span>
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>/month</span>
            </div>
            <ul className="space-y-2.5">
              {features.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-[12px]">
                  <HiOutlineCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span style={{ color: 'var(--color-text)' }}>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="btn-primary w-full py-3.5 text-sm shadow-glow justify-center"
          >
            {loading ? (
              <div className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full" />
            ) : (
              <>
                <HiOutlineLightningBolt className="w-5 h-5" />
                Upgrade to Pro — ₹199/mo
              </>
            )}
          </button>
          <p className="text-[10px] opacity-30 mt-3">Secured by Razorpay. Cancel anytime.</p>
        </div>
      </div>
    </div>
  );
}
