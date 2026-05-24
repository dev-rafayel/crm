import styles from './style';

function buildPageItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => ({
      type: 'page',
      value: i + 1,
    }));
  }

  const items = [];
  const addPage = (p) => items.push({ type: 'page', value: p });

  addPage(1);

  const rangeStart = Math.max(2, currentPage - 1);
  const rangeEnd = Math.min(totalPages - 1, currentPage + 1);

  if (rangeStart > 2) {
    items.push({ type: 'ellipsis' });
  }

  for (let p = rangeStart; p <= rangeEnd; p += 1) {
    addPage(p);
  }

  if (rangeEnd < totalPages - 1) {
    items.push({ type: 'ellipsis' });
  }

  if (totalPages > 1) {
    addPage(totalPages);
  }

  return items;
}

export default function Pagination({ pagination, onPageChange, loading }) {
  const { currentPage, totalPages, totalItems } = pagination;

  if (!totalItems) return null;

  const items = buildPageItems(currentPage, totalPages);

  return (
    <div style={styles.pagination}>
      <button
        type="button"
        className="crm-btn-secondary"
        style={{
          ...styles.pageBtn,
          ...(currentPage <= 1 || loading ? styles.pageBtnDisabled : {}),
        }}
        disabled={currentPage <= 1 || loading}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Back
      </button>

      {items.map((item, idx) =>
        item.type === 'ellipsis' ? (
          <span key={`ellipsis-${idx}`} style={styles.pageEllipsis}>
            …
          </span>
        ) : (
          <button
            key={item.value}
            type="button"
            className={item.value === currentPage ? '' : 'crm-btn-secondary'}
            style={{
              ...styles.pageBtn,
              ...(item.value === currentPage ? styles.pageBtnActive : {}),
              ...(loading ? styles.pageBtnDisabled : {}),
            }}
            disabled={loading}
            onClick={() => onPageChange(item.value)}
          >
            {item.value}
          </button>
        ),
      )}

      <button
        type="button"
        className="crm-btn-secondary"
        style={{
          ...styles.pageBtn,
          ...(currentPage >= totalPages || loading ? styles.pageBtnDisabled : {}),
        }}
        disabled={currentPage >= totalPages || loading}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Forward
      </button>

      <span style={styles.paginationInfo}>
        Page {currentPage} of {totalPages} · {totalItems} total
      </span>
    </div>
  );
}
