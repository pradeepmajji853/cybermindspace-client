import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { HiOutlineDocumentReport, HiOutlineDownload, HiOutlineBookmark, HiOutlineSearch } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function Reports() {
  const { userProfile } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const isPro = userProfile?.plan === 'pro';

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const { data } = await client.get('/user/reports');
      setReports(data.reports);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (id) => {
    try {
      await client.patch(`/osint/${id}/save`);
      setReports(prev => prev.filter(r => r.id !== id));
      toast.success('Report removed from saved');
    } catch (err) {
      toast.error('Failed to unsave');
    }
  };

  const handleDownload = async (id) => {
    if (!isPro) {
      toast.error('PDF export requires Pro plan');
      return;
    }

    const loadingToast = toast.loading('Preparing download...');
    try {
      const response = await client.get(`/reports/${id}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CyberMindSpace_Report_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Download started', { id: loadingToast });
    } catch (err) {
      toast.error('Download failed', { id: loadingToast });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <HiOutlineDocumentReport className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Saved Reports</h1>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Your bookmarked investigation reports
          </p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={4} />
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center">
            <HiOutlineBookmark className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-secondary)' }} />
            <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--color-text)' }}>No saved reports</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Save investigations by clicking the bookmark icon on any result
            </p>
            <Link to="/tools/osint" className="btn-primary inline-flex text-sm">
              Start Investigation
            </Link>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {reports.map(report => (
              <div key={report.id} className="flex items-center justify-between px-5 py-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                    <HiOutlineDocumentReport className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm font-mono font-semibold" style={{ color: 'var(--color-text)' }}>{report.query}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`badge ${
                        report.inputType === 'email' ? 'badge-blue' :
                        report.inputType === 'ip' ? 'badge-purple' :
                        report.inputType === 'domain' ? 'badge-green' : 'badge-yellow'
                      }`}>
                        {report.inputType}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {report.riskScore !== undefined && (
                    <span className={`text-xs font-mono font-semibold ${
                      report.riskScore <= 30 ? 'risk-low' : report.riskScore <= 60 ? 'risk-medium' : 'risk-high'
                    }`}>
                      Risk: {report.riskScore}
                    </span>
                  )}
                  <button
                    onClick={() => handleDownload(report.id)}
                    className={`btn-ghost text-xs py-1 px-2 ${!isPro ? 'opacity-50' : ''}`}
                    title={isPro ? 'Download PDF' : 'Pro required'}
                  >
                    <HiOutlineDownload className="w-4 h-4" />
                    {!isPro && '🔒'}
                  </button>
                  <button
                    onClick={() => handleUnsave(report.id)}
                    className="btn-ghost text-xs py-1 px-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10"
                    title="Remove from saved"
                  >
                    <HiOutlineBookmark className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
