import { useState, useEffect } from 'react';
import { X, Phone, User, Activity, MapPin, HeartPulse, Award } from 'lucide-react';
import { api } from '../../lib/api.js';

export default function ProfileDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleOpenProfile = async (e) => {
      const vid = e.detail;
      setIsOpen(true);
      setLoading(true);
      try {
        const data = await api.getVolunteer(vid);
        setVolunteer(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    window.addEventListener('open-profile', handleOpenProfile);
    return () => window.removeEventListener('open-profile', handleOpenProfile);
  }, []);

  const fatigueColor = (level) => {
    if (level >= 61) return 'bg-accent-red';
    if (level >= 31) return 'bg-accent-amber';
    return 'bg-accent-green';
  };

  const statusColors = {
    Available: 'bg-accent-green/15 text-accent-green border-accent-green/20',
    Deployed: 'bg-accent-blue/15 text-accent-blue border-accent-blue/20',
    Resting: 'bg-accent-amber/15 text-accent-amber border-accent-amber/20',
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150]"
        onClick={() => setIsOpen(false)}
      />
      <div 
        className={`fixed top-0 right-0 h-full w-80 glass-heavy border-l border-white/10 z-[200] transform transition-transform duration-300 flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Volunteer Profile
          </h2>
          <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-white/5 rounded w-3/4"></div>
              <div className="h-4 bg-white/5 rounded w-1/2"></div>
              <div className="h-20 bg-white/5 rounded mt-6"></div>
            </div>
          ) : volunteer ? (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h3 className="text-2xl font-bold text-text-primary mb-1">{volunteer.name}</h3>
                <span className={`inline-flex px-2 py-0.5 rounded border text-xs font-semibold ${statusColors[volunteer.status]}`}>
                  {volunteer.status}
                </span>
              </div>

              {/* Action */}
              <button 
                onClick={() => window.open(`tel:${volunteer.phone}`)}
                className="w-full py-2.5 rounded-lg bg-accent-blue/15 text-accent-blue border border-accent-blue/30 font-semibold text-sm hover:bg-accent-blue/25 transition-colors flex justify-center items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call {volunteer.phone}
              </button>

              {/* Details */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <User className="w-4 h-4" /> Age
                  </div>
                  <span className="text-text-primary font-medium">{volunteer.age}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <Award className="w-4 h-4" /> Skill
                  </div>
                  <span className="text-text-primary font-medium">{volunteer.primarySkill}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <HeartPulse className="w-4 h-4" /> Fitness
                  </div>
                  <span className="text-text-primary font-medium">
                    {volunteer.fitnessLevel === 'High' ? '💪 High' : volunteer.fitnessLevel === 'Medium' ? '🏃 Med' : '🪑 Low'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <MapPin className="w-4 h-4" /> Sector
                  </div>
                  <span className="text-text-primary font-medium">S{volunteer.currentSector}</span>
                </div>
              </div>

              {/* Fatigue */}
              <div className="pt-4 border-t border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <Activity className="w-4 h-4" /> Fatigue Level
                  </div>
                  <span className="text-text-primary font-mono text-sm">{volunteer.fatigueScore || 0}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${fatigueColor(volunteer.fatigueScore || 0)}`}
                    style={{ width: `${volunteer.fatigueScore || 0}%` }}
                  />
                </div>
              </div>

              {/* Notification History Preview */}
              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Notification Preview
                  </span>
                </div>
                <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/5 before:to-transparent">
                  {volunteer.deployments?.map((d) => (
                    <div key={d.id} className="relative pl-6">
                      <div className="absolute left-0 w-4 h-4 rounded-full bg-accent-blue/20 border-2 border-bg-card flex items-center justify-center -translate-x-1.5 mt-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
                      </div>
                      <div className="bg-white/5 rounded-xl border border-white/10 p-3 relative group">
                        <div className="text-[10px] text-text-secondary mb-1">
                          {new Date(d.deployedAt).toLocaleString()}
                        </div>
                        <div className="text-[11px] font-mono text-text-primary leading-relaxed bg-black/20 p-2 rounded border border-white/5">
                          "URGENT: Report to Sector {d.sector?.name || d.sectorId} immediately.
                          {d.reason?.includes('Incident') ? ' Incident declared.' : ' Deployment active.'}
                          Show ID: KS-2024-{String(volunteer.id).padStart(3, '0')}
                          - KumbhSync Command Center"
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="relative pl-6">
                    <div className="absolute left-0 w-4 h-4 rounded-full bg-accent-green/20 border-2 border-bg-card flex items-center justify-center -translate-x-1.5 mt-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                    </div>
                    <div className="bg-white/5 rounded-xl border border-white/10 p-3 relative group">
                      <div className="text-[10px] text-text-secondary mb-1">
                        {new Date(volunteer.createdAt).toLocaleString()}
                      </div>
                      <div className="text-[11px] font-mono text-text-primary leading-relaxed bg-black/20 p-2 rounded border border-white/5">
                        "Welcome to KumbhSync Seva!
                        Your ID: KS-2024-{String(volunteer.id).padStart(3, '0')}
                        You are registered at Sector {volunteer.currentSector}.
                        Stay alert for deployment orders.
                        - Maha Kumbh Mela Authority"
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-text-secondary py-10">Volunteer not found</div>
          )}
        </div>
      </div>
    </>
  );
}
