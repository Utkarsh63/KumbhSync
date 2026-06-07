import { useState, useEffect } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import toast from 'react-hot-toast';

const INCIDENT_TYPES = [
  'Crowd Surge',
  'Medical Emergency',
  'Fire',
  'VIP Arrival',
  'Stampede Alert',
  'Lost Person',
  'Fire Alert',
];

export default function SimulateModal({ isOpen, onClose, onSubmit }) {
  const [sectors, setSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState('');
  const [incidentType, setIncidentType] = useState('Crowd Surge');
  const [volunteersNeeded, setVolunteersNeeded] = useState(30);
  const [loading, setLoading] = useState(false);

  // Fetch Sectors on Mount
  useEffect(() => {
    if (isOpen) {
      api.getSectors().then((data) => {
        const list = Array.isArray(data) ? data : data.sectors || [];
        setSectors(list);
        if (list.length > 0) {
          // Safely grab the ID depending on how your backend sends it
          setSelectedSector(list[0].id || list[0].sectorId || list[0]._id);
        }
      }).catch((err) => {
        console.error(err);
        toast.error("Failed to load sectors");
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Pass the fully structured payload to your parent component's onSubmit handler
      if (onSubmit) {
        await onSubmit({
          sectorId: selectedSector,
          type: incidentType,
          needed: volunteersNeeded
        });
      }
      toast.success("Emergency triggered successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to trigger emergency.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 w-screen h-screen">
      
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-lg z-10 bg-[#181C25] rounded-2xl border border-red-500/30 shadow-2xl animate-fade-in overflow-hidden">
        
        {/* Header */}
        <div className="bg-red-500 flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-lg font-bold">🚨 Declare Emergency</h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* SECTOR DROPDOWN */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Incident Location
            </label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#1A1F2B] border border-slate-700 text-white text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              required
            >
              <option value="">-- Select Sector --</option>
              {sectors.map((s) => (
                <option key={s.id || s.sectorId || s._id} value={s.id || s.sectorId || s._id}>
                  Sector {s.id || s.sectorId || s._id} — {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* INCIDENT TYPE DROPDOWN */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Incident Type
            </label>
            <select
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#1A1F2B] border border-slate-700 text-white text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              required
            >
              {INCIDENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* VOLUNTEERS NEEDED */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Volunteers Needed
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={volunteersNeeded}
              onChange={(e) => setVolunteersNeeded(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg bg-[#1A1F2B] border border-slate-700 text-white text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-semibold text-sm transition-all hover:bg-white/10 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-500 text-white font-bold text-sm transition-all hover:bg-red-600 disabled:opacity-50 shadow-lg shadow-red-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Triggering...
                </>
              ) : (
                <>
                  🚨 Trigger Emergency
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
