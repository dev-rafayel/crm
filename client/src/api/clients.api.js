import { apiRequest, apiRequestPaginated } from './client.js';

export async function getClients({ page = 1, limit = 20, filter, search } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (filter && filter !== 'all') params.set('filter', filter);
  if (search?.trim()) params.set('search', search.trim());

  const { data, pagination } = await apiRequestPaginated(`/clients?${params}`);
  return { clients: data, pagination };
}

/** All clients for selects (e.g. deal form) — capped on server by max limit. */
export async function getClientsForSelect() {
  const { clients } = await getClients({ page: 1, limit: 100 });
  return clients;
}

export async function getClientById(id) {
  return apiRequest(`/clients/${id}`);
}

export async function createClient(data) {
  return apiRequest('/clients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateClient(id, data) {
  return apiRequest(`/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteClient(id) {
  return apiRequest(`/clients/${id}`, {
    method: 'DELETE',
  });
}
