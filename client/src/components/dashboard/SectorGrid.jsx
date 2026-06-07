import { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api.js';
import { useSocket } from '../../hooks/useSocket.js';
import SectorCard from './SectorCard.jsx';

export default function SectorGrid() {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSectors = async () => {
    try {
      const data = await api.getSectors();
      const sectorList = Array.isArray(data) ? data : data.sectors || [];
      setSectors(sectorList);
    } catch (err) {
      console.error('Failed to fetch sectors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectors();
  }, []);

  const handleSectorUpdate = useCallback((updatedSector) => {
    setSectors((prev) =>
      prev.map((s) =>
        (s.id === updatedSector.id || s.sectorId === updatedSector.id)
          ? { ...s, ...updatedSector }
          : s
      )
    );
  }, []);

  useSocket('sector:updated', handleSectorUpdate);
  useSocket('incident:triggered', fetchSectors);

  useEffect(() => {
    const onReset = (e) => {
      if (e.detail && e.detail.sectors) {
        setSectors(e.detail.sectors);
      } else {
        fetchSectors();
      }
    };
    window.addEventListener('app:reset', onReset);
    return () => window.removeEventListener('app:reset', onReset);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">
          Sector Overview
        </h2>
        <span className="text-xs text-text-secondary">
          {sectors.length} sectors
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {loading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl glass border border-white/5 animate-pulse bg-white/5" />
          ))
        ) : (
          sectors.map((sector) => (
            <SectorCard
              key={sector.id || sector.sectorId || sector._id}
              sector={sector}
            />
          ))
        )}
      </div>
    </div>
  );
}
