import { useState } from 'react';
import { Waves, Stethoscope, HelpCircle, DoorOpen, Tent, AlertTriangle, Send, X } from 'lucide-react';
import { api } from '../../lib/api.js';
import toast from 'react-hot-toast';

const typeIcons = {
  Ghat: Waves,
  Medical: Stethoscope,
  Helpdesk: HelpCircle,
  EntryExit: DoorOpen,
  Camp: Tent,
};

const priorityColors = {
  Low: { border: 'border-accent-green/40', bg: 'bg-accent-green', text: 'text-accent-green' },
  Medium: { border: 'border-accent-amber/40', bg: 'bg-accent-amber', text: 'text-accent-amber' },
  High: { border: 'border-primary/40', bg: 'bg-primary', text: 'text-primary' },
  Critical: { border: 'border-accent-red/40', bg: 'bg-accent-red', text: 'text-accent-red' },
};

export default function SectorCard({ sector }) {
  const [showPopover, setShowPopover] = useState(false);
  const {
    id,
    name,
    type,
    requiredSkill,
    volunteersDeployed = 0,
    volunteersRequired = 1,
    priorityLevel = 'Low',
    activeIncident,
    incidentType,
  } = sector;
  const sectorId = id || sector.sectorId;

  const TypeIcon = typeIcons[type] || HelpCircle;
  const priority = priorityColors[priorityLevel] || priorityColors.Low;
  const fillPercent = Math.min(100, Math.round((volunteersDeployed / volunteersRequired) * 100));

  const fillColor =
    fillPercent >= 80 ? 'bg-accent-green' :
    fillPercent >= 50 ? 'bg-accent-amber' :
    'bg-accent-red';

  const lowFitnessVolunteers = sector.deployments?.filter(d => 
    d.volunteer?.fitnessLevel === 'Low' && 
    d.volunteer?.status === 'Deployed' && 
    d.volunteer?.currentSector === sectorId
  ).length || 0;
  const hasFitnessWarning = type === 'Ghat' && lowFitnessVolunteers > 0;

  const handleDeploy = async (e) => {
    e.stopPropagation();
    try {
      await api.deploy({ sectorId, count: 1 });
      toast.success('Deployed 1 volunteer');
      setShowPopover(false);
    } catch (err) {
      toast.error(err.message || 'Failed to deploy');
    }
  };

  return (
    <div
      className={`relative hover:z-10 rounded-xl border p-3 transition-all duration-200 cursor-pointer hover:scale-[1.03] hover:shadow-xl hover:shadow-black/20 ${
        activeIncident
          ? 'animate-pulse-red border-accent-red'
          : `${priority.border} bg-bg-card hover:bg-bg-card-hover`
      }`}
      onClick={() => setShowPopover(true)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <TypeIcon className={`w-3.5 h-3.5 ${priority.text}`} />
          <span className="text-[10px] font-medium text-text-secondary uppercase tracking-wider">
            {type}
          </span>
        </div>
        <span className="text-[10px] font-mono font-semibold text-text-secondary bg-white/5 px-1.5 py-0.5 rounded">
          #{sectorId}
        </span>
      </div>

      {/* Name */}
      <h3 className="text-sm font-semibold text-text-primary truncate mb-2" title={name}>
        {name}
      </h3>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px]">
          <span className="text-text-secondary">Volunteers</span>
          {volunteersDeployed > volunteersRequired ? (
            <span className="font-semibold text-accent-red flex items-center gap-1">
              {volunteersDeployed}/{volunteersRequired} ⚠️ Over capacity
            </span>
          ) : (
            <span className="font-semibold text-text-primary">
              {volunteersDeployed}/{volunteersRequired}
            </span>
          )}
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${fillColor}`}
            style={{ width: `${fillPercent}%` }}
          />
        </div>
      </div>

      {/* Incident badge */}
      {activeIncident && (
        <div className="mt-2 flex items-center gap-1 px-2 py-1 rounded-md bg-accent-red/15 text-accent-red text-[10px] font-semibold">
          <AlertTriangle className="w-3 h-3" />
          <span className="truncate">{incidentType || 'Incident'}</span>
        </div>
      )}

      {/* Priority indicator dot */}
      <div className={`absolute top-2 left-2 w-1.5 h-1.5 rounded-full ${priority.bg}`} />

      {/* Popover */}
      {showPopover && (
        <>
          <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowPopover(false); }} />
          <div 
            className="absolute top-[calc(100%+8px)] left-0 w-64 z-50 glass border border-white/10 rounded-xl p-4 shadow-2xl animate-fade-in" 
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setShowPopover(false)} className="absolute top-2 right-2 p-1 rounded-md hover:bg-white/10 text-text-secondary">
              <X className="w-4 h-4" />
            </button>
            <h4 className="font-semibold text-text-primary text-sm pr-6 mb-2">{name}</h4>
            
            {hasFitnessWarning && (
              <div className="mb-3 p-2 rounded bg-accent-red/10 border border-accent-red/20 text-[10px] text-accent-red font-medium flex gap-1.5 items-start">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <p>⚠️ {lowFitnessVolunteers} deployed volunteers unfit for Ghat duty</p>
              </div>
            )}

            <div className="text-[11px] text-text-secondary space-y-1.5 mb-4">
              <p className="flex justify-between"><span>Type:</span> <span className="text-text-primary font-medium">{type}</span></p>
              <p className="flex justify-between"><span>Required Skill:</span> <span className="text-text-primary font-medium">{requiredSkill || 'General'}</span></p>
              <p className="flex justify-between"><span>Priority:</span> <span className={`font-semibold ${priority.text}`}>{priorityLevel}</span></p>
              <p className="flex justify-between"><span>Volunteers:</span> <span className="text-text-primary font-medium">{volunteersDeployed} / {volunteersRequired}</span></p>
            </div>
            <button 
              onClick={handleDeploy}
              className="w-full py-1.5 rounded-lg bg-primary/20 text-primary border border-primary/30 text-xs font-semibold hover:bg-primary/30 transition-colors flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Deploy Here (1)
            </button>
          </div>
        </>
      )}
    </div>
  );
}
