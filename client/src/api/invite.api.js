import { apiRequest } from './client.js';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function getInvites() {
  return apiRequest('/auth/invites');
}

export async function sendInvite({ email, role }) {
  return apiRequest('/auth/invite', {
    method: 'POST',
    body: JSON.stringify({ email, role }),
  });
}

export async function registerByInvite({ token, firstName, lastName, phone, password }) {
  const res = await fetch(`${API_URL}/auth/register-by-invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, firstName, lastName, phone, password }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) {
    const err = new Error(json.message || 'Registration failed');
    err.details = json.details;
    throw err;
  }

  return json.data;
}
