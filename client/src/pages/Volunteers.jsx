import { useState, useCallback } from 'react';
import VolunteerForm from '../components/volunteers/VolunteerForm.jsx';
import VolunteerList from '../components/volunteers/VolunteerList.jsx';

export default function Volunteers() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFormSuccess = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Volunteer Management</h1>
        <p className="text-sm text-text-secondary mt-1">Register and manage volunteers deployed across sectors</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form — 1 col on lg */}
        <div className="lg:col-span-1">
          <VolunteerForm onSuccess={handleFormSuccess} />
        </div>

        {/* List — 2 cols on lg */}
        <div className="lg:col-span-2">
          <VolunteerList refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
}
