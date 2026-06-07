import { useState, useEffect, useCallback } from 'react';
import { Search, BedDouble, UserCheck, RefreshCw, Trash2, Send, X } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useSocket } from '../../hooks/useSocket.js';
import toast from 'react-hot-toast';

const SKILLS = ['All', 'Medical', 'CrowdControl', 'Translation', 'Swimmer', 'Sanitation', 'General'];
const STATUSES = ['All', 'Available', 'Deployed', 'Resting'];

const statusColors = {
  Available: 'bg-accent-green/15 text-accent-green border border-accent-green/20',
  Deployed: 'bg-accent-amber/15 text-accent-amber border border-accent-amber/20',
  Resting: 'bg-accent-blue/15 text-accent-blue border border-accent-blue/20',
};

export default function VolunteerList({ refreshKey }) {
  const [volunteers, setVolunteers] = useState([]);
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [deployingId, setDeployingId] = useState(null);
  const [sectors, setSectors] = useState([]);

  const fetchVolunteers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (skillFilter !== 'All') params.skill = skillFilter;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const data = await api.getVolunteers(params);
      const list = Array.isArray(data) ? data : data.volunteers || [];
      setVolunteers(list);
    } catch (err) {
      console.error('Failed to fetch volunteers:', err);
    } finally {
      setLoading(false);
    }
  }, [search, skillFilter, statusFilter]);

  useEffect(() => {
    fetchVolunteers();
    api.getSectors().then(data => setSectors(Array.isArray(data) ? data : data.sectors || []));
  }, [fetchVolunteers, refreshKey]);

  useSocket('volunteer:updated', fetchVolunteers);
  useSocket('volunteer:deleted', (data) => {
    setVolunteers(prev => prev.filter(v => (v._id || v.id) !== data.id));
  });
  useSocket('volunteer:created', (newV) => {
    setVolunteers(prev => {
      if (prev.find(v => (v._id || v.id) === (newV._id || newV.id))) return prev;
      return [newV, ...prev];
    });
  });
  useSocket('deployment:issued', (data) => {
    if (data.volunteerId && data.sectorId) {
      setVolunteers(prev => prev.map(v => 
        (v._id || v.id) === data.volunteerId 
          ? { ...v, status: 'Deployed', currentSector: data.sectorId }
          : v
      ));
    }
  });
  useSocket('volunteer:rerouted', (data) => {
    if (data.volunteerId && data.sectorId) {
      setVolunteers(prev => prev.map(v => 
        (v._id || v.id) === data.volunteerId 
          ? { ...v, status: 'Deployed', currentSector: data.sectorId }
          : v
      ));
    }
  });

  useEffect(() => {
    const onReset = (e) => {
      if (e.detail && e.detail.volunteers) {
        setVolunteers(e.detail.volunteers);
      } else {
        fetchVolunteers();
      }
    };
    window.addEventListener('app:reset', onReset);
    return () => window.removeEventListener('app:reset', onReset);
  }, [fetchVolunteers]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateVolunteer(id, { status: newStatus });
      toast.success(`Volunteer marked as ${newStatus}`);
      fetchVolunteers();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this volunteer?')) return;
    try {
      await api.deleteVolunteer(id);
      toast.success('Volunteer deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete volunteer');
    }
  };

  const handleDeploy = async (volunteerId, sectorId, task) => {
    if (!sectorId) return;
    try {
      await api.deployVolunteer(volunteerId, sectorId, task);
      toast.success('Volunteer manually deployed');
      setDeployingId(null);
    } catch (err) {
      toast.error(err.message || 'Failed to deploy volunteer');
    }
  };

  const filtered = volunteers.filter((v) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!v.name?.toLowerCase().includes(q) && !v.phone?.includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="rounded-xl glass border border-white/5 overflow-hidden">
      {/* Header + Filters */}
      <div className="p-4 border-b border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Volunteers</h2>
          <button
            onClick={fetchVolunteers}
            className="p-2 rounded-lg hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>
          {/* Skill filter */}
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-text-primary text-sm focus:outline-none focus:border-primary/50 transition-all"
          >
            {SKILLS.map((s) => (
              <option key={s} value={s} className="bg-bg-card">
                {s === 'All' ? 'All Skills' : s}
              </option>
            ))}
          </select>
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-text-primary text-sm focus:outline-none focus:border-primary/50 transition-all"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s} className="bg-bg-card">
                {s === 'All' ? 'All Statuses' : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Skill
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Sector
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Timing
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-text-secondary">
                  Loading volunteers...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-text-secondary">
                  No volunteers found
                </td>
              </tr>
            ) : (
              filtered.map((v) => (
                <tr
                  key={v._id || v.id}
                  className="group border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-text-primary">
                    <button 
                      onClick={() => window.dispatchEvent(new CustomEvent('open-profile', { detail: v._id || v.id }))}
                      className="hover:text-primary transition-colors text-left font-medium"
                    >
                      {v.name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {v.primarySkill}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    S{v.currentSector}{sectors.find(s => s.id === v.currentSector) ? ` - ${sectors.find(s => s.id === v.currentSector).name}` : ''}
                  </td>
                  <td 
                    className="px-4 py-3 cursor-pointer"
                    title={v.phone}
                    onClick={() => window.open(`tel:${v.phone}`)}
                  >
                    {v.phone ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 hover:bg-slate-700 transition-colors">
                        <span>📞</span>
                        <span>{v.phone}</span>
                      </span>
                    ) : (
                      <span className="text-text-secondary text-xs">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-text-secondary font-mono">
                      {v.shiftTiming || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold ${statusColors[v.status] || 'bg-white/5 text-text-secondary'}`}>
                      {v.status === 'Deployed' && <div className="w-1.5 h-1.5 rounded-full bg-accent-amber animate-pulse" />}
                      {v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {deployingId === (v._id || v.id) ? (
                        <div className="flex items-center gap-1">
                          <select 
                            id={`deploy-sector-${v._id || v.id}`}
                            defaultValue=""
                            className="bg-bg-card border border-white/10 text-xs px-2 py-1.5 rounded"
                          >
                            <option value="" disabled>Select Sector</option>
                            {sectors.map(s => (
                              <option key={s.id} value={s.id}>S{s.id} - {s.name}</option>
                            ))}
                          </select>
                          <input 
                            id={`deploy-task-${v._id || v.id}`}
                            type="text" 
                            placeholder="Task (optional)" 
                            className="bg-bg-card border border-white/10 text-xs px-2 py-1.5 rounded w-28 placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50"
                          />
                          <button 
                            onClick={() => {
                              const s = document.getElementById(`deploy-sector-${v._id || v.id}`)?.value;
                              const t = document.getElementById(`deploy-task-${v._id || v.id}`)?.value || v.primarySkill;
                              if (s) handleDeploy(v._id || v.id, s, t);
                            }} 
                            className="p-1.5 rounded-md bg-accent-blue/20 text-accent-blue hover:bg-accent-blue/30 transition-colors"
                            title="Confirm Deploy"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeployingId(null)} className="p-1.5 rounded-md hover:bg-white/10 transition-colors" title="Cancel">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          {v.status === 'Available' && (
                            <button
                              onClick={() => setDeployingId(v._id || v.id)}
                              className="p-1.5 rounded-md hover:bg-accent-blue/10 text-text-secondary hover:text-accent-blue transition-colors"
                              title="Deploy Volunteer"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleStatusChange(v._id || v.id, v.status === 'Resting' ? 'Available' : 'Resting')}
                            className={`p-1.5 rounded-md text-text-secondary transition-colors ${
                              v.status === 'Resting' ? 'hover:bg-accent-green/10 hover:text-accent-green' : 'hover:bg-accent-amber/10 hover:text-accent-amber'
                            }`}
                            title={v.status === 'Resting' ? 'Set to Available' : 'Set to Resting'}
                          >
                            {v.status === 'Resting' ? <UserCheck className="w-3.5 h-3.5" /> : <BedDouble className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDelete(v._id || v.id)}
                            className="p-1.5 rounded-md hover:bg-accent-red/10 text-text-secondary hover:text-accent-red transition-colors"
                            title="Delete Volunteer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {!loading && (
        <div className="px-4 py-2.5 border-t border-white/5 text-[11px] text-text-secondary">
          Showing {filtered.length} of {volunteers.length} volunteers
        </div>
      )}
    </div>
  );
}
