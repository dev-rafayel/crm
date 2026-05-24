import { columnConfig } from '../../dealStages.js';

export const KANBAN_STAGES = Object.keys(columnConfig);

export function createInitialBoardData() {
  return KANBAN_STAGES.reduce((acc, stage) => {
    acc[stage] = {
      items: [],
      cursorId: null,
      hasMore: true,
      loading: false,
      loadingMore: false,
    };
    return acc;
  }, {});
}

export function normalizeDealId(deal) {
  if (!deal) return '';
  const raw = deal._id ?? deal.id;
  if (raw == null) return '';
  if (typeof raw === 'object' && raw.toString) return String(raw.toString());
  return String(raw);
}

export function getDealId(deal) {
  return normalizeDealId(deal);
}

/** Id of the oldest loaded deal in a desc-sorted column (anchor for next page). */
export function getColumnCursorId(deal) {
  const id = normalizeDealId(deal);
  return id || null;
}

export function dedupeDeals(items) {
  const seen = new Set();
  const out = [];
  for (const deal of items) {
    const id = normalizeDealId(deal);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(deal);
  }
  return out;
}

export function appendUniqueDeals(existing, incoming) {
  return dedupeDeals([...existing, ...incoming]);
}

export function colTotal(items) {
  return items.reduce((sum, d) => sum + (d.amount || 0), 0);
}
