import { useState } from 'react';
import { useSocket } from '../../hooks/useSocket.js';
import { AlertTriangle } from 'lucide-react';

export default function EmergencyBanner() {
  const [incident, setIncident] = useState(null);

  useSocket('incident:triggered', (data) => {
    setIncident(data);
    setTimeout(() => {
      setIncident(null);
    }, 3000);
  });

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-center py-3 px-4 bg-accent-red text-white font-bold tracking-widest text-sm transition-transform duration-500 shadow-2xl ${
        incident ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <AlertTriangle className="w-5 h-5 mr-3 animate-pulse" />
      ⚠️ CRITICAL INCIDENT DECLARED — {incident?.sectorName || 'Triveni Sangam'} — {incident?.incidentType || 'Crowd Surge'}
    </div>
  );
}
