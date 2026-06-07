import { useState, useEffect } from 'react';
import { Users, AlertTriangle, Wifi, WifiOff, RotateCcw } from 'lucide-react';
import { useSocketConnection } from '../../hooks/useSocket.js';
import { api } from '../../lib/api.js';
import toast from 'react-hot-toast';
import SimulateModal from '../incident/SimulateModal.jsx';

export default function TopBar() {
  const [time, setTime] = useState(new Date());
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const connected = useSocketConnection();

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <header className="fixed top-0 left-16 right-0 z-40 h-16 glass-heavy flex items-center justify-between px-6">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold">
          <span className="bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">
            KumbhSync
          </span>
        </h1>
        <span className="text-xs text-text-secondary font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          Live
        </span>
      </div>

      {/* Clock */}
      <div className="flex flex-col items-center">
        <span className="text-lg font-mono font-semibold text-text-primary tracking-wider">
          {formatTime(time)}
        </span>
        <span className="text-[10px] text-text-secondary -mt-0.5">
          {formatDate(time)} IST
        </span>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setShowSimulateModal(true)}
          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-accent-red/20 text-accent-red border border-accent-red/40 hover:bg-accent-red/30 transition-colors flex items-center gap-1.5"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Simulate Emergency
        </button>

        <button 
          onClick={async () => {
            try {
              const data = await api.resetSystem();
              toast.success('System reset successfully');
              window.dispatchEvent(new CustomEvent('app:reset', { detail: data }));
            } catch (e) {
              toast.error('Failed to reset system');
            }
          }}
          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/5 text-text-secondary border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
          connected
            ? 'bg-accent-green/10 text-accent-green border border-accent-green/20'
            : 'bg-accent-red/10 text-accent-red border border-accent-red/20'
        }`}>
          {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {connected ? 'Online' : 'Offline'}
        </div>
      </div>
      <SimulateModal 
        isOpen={showSimulateModal} 
        onClose={() => setShowSimulateModal(false)} 
        onSubmit={async (payload) => {
          await api.simulateIncident({
            sectorId: Number(payload.sectorId) || payload.sectorId,
            type: payload.type,
            volunteersNeeded: payload.needed
          });
        }}
      />
    </header>
  );
}
