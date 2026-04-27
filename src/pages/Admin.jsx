import { useState, useEffect } from 'react';
import { HiOutlineUserAdd, HiOutlineShieldCheck, HiOutlineMail, HiOutlineCheck, HiOutlineX, HiOutlineArrowLeft } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import api from '../api/client';
import toast from 'react-hot-toast';

export default function Admin() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [fetching, setFetching] = useState(false);

  const fetchUsers = async () => {
    setFetching(true);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleGrantPro = async (targetEmail, isPro = true) => {
    setLoading(true);
    try {
      await api.post('/admin/grant-pro', { email: targetEmail || email, isPro });
      toast.success(`Pro access ${isPro ? 'granted' : 'revoked'}!`);
      setEmail('');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-black p-6 lg:p-12 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm">
              <HiOutlineShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Admin Command Center</h1>
              <p className="text-xs text-brand-500 font-semibold uppercase tracking-widest">Premium Access Management</p>
            </div>
          </div>
          <Link to="/dashboard" className="flex items-center gap-2 text-xs font-bold text-surface-500 hover:text-brand-500 transition-colors">
            <HiOutlineArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <HiOutlineUserAdd className="text-brand-500" /> Grant Pro Access Manually
        </h3>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="User email address..."
              className="input-field pl-12"
            />
          </div>
          <button 
            onClick={() => handleGrantPro(email)}
            disabled={loading || !email}
            className="btn-primary whitespace-nowrap"
          >
            {loading ? 'Processing...' : 'Grant Pro Access'}
          </button>
        </div>
        <p className="text-[10px] opacity-50">This will bypass the payment gateway and grant full lifetime access to the specified email.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border bg-surface-50 dark:bg-surface-900/50 flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider opacity-60">Registered Users</h3>
          <button onClick={fetchUsers} className="text-[10px] text-brand-500 font-bold hover:underline">Refresh List</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-[10px] font-bold uppercase opacity-40">
                <th className="px-4 py-3">User Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {fetching ? (
                <tr><td colSpan="4" className="px-4 py-10 text-center opacity-40">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="4" className="px-4 py-10 text-center opacity-40">No users found</td></tr>
              ) : users.map(user => (
                <tr key={user.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{user.email}</td>
                  <td className="px-4 py-3">
                    {user.isPro ? (
                      <span className="badge badge-green text-[9px] py-0.5">PRO USER</span>
                    ) : (
                      <span className="badge badge-blue text-[9px] py-0.5 opacity-50">UNPAID</span>
                    )}
                  </td>
                  <td className="px-4 py-3 opacity-50">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-4 py-3 text-right">
                    {user.isPro ? (
                      <button 
                        onClick={() => handleGrantPro(user.email, false)}
                        className="text-red-500 hover:underline font-bold text-[10px]"
                      >
                        Revoke Pro
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleGrantPro(user.email, true)}
                        className="text-emerald-500 hover:underline font-bold text-[10px]"
                      >
                        Make Pro
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
}
