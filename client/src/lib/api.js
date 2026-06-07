const API_BASE = `${import.meta.env.VITE_API_URL || ''}/api`;

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || `HTTP ${response.status}`);
  }
  return data;
}

export const api = {
  // Volunteers
  getVolunteers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE}/volunteers?${query}` : `${API_BASE}/volunteers`;
    return fetch(url).then(handleResponse);
  },

  getVolunteer: (id) =>
    fetch(`${API_BASE}/volunteers/${id}`).then(handleResponse),

  getVolunteerStats: () =>
    fetch(`${API_BASE}/volunteers/stats`).then(handleResponse),

  createVolunteer: (data) =>
    fetch(`${API_BASE}/volunteers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateVolunteer: (id, data) =>
    fetch(`${API_BASE}/volunteers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteVolunteer: (id) =>
    fetch(`${API_BASE}/volunteers/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),

  deployVolunteer: (id, sectorId, task) =>
    fetch(`${API_BASE}/volunteers/${id}/deploy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectorId, task }),
    }).then(handleResponse),

  // Sectors
  getSectors: () =>
    fetch(`${API_BASE}/sectors`).then(handleResponse),

  getSector: (id) =>
    fetch(`${API_BASE}/sectors/${id}`).then(handleResponse),

  // Deployments
  getDeployments: () =>
    fetch(`${API_BASE}/deployments`).then(handleResponse),

  deploy: (data) =>
    fetch(`${API_BASE}/deploy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  completeDeployment: (id) =>
    fetch(`${API_BASE}/deployments/${id}/complete`, {
      method: 'POST',
    }).then(handleResponse),

  // Incidents
  simulateIncident: (data) =>
    fetch(`${API_BASE}/sectors/${data.sectorId}/incident`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incidentType: data.type,
        volunteersNeeded: data.volunteersNeeded,
      }),
    }).then(handleResponse),

  // Reset
  resetSystem: () =>
    fetch(`${API_BASE}/sectors/reset`, { method: 'PATCH' }).then(handleResponse),
};
