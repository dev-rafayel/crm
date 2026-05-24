import {
  useState,
  useEffect,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import styles from './style';
import fmt from '../../fmt';
import { getKanbanDealsByStage, updateDeal } from '../../api/deals.api.js';
import { columnConfig } from '../../dealStages.js';
import KanbanColumn from './KanbanColumn.jsx';
import {
  KANBAN_STAGES,
  createInitialBoardData,
  getDealId,
  getColumnCursorId,
  appendUniqueDeals,
  dedupeDeals,
  colTotal,
} from './kanbanBoard.js';

const KanbanBoard = forwardRef(function KanbanBoard(
  { onDealClick, refreshKey = 0 },
  ref,
) {
  const [boardData, setBoardData] = useState(createInitialBoardData);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const loadingMoreStagesRef = useRef(new Set());

  const fetchStagePage = useCallback(async (stage, { page = 1, afterId } = {}) => {
    const { deals, hasMore } = await getKanbanDealsByStage(stage, { page, afterId });
    return { deals, hasMore };
  }, []);

  const loadInitialBoard = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        KANBAN_STAGES.map((stage) => fetchStagePage(stage, { page: 1 })),
      );

      const next = createInitialBoardData();
      KANBAN_STAGES.forEach((stage, index) => {
        const { deals, hasMore } = results[index];
        const items = dedupeDeals(deals);
        const last = items[items.length - 1];
        next[stage] = {
          items,
          cursorId: getColumnCursorId(last),
          hasMore,
          loading: false,
          loadingMore: false,
        };
      });

      setBoardData(next);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fetchStagePage]);

  useEffect(() => {
    loadInitialBoard();
  }, [loadInitialBoard, refreshKey]);

  const upsertDeal = useCallback((deal, { removeId } = {}) => {
    setBoardData((prev) => {
      const next = { ...prev };
      KANBAN_STAGES.forEach((stage) => {
        let items = prev[stage].items.filter(
          (d) =>
            getDealId(d) !== removeId &&
            getDealId(d) !== getDealId(deal),
        );
        if (stage === deal.stage) {
          items = [deal, ...items];
        }
        next[stage] = { ...prev[stage], items };
      });
      return next;
    });
  }, []);

  const removeDeal = useCallback((id) => {
    setBoardData((prev) => {
      const next = { ...prev };
      KANBAN_STAGES.forEach((stage) => {
        next[stage] = {
          ...prev[stage],
          items: prev[stage].items.filter((d) => getDealId(d) !== id),
        };
      });
      return next;
    });
  }, []);

  useImperativeHandle(ref, () => ({ upsertDeal, removeDeal, reload: loadInitialBoard }), [
    upsertDeal,
    removeDeal,
    loadInitialBoard,
  ]);

  const handleLoadMore = useCallback(async (stage) => {
    if (loadingMoreStagesRef.current.has(stage)) return;

    let afterId = null;

    setBoardData((prev) => {
      const col = prev[stage];
      if (!col.hasMore || col.loadingMore || !col.cursorId) {
        return prev;
      }
      afterId = col.cursorId;
      return {
        ...prev,
        [stage]: { ...col, loadingMore: true },
      };
    });

    if (!afterId) return;

    loadingMoreStagesRef.current.add(stage);

    try {
      const { deals, hasMore } = await getKanbanDealsByStage(stage, { afterId });
      setBoardData((current) => {
        const col = current[stage];
        const items = appendUniqueDeals(col.items, deals);
        const last = items[items.length - 1];
        return {
          ...current,
          [stage]: {
            ...col,
            items,
            cursorId: getColumnCursorId(last),
            hasMore,
            loadingMore: false,
          },
        };
      });
    } catch (err) {
      console.error(err);
      setBoardData((current) => ({
        ...current,
        [stage]: { ...current[stage], loadingMore: false },
      }));
    } finally {
      loadingMoreStagesRef.current.delete(stage);
    }
  }, []);

  const handleDragStart = (dealId, fromCol) => setDragging({ dealId, fromCol });

  const handleDragEnd = () => {
    setDragging(null);
    setDragOver(null);
  };

  const handleDrop = async (toCol) => {
    if (!dragging || dragging.fromCol === toCol) {
      handleDragEnd();
      return;
    }

    const { dealId, fromCol } = dragging;
    let movedDeal = null;

    setBoardData((prev) => {
      const sourceCol = prev[fromCol];
      movedDeal = sourceCol.items.find((d) => getDealId(d) === dealId);
      if (!movedDeal) return prev;

      const updatedDeal = { ...movedDeal, stage: toCol };
      return {
        ...prev,
        [fromCol]: {
          ...sourceCol,
          items: sourceCol.items.filter((d) => getDealId(d) !== dealId),
        },
        [toCol]: {
          ...prev[toCol],
          items: [updatedDeal, ...prev[toCol].items],
        },
      };
    });

    handleDragEnd();

    if (!movedDeal) return;

    try {
      await updateDeal(dealId, { stage: toCol });
    } catch (err) {
      console.error(err);
      loadInitialBoard();
    }
  };

  const totalDeals = KANBAN_STAGES.reduce(
    (sum, stage) => sum + boardData[stage].items.length,
    0,
  );
  const totalAmount = KANBAN_STAGES.reduce(
    (sum, stage) => sum + colTotal(boardData[stage].items),
    0,
  );

  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
        Loading board…
      </div>
    );
  }

  return (
    <>
      <p style={styles.subheading}>
        {totalDeals} deals loaded · Total volume {fmt(totalAmount)}
      </p>

      <div style={styles.summaryRow}>
        {KANBAN_STAGES.map((stageKey) => {
          const meta = columnConfig[stageKey];
          const col = boardData[stageKey];
          return (
            <div key={stageKey} style={styles.summaryItem}>
              <div style={{ ...styles.summaryDot, background: meta.color }} />
              <span style={styles.summaryLabel}>{meta.title}</span>
              <span style={{ ...styles.summaryVal, color: meta.color }}>
                {fmt(colTotal(col.items))}
              </span>
            </div>
          );
        })}
      </div>

      <div style={styles.board}>
        {KANBAN_STAGES.map((stageKey) => (
          <KanbanColumn
            key={stageKey}
            stageKey={stageKey}
            columnMeta={columnConfig[stageKey]}
            columnState={boardData[stageKey]}
            dragOver={dragOver}
            dragging={dragging}
            onDragOver={setDragOver}
            onDragLeave={() => setDragOver(null)}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDealClick={onDealClick}
            onLoadMore={handleLoadMore}
          />
        ))}
      </div>
    </>
  );
});

export default KanbanBoard;
