import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, Radio, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useSocket } from '../../hooks/useSocket.js';

export default function DeploymentFeed() {
  const [items, setItems] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchDeployments = async () => {
      try {
        const data = await api.getDeployments();
        const deployments = Array.isArray(data) ? data : data.deployments || [];
        const feedItems = deployments.slice(-50).map((d) => ({
          id: d._id || d.id || Math.random().toString(36),
          volunteerId: d.volunteerId || d.volunteer?.id,
          volunteerName: d.volunteerName || d.volunteer?.name,
          timestamp: d.createdAt || d.timestamp || new Date().toISOString(),
          message: formatDeploymentMessage(d),
          type: d.status === 'Completed' ? 'completed' : 'active',
        }));
        setItems(feedItems);
      } catch (err) {
        console.error('Failed to fetch deployments:', err);
      }
    };
    fetchDeployments();
  }, []);

  const addFeedItem = useCallback((data) => {
    const newItem = {
      id: data._id || data.id || Date.now().toString(),
      volunteerId: data.volunteerId || data.volunteer?.id,
      volunteerName: data.volunteerName || data.volunteer?.name,
      timestamp: data.createdAt || data.timestamp || new Date().toISOString(),
      message: data.message || formatDeploymentMessage(data),
      type: 'new',
    };
    setItems((prev) => [...prev.slice(-49), newItem]);
  }, []);

  const addReroutedFeedItem = useCallback((data) => {
    const name = data.volunteerName || data.volunteer?.name || 'Volunteer';
    const from = data.fromSector || '?';
    const to = data.toSector || data.sectorId || '?';
    const newItem = {
      id: data._id || data.id || Date.now().toString(),
      volunteerId: data.volunteerId || data.volunteer?.id,
      volunteerName: name,
      timestamp: data.createdAt || data.timestamp || new Date().toISOString(),
      message: `🔄 ${name} RE-ROUTED from S${from} (low priority) → S${to} (CRITICAL)`,
      type: 'rerouted',
    };
    setItems((prev) => [...prev.slice(-49), newItem]);
  }, []);

  useSocket('deployment:feed', addFeedItem);
  useSocket('deployment:new', addFeedItem);
  useSocket('deployment:issued', addFeedItem);
  useSocket('volunteer:rerouted', addReroutedFeedItem);
  useSocket('system:reset', () => setItems([]));

  useEffect(() => {
    const onReset = () => setItems([]);
    window.addEventListener('app:reset', onReset);
    return () => window.removeEventListener('app:reset', onReset);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [items]);

  function formatDeploymentMessage(d) {
    if (d.message) return d.message;
    const name = d.volunteerName || d.volunteer?.name || 'Volunteer';
    const from = d.fromSector || d.fromSectorId || '?';
    const to = d.toSector || d.toSectorId || d.sectorId || '?';
    const reason = d.reason ? ` (${d.reason})` : '';
    return `Deploying ${name} from Sector ${from} → Sector ${to}${reason}`;
  }

  function formatTime(iso) {
    try {
      return new Date(iso).toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    } catch {
      return '--:--:--';
    }
  }

  return (
    <div className="rounded-xl glass border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radio className="w-4 h-4 text-accent-green" />
            <div className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-dot" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary">Live Feed</h3>
        </div>
        <span className="text-[10px] text-text-secondary">{items.length} events</span>
      </div>

      {/* Feed */}
      <div
        ref={scrollRef}
        className="max-h-[400px] overflow-y-auto px-3 py-2 space-y-1.5"
      >
        {items.length === 0 ? (
          <div className="text-center py-12 text-accent-green font-medium text-sm flex flex-col items-center gap-2">
            <span className="text-2xl">✓</span>
            All sectors operating normally
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={item.id + '-' + index}
              className={`flex items-start gap-2.5 px-3 py-2 rounded-lg transition-colors animate-slide-in-right ${
                item.type === 'rerouted' 
                  ? 'bg-accent-amber/10 hover:bg-accent-amber/20' 
                  : 'bg-white/[0.02] hover:bg-white/5'
              }`}
              style={{ animationDelay: `${Math.min(index * 20, 200)}ms` }}
            >
              {item.type === 'rerouted' ? (
                <RefreshCw className="w-3.5 h-3.5 text-accent-amber shrink-0 mt-0.5" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5 text-accent-green shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-primary leading-relaxed break-words">
                  {item.volunteerName && item.message.includes(item.volunteerName) && item.volunteerId ? (
                    <>
                      {item.message.split(item.volunteerName)[0]}
                      <button 
                        onClick={() => window.dispatchEvent(new CustomEvent('open-profile', { detail: item.volunteerId }))}
                        className="font-bold text-primary hover:underline focus:outline-none"
                      >
                        {item.volunteerName}
                      </button>
                      {item.message.split(item.volunteerName).slice(1).join(item.volunteerName)}
                    </>
                  ) : (
                    item.message
                  )}
                </p>
                <span className="text-[10px] text-text-secondary mt-0.5 block">
                  {formatTime(item.timestamp)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
