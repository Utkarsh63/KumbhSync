import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Clock, RefreshCw, GitBranch } from 'lucide-react';
import { api } from '../lib/api.js';
import { useSocket } from '../hooks/useSocket.js';
import toast from 'react-hot-toast';

const statusStyles = {
  Active: 'bg-accent-blue/15 text-accent-blue border border-accent-blue/20',
  Completed: 'bg-accent-green/15 text-accent-green border border-accent-green/20',
};

export default function Deployments() {
  const [deployments, setDeployments] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDeployments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getDeployments();
      const list = Array.isArray(data) ? data : data.deployments || [];
      // Sort by most recent
      list.sort((a, b) => new Date(b.deployedAt || b.timestamp || 0) - new Date(a.deployedAt || a.timestamp || 0));
      setDeployments(list);
    } catch (err) {
      console.error('Failed to fetch deployments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeployments();
    api.getSectors().then(data => setSectors(Array.isArray(data) ? data : data.sectors || [])).catch(console.error);
  }, [fetchDeployments]);

  useSocket('deployment:new', fetchDeployments);
  useSocket('deployment:issued', fetchDeployments);
  useSocket('volunteer:rerouted', fetchDeployments);

  const handleComplete = async (id) => {
    try {
      await api.completeDeployment(id);
      toast.success('Deployment marked as completed');
      fetchDeployments();
    } catch (err) {
      toast.error(err.message || 'Failed to complete deployment');
    }
  };

  function formatTime(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch {
      return '—';
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-primary" />
            Deployment History
          </h1>
          <p className="text-sm text-text-secondary mt-1">Track all volunteer deployments and rerouting events</p>
        </div>
        <button
          onClick={fetchDeployments}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="rounded-xl glass border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Volunteer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  From
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  To
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Task
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Shift Timing
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Time
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-text-secondary">
                    Loading deployments...
                  </td>
                </tr>
              ) : deployments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-text-secondary">
                    No deployments yet
                  </td>
                </tr>
              ) : (
                deployments.map((d) => {
                  const id = d._id || d.id;
                  const shortId = typeof id === 'string' ? id.slice(-6) : id;
                  const status = d.status || 'Active';

                  return (
                    <tr
                      key={id}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 text-text-secondary font-mono text-xs">
                        #DEP-{String(id).slice(-4).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 font-medium text-text-primary">
                        {d.volunteerName || d.volunteer?.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        S{d.fromSector || d.fromSectorId || '—'} {sectors.find(s => s.id === (d.fromSector || d.fromSectorId)) ? `- ${sectors.find(s => s.id === (d.fromSector || d.fromSectorId)).name}` : ''}
                      </td>
                      <td className="px-4 py-3 text-primary font-semibold">
                        S{d.toSector || d.toSectorId || d.sectorId || '—'} {(d.sector?.name) ? `- ${d.sector.name}` : (sectors.find(s => s.id === (d.toSector || d.toSectorId || d.sectorId)) ? `- ${sectors.find(s => s.id === (d.toSector || d.toSectorId || d.sectorId)).name}` : '')}
                      </td>
                      <td className="px-4 py-3 text-text-primary text-xs">
                        {d.task || d.volunteer?.primarySkill || '—'}
                      </td>
                      <td className="px-4 py-3 text-text-secondary font-mono text-xs">
                        {d.volunteer?.shiftTiming || '—'}
                      </td>
                      <td className="px-4 py-3 text-text-secondary text-xs max-w-[160px] truncate" title={d.reason}>
                        {d.reason || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${statusStyles[status] || 'bg-white/5 text-text-secondary'}`}>
                          {status === 'Active' ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary text-xs">
                        {formatTime(d.deployedAt || d.timestamp)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {status === 'Active' && (
                          <button
                            onClick={() => handleComplete(id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-accent-green/10 text-accent-green text-xs font-medium hover:bg-accent-green/20 transition-colors"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && (
          <div className="px-4 py-2.5 border-t border-white/5 text-[11px] text-text-secondary">
            {deployments.length} deployment{deployments.length !== 1 ? 's' : ''} total
          </div>
        )}
      </div>
    </div>
  );
}
