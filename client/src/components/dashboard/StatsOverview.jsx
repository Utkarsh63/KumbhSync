import { useEffect, useState } from 'react';
import { Users, GitBranch, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useSocket } from '../../hooks/useSocket.js';

function StatCard({ icon: Icon, label, value, subtitle, color, glowing }) {
  const colorMap = {
    primary: 'from-primary/20 to-primary/5 border-primary/30 text-primary',
    green: 'from-accent-green/20 to-accent-green/5 border-accent-green/30 text-accent-green',
    red: 'from-accent-red/20 to-accent-red/5 border-accent-red/30 text-accent-red',
    amber: 'from-accent-amber/20 to-accent-amber/5 border-accent-amber/30 text-accent-amber',
    blue: 'from-accent-blue/20 to-accent-blue/5 border-accent-blue/30 text-accent-blue',
  };

  const iconBgMap = {
    primary: 'bg-primary/15 text-primary',
    green: 'bg-accent-green/15 text-accent-green',
    red: 'bg-accent-red/15 text-accent-red',
    amber: 'bg-accent-amber/15 text-accent-amber',
    blue: 'bg-accent-blue/15 text-accent-blue',
  };

  return (
    <div
      className={`relative rounded-xl bg-gradient-to-br ${colorMap[color]} border p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-${color}/5 ${
        glowing ? 'animate-pulse-red' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-3xl font-bold text-text-primary animate-count-up">
            {value}
          </p>
          {subtitle && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {subtitle}
            </div>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${iconBgMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function Badge({ label, value, color }) {
  const colors = {
    green: 'bg-accent-green/15 text-accent-green',
    blue: 'bg-accent-blue/15 text-accent-blue',
    amber: 'bg-accent-amber/15 text-accent-amber',
    red: 'bg-accent-red/15 text-accent-red',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${colors[color]}`}>
      {label}: {value}
    </span>
  );
}

export default function StatsOverview() {
  const [stats, setStats] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch each independently so one failure doesn't block the others
      const [statsResult, sectorsResult, volunteersResult] = await Promise.allSettled([
        api.getVolunteerStats(),
        api.getSectors(),
        api.getVolunteers(),
      ]);

      if (statsResult.status === 'fulfilled') setStats(statsResult.value);
      if (sectorsResult.status === 'fulfilled') {
        const sd = sectorsResult.value;
        setSectors(Array.isArray(sd) ? sd : sd.sectors || []);
      }
      if (volunteersResult.status === 'fulfilled') {
        const vd = volunteersResult.value;
        setVolunteers(Array.isArray(vd) ? vd : vd.volunteers || []);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useSocket('stats:refresh', fetchData);
  useSocket('sector:updated', fetchData);
  useSocket('volunteer:updated', fetchData);
  useSocket('deployment:issued', fetchData);
  useSocket('sector:update', fetchData);

  useEffect(() => {
    const onReset = (e) => {
      if (e.detail && e.detail.sectors && e.detail.volunteers) {
        setSectors(e.detail.sectors);
        setVolunteers(e.detail.volunteers);
        // Still fetch stats for the high level aggregations
        api.getVolunteerStats().then(setStats).catch(console.error);
      } else {
        fetchData();
      }
    };
    window.addEventListener('app:reset', onReset);
    return () => window.removeEventListener('app:reset', onReset);
  }, []);

  const activeIncidents = sectors.filter((s) => s.activeIncident).length;

  const totalVolunteers = volunteers.length;
  const available = volunteers.filter(v => v.status === 'Available').length;
  const deployed = volunteers.filter(v => v.status === 'Deployed').length;
  const resting = volunteers.filter(v => v.status === 'Resting').length;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl glass border border-white/5 animate-pulse bg-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard
        icon={Users}
        label="Total Volunteers"
        value={totalVolunteers}
        color="primary"
        subtitle={
          <>
            <Badge label="Available" value={available} color="green" />
            <Badge label="Deployed" value={deployed} color="blue" />
            <Badge label="Resting" value={resting} color="amber" />
          </>
        }
      />
      <StatCard
        icon={GitBranch}
        label="Active Deployments"
        value={deployed}
        color="blue"
      />
      <StatCard
        icon={AlertTriangle}
        label="Active Incidents"
        value={activeIncidents}
        color="red"
        glowing={activeIncidents > 0}
      />
    </div>
  );
}
