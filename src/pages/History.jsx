import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { HiOutlineClock, HiOutlineTrash, HiOutlineExternalLink, HiOutlineSearch } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data } = await client.get('/user/history?limit=50');
      setHistory(data.history);
    } catch (err) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await client.delete(`/user/history/${id}`);
      setHistory(prev => prev.filter(h => h.id !== id));
      toast.success('Entry deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const getRiskClass = (score) => {
    if (score === undefined) return '';
    if (score <= 30) return 'risk-low';
    if (score <= 60) return 'risk-medium';
    return 'risk-high';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
          <HiOutlineClock className="w-6 h-6 text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Search History</h1>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Your past OSINT investigations
          </p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={5} />
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center">
            <HiOutlineSearch className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-secondary)' }} />
            <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--color-text)' }}>No history yet</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Your investigation history will appear here
            </p>
            <Link to="/tools/osint" className="btn-primary inline-flex text-sm">
              Start Investigation
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Query
                  </th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Type
                  </th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Risk
                  </th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Date
                  </th>
                  <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {history.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-mono font-bold text-slate-100">
                          {item.query}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
                          {item.source === 'recon' ? 'Recon Engine' : 'OSINT Search'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge ${
                        item.inputType === 'email' ? 'badge-blue' :
                        item.inputType === 'ip' ? 'badge-purple' :
                        item.inputType === 'domain' ? 'badge-green' : 'badge-yellow'
                      }`}>
                        {item.inputType}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-mono font-black ${getRiskClass(item.riskScore)}`}>
                        {item.riskScore !== undefined ? `${item.riskScore}%` : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={item.source === 'recon' ? `/recon?target=${item.query}` : `/tools/osint`}
                          className="p-2 rounded-lg bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 transition-all"
                          title="View Intelligence"
                        >
                          <HiOutlineExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="btn-ghost text-xs py-1 px-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                          title="Delete"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
