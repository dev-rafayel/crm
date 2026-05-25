import styles from './style';
import fmt from '../../fmt';
import { colTotal } from './kanbanBoard.js';

export default function KanbanColumn({
  stageKey,
  columnMeta,
  columnState,
  dragOver,
  dragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onDragEnd,
  onDealClick,
  onLoadMore,
}) {
  const { title, color } = columnMeta;
  const { items, hasMore, loadingMore } = columnState;

  return (
    <div
      style={{
        ...styles.column,
        borderTop: `3px solid ${color}`,
        background: dragOver ? '#F0F9FF' : '#F8F9FB',
      }}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(stageKey);
      }}
      onDrop={() => onDrop(stageKey)}
      onDragLeave={onDragLeave}
    >
      <div style={styles.colHeader}>
        <div style={styles.colLeft}>
          <span style={styles.colTitle}>{title}</span>
          <span
            style={{
              ...styles.colCount,
              background: `${color}22`,
              color,
            }}
          >
            {items.length}
          </span>
        </div>
        <span style={styles.colTotal}>{fmt(colTotal(items))}</span>
      </div>

      <div style={styles.cardsList}>
        {items.map((deal) => {
          const dealId = deal._id || deal.id;
          return (
            <div
              key={dealId}
              draggable
              onDragStart={() => onDragStart(dealId, stageKey)}
              onDragEnd={onDragEnd}
              onClick={() => onDealClick(dealId)}
              className="crm-deal-card"
              data-stage={stageKey}
              style={{
                ...styles.dealCard,
                opacity: dragging?.dealId === dealId ? 0.4 : 1,
                cursor: 'pointer',
              }}
            >
              <p style={styles.dealName}>{deal.name}</p>
              <p style={styles.clientName}>{deal.clientName}</p>
              <p style={styles.managerName}>{deal.managerName || 'Unassigned'}</p>
              <div style={styles.dealFooter}>
                <span style={{ ...styles.dealAmount, color }}>
                  {fmt(deal.amount)}
                </span>
                <span style={styles.dealDate}>
                  {new Date(deal.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          );
        })}

        {dragOver && dragging?.fromCol !== stageKey && (
          <div
            style={{
              ...styles.dropZone,
              borderColor: color,
              color,
            }}
          >
            Drop here
          </div>
        )}

        {hasMore && (
          <button
            type="button"
            className="crm-btn-secondary"
            style={styles.loadMoreBtn}
            onClick={() => onLoadMore(stageKey)}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        )}
      </div>
    </div>
  );
}
