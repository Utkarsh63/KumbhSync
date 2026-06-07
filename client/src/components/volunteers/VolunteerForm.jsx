import { useState, useEffect } from 'react';
import { UserPlus, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import toast from 'react-hot-toast';

const SKILLS = ['Medical', 'CrowdControl', 'Translation', 'Swimmer', 'Sanitation', 'General'];

export default function VolunteerForm({ onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    age: '',
    primarySkill: 'General',
    shiftTiming: '06:00 AM - 02:00 PM',
    currentSector: '1',
  });
  const [loading, setLoading] = useState(false);
  const [registeredVolunteer, setRegisteredVolunteer] = useState(null);
  const [sectors, setSectors] = useState([]);

  useEffect(() => {
    api.getSectors().then(data => {
      setSectors(Array.isArray(data) ? data : data.sectors || []);
    }).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim() || !form.age) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const data = await api.createVolunteer({
        name: form.name.trim(),
        phone: form.phone.trim(),
        age: Number(form.age),
        primarySkill: form.primarySkill,
        shiftTiming: form.shiftTiming,
        currentSector: Number(form.currentSector),
      });

      toast.success('Volunteer registered successfully!', {
        icon: '🎉',
      });

      // Show success screen
      setRegisteredVolunteer({
        id: data.id,
        name: data.name,
        currentSector: data.currentSector,
      });

      onSuccess?.();
    } catch (err) {
      toast.error(err.message || 'Failed to register volunteer');
    } finally {
      setLoading(false);
    }
  };

  if (registeredVolunteer) {
    return (
      <div className="rounded-xl glass border border-white/5 p-6 animate-fade-in text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-accent-green/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-accent-green" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">✅ Registration Successful!</h2>
        
        <div className="space-y-2 mb-6 text-sm text-text-secondary">
          <p>Your Volunteer ID: <span className="font-mono text-white font-semibold">KS-2024-{String(registeredVolunteer.id).padStart(3, '0')}</span></p>
          <p>Current Location: Sector {registeredVolunteer.currentSector}</p>
          <p>Status: <span className="text-accent-blue font-semibold">Standby</span> — await deployment instructions</p>
        </div>

        <div className="bg-white text-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-200 text-left mb-6 relative">
          <div className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-widest text-gray-400">Notification Preview</div>
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
            <span className="text-sm">📱</span>
            <span className="text-xs font-bold text-gray-700 uppercase">SMS sent to {form.phone}</span>
          </div>
          <div className="p-4 bg-gray-50 font-mono text-xs leading-relaxed text-gray-800">
            "Welcome to KumbhSync Seva!<br/>
            Your ID: KS-2024-{String(registeredVolunteer.id).padStart(3, '0')}<br/>
            You are registered at Sector {registeredVolunteer.currentSector}.<br/>
            Stay alert for deployment orders.<br/>
            - Maha Kumbh Mela Authority"
          </div>
        </div>

        <button
          onClick={() => {
            setRegisteredVolunteer(null);
            setForm({
              name: '', phone: '', age: '', primarySkill: 'General', shiftTiming: '06:00 AM - 02:00 PM', currentSector: '1'
            });
          }}
          className="w-full py-3 rounded-lg bg-white/5 hover:bg-white/10 text-text-primary font-semibold transition-colors"
        >
          Register Another Volunteer
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl glass border border-white/5 p-6">
      <div className="flex items-center gap-2 mb-5">
        <UserPlus className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-text-primary">Register Volunteer</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter volunteer name"
            required
            className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91 XXXXX XXXXX"
            required
            className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
          />
          <p className="text-[10px] text-text-secondary mt-1.5 flex items-center gap-1 opacity-80">
            📱 You will receive SMS alerts when deployed to a sector
          </p>
        </div>

        {/* Age */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            Age
          </label>
          <input
            type="number"
            name="age"
            value={form.age}
            onChange={handleChange}
            placeholder="25"
            min="16"
            max="80"
            required
            className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
          />
        </div>

        {/* Primary Skill */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            Primary Skill
          </label>
          <select
            name="primarySkill"
            value={form.primarySkill}
            onChange={handleChange}
            className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-text-primary text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
          >
            {SKILLS.map((skill) => (
              <option key={skill} value={skill} className="bg-bg-card">
                {skill}
              </option>
            ))}
          </select>
        </div>

        {/* Shift Timing */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            Shift Timing
          </label>
          <input
            type="text"
            name="shiftTiming"
            value={form.shiftTiming}
            onChange={handleChange}
            placeholder="08:00 AM - 04:00 PM"
            className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
          />
        </div>

        {/* Current Sector */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            Current Sector
          </label>
          <select
            name="currentSector"
            value={form.currentSector}
            onChange={handleChange}
            className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-text-primary text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
          >
            {sectors.length > 0 ? sectors.map((s) => (
              <option key={s.id} value={s.id} className="bg-bg-card">
                Sector {s.id} - {s.name}
              </option>
            )) : Array.from({ length: 25 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num} className="bg-bg-card">
                Sector {num}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-primary-light text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Registering...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Register Volunteer
            </>
          )}
        </button>
      </form>
    </div>
  );
}
