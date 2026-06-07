import { useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket.js';
import toast from 'react-hot-toast';

export default function NotificationManager() {
  const handleDeploymentIssued = (data) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-sm w-full bg-[#1e293b] shadow-2xl rounded-xl pointer-events-auto flex flex-col border-t-4 border-accent-green overflow-hidden ring-1 ring-white/5`}
        >
          <div className="flex justify-between items-center bg-[#0f172a] px-4 py-2 border-b border-white/5">
            <span className="text-[11px] font-bold text-text-secondary flex items-center gap-1.5 uppercase tracking-wider">
              📱 Volunteer Notified
            </span>
          </div>
          <div className="p-4">
            <h4 className="text-sm font-bold text-white">
              {data.volunteerName} <span className="text-text-secondary font-normal">• {data.volunteerPhone || 'No Phone'}</span>
            </h4>
            <div className="my-3 p-3 rounded-lg bg-black/30 border border-white/5 font-mono text-xs text-text-primary leading-relaxed">
              "Report to {data.sectorName} immediately. {data.incidentType || 'Deployment'} alert"
            </div>
            <div className="flex items-center gap-2 text-[11px] text-text-secondary mt-1">
              <span className="font-semibold text-accent-blue">Skill: {data.volunteerSkill || 'General'}</span>
              <span>•</span>
              <span className="font-semibold text-accent-amber">Score: {data.matchScore}</span>
            </div>
          </div>
        </div>
      ),
      { duration: 4000, position: 'bottom-right' }
    );
  };

  useSocket('deployment:issued', handleDeploymentIssued);

  return null;
}
