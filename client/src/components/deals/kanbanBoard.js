import { columnConfig } from '../../dealStages.js';

export const KANBAN_STAGES = Object.keys(columnConfig);

export function createInitialBoardData() {
  return KANBAN_STAGES.reduce((acc, stage) => {
    acc[stage] = {
      items: [],
      page: 1,
      hasMore: true,
      loading: false,
      loadingMore: false,
    };
    return acc;
  }, {});
}

export function getDealId(deal) {
  return deal._id || deal.id;
}

export function colTotal(items) {
  return items.reduce((sum, d) => sum + (d.amount || 0), 0);
}
