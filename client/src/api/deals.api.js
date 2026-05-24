import { apiRequest, apiRequestPaginated } from './client.js';

function normalizeDeal(deal) {
  if (!deal) return deal;
  const createdAt = deal.createdAt
    ? new Date(deal.createdAt).toISOString()
    : deal.date
      ? new Date(deal.date).toISOString()
      : new Date().toISOString();

  return {
    ...deal,
    id: deal.id || deal._id?.toString?.() || deal._id,
    _id: deal._id?.toString?.() || deal._id || deal.id,
    createdAt,
    date: deal.date ? new Date(deal.date).toISOString() : createdAt,
  };
}

export async function getDeals(stage, all = false, { page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams();
  if (stage) params.set('stage', stage);
  if (all) {
    params.set('all', 'true');
    const data = await apiRequest(`/deals?${params}`);
    return data.map(normalizeDeal);
  }
  params.set('page', String(page));
  params.set('limit', String(limit));
  const { data } = await apiRequestPaginated(`/deals?${params}`);
  return data.map(normalizeDeal);
}

const KANBAN_PAGE_SIZE = 20;

export async function getKanbanDealsByStage(
  stage,
  { page = 1, limit = KANBAN_PAGE_SIZE, afterId } = {},
) {
  const params = new URLSearchParams({
    kanban: 'true',
    stage,
    limit: String(limit),
  });
  if (afterId) {
    params.set('afterId', afterId);
  } else {
    params.set('page', String(page));
  }
  const data = await apiRequest(`/deals?${params}`);
  const payload = data?.deals ? data : { stage, deals: Array.isArray(data) ? data : [], hasMore: false };

  return {
    stage: payload.stage ?? stage,
    deals: (payload.deals || []).map(normalizeDeal),
    hasMore: Boolean(payload.hasMore),
  };
}

export { KANBAN_PAGE_SIZE };

export async function getDealsPaginated(stage, { page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (stage) params.set('stage', stage);
  const { data, pagination } = await apiRequestPaginated(`/deals?${params}`);
  return {
    deals: data.map(normalizeDeal),
    pagination,
  };
}

export async function getDealById(id) {
  const data = await apiRequest(`/deals/${id}`);
  return normalizeDeal(data);
}

export async function createDeal(data) {
  const result = await apiRequest('/deals', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return normalizeDeal(result);
}

export async function updateDeal(id, data) {
  const result = await apiRequest(`/deals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return normalizeDeal(result);
}

export async function deleteDeal(id) {
  const result = await apiRequest(`/deals/${id}`, {
    method: 'DELETE',
  });
  return normalizeDeal(result);
}
