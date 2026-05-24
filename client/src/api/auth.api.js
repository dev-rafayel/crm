import { apiRequest, setTokens, clearTokens } from './client.js';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    const err = new Error(json.message || 'Login failed');
    err.details = json.details;
    throw err;
  }

  setTokens({
    accessToken: json.data.accessToken,
    refreshToken: json.data.refreshToken,
  });

  return json.data.user;
}

export async function getMe() {
  return apiRequest('/auth/me');
}

export async function logout() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // ignore — tokens cleared locally anyway
    }
  }
  clearTokens();
}
