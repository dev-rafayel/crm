import { apiRequest } from './client.js';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function getUsers() {
  return apiRequest('/users');
}

export async function getUserById(id) {
  return apiRequest(`/users/${id}`);
}

export async function updateUserStatus(id, status) {
  return apiRequest(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function deleteUser(id) {
  return apiRequest(`/users/${id}`, {
    method: 'DELETE',
  });
}

export async function register({ firstName, lastName, email, phone, password }) {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName, email, phone, password }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    const err = new Error(json.message || 'Registration failed');
    err.details = json.details;
    throw err;
  }

  return json.data;
}
