import { apiRequest } from './client.js';

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
