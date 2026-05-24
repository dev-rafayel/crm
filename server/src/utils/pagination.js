const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function parsePaginationQuery(query = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number.parseInt(query.limit, 10) || DEFAULT_LIMIT),
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function buildPaginationMeta(totalItems, page, limit) {
  const safeTotal = Math.max(0, totalItems);
  const totalPages = safeTotal === 0 ? 1 : Math.ceil(safeTotal / limit);

  return {
    totalItems: safeTotal,
    totalPages,
    currentPage: Math.min(page, totalPages),
  };
}
