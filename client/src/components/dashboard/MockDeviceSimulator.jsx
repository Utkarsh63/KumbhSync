import { useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket.js';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

export default function MockDeviceSimulator() {
  const handleDeploymentIssued = (data) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } relative max-w-sm w-full bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl pointer-events-auto flex flex-col overflow-hidden border border-black/10`}
        >
          {/* Header */}
          <div className="flex justify-between items-center bg-black/5 px-4 py-3 border-b border-black/5">
            <div className="flex items-center gap-2">
              <span className="text-lg">📱</span>
              <span className="text-xs font-bold text-gray-800 tracking-widest uppercase">
                Deployment SMS sent
              </span>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="p-1 rounded-full hover:bg-black/10 transition-colors text-gray-500 hover:text-gray-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 bg-white text-gray-900 font-sans">
            <div className="text-[10px] text-gray-400 font-bold uppercase mb-2">Notification Preview</div>
            <p className="text-sm font-semibold mb-2 text-gray-700">
              To: <span className="text-black">{data.volunteerName}</span> <span className="text-gray-400 font-normal">• {data.volunteerPhone || '+91 XXXXXX'}</span>
            </p>
            <div className="text-[13px] leading-relaxed text-gray-800 bg-gray-50 p-4 rounded-xl border border-gray-100 font-mono">
              "URGENT: Report to <strong className="text-black">{data.sectorName}</strong> (Sector {data.toSector || data.sectorId || 'N'}) immediately.<br/>
              <strong className="text-red-600">{data.incidentType || 'Incident'}</strong> declared.<br/>
              Show ID: KS-2024-{String(data.volunteerId).padStart(3, '0')}<br/>
              - KumbhSync Command Center"
            </div>
          </div>

          {/* Countdown Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
            <div 
              className="h-full bg-blue-500" 
              style={{ 
                animation: 'shrinkBar 5s linear forwards' 
              }} 
            />
          </div>
        </div>
      ),
      { duration: 5000, position: 'bottom-right' }
    );
  };

  useSocket('deployment:issued', handleDeploymentIssued);

  return null;
}
