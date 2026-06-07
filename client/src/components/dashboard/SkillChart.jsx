import { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from '../../lib/api.js';
import { useSocket } from '../../hooks/useSocket.js';

const SKILL_COLORS = {
  Medical: '#EF4444',
  CrowdControl: '#3B82F6',
  Translation: '#8B5CF6',
  Swimmer: '#06B6D4',
  Sanitation: '#10B981',
  General: '#F59E0B',
};

const DEFAULT_COLORS = ['#E85D04', '#F48C06', '#3B82F6', '#10B981', '#8B5CF6', '#06B6D4', '#F59E0B', '#EF4444'];

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="glass rounded-lg px-3 py-2 border border-white/10 shadow-xl">
        <p className="text-xs font-semibold text-text-primary">{data.name}</p>
        <p className="text-xs text-text-secondary mt-0.5">
          Count: <span className="text-text-primary font-medium">{data.value}</span>
        </p>
        <p className="text-xs text-text-secondary">
          Share: <span className="text-text-primary font-medium">{(data.payload.percent * 100).toFixed(1)}%</span>
        </p>
      </div>
    );
  }
  return null;
}

function CustomLegend({ payload }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2 px-2">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[11px] text-text-secondary">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function SkillChart() {
  const [volunteers, setVolunteers] = useState([]);

  const fetchVolunteers = async () => {
    try {
      const data = await api.getVolunteers();
      const list = Array.isArray(data) ? data : data.volunteers || [];
      setVolunteers(list);
    } catch (err) {
      console.error('Failed to fetch volunteer data for chart:', err);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  useSocket('stats:refresh', fetchVolunteers);
  useSocket('volunteer:updated', fetchVolunteers);
  useSocket('volunteer:created', fetchVolunteers);

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
  }, []);

  const chartData = useMemo(() => {
    const counts = {};
    volunteers.forEach(v => {
      const skill = v.primarySkill || v.skill || 'General';
      counts[skill] = (counts[skill] || 0) + 1;
    });
    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([name, value]) => ({ name, value }));
  }, [volunteers]);

  return (
    <div className="rounded-xl glass border border-white/5 p-4">
      <h3 className="text-sm font-semibold text-text-primary mb-3">Skills Distribution</h3>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-text-secondary text-sm">
          No volunteer data
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={SKILL_COLORS[entry.name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
