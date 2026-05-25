import { apiRequest, setTokens, clearTokens } from './client.js';

export const API_URL = import.meta.env.VITE_API_URL || '/api';

async function parsePublicAuthResponse(res) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    const err = new Error(json.message || 'Request failed');
    err.details = json.details;
    throw err;
  }
  return json;
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const json = await parsePublicAuthResponse(res);

  setTokens({
    accessToken: json.data.accessToken,
    refreshToken: json.data.refreshToken,
  });

  return json.data.user;
}

export async function requestPasswordReset(email) {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim() }),
  });
  const json = await parsePublicAuthResponse(res);
  return json.message;
}

export async function resetPasswordWithCode({ email, code, password }) {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.trim(),
      code: String(code).trim(),
      password,
    }),
  });
  const json = await parsePublicAuthResponse(res);
  return json.message;
}

export async function verifyPasswordResetCode({ email, code }) {
  const res = await fetch(`${API_URL}/auth/verify-reset-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.trim(),
      code: String(code).trim(),
    }),
  });
  const json = await parsePublicAuthResponse(res);
  return json.message;
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
