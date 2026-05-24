import { useState, useEffect, useRef } from 'react';
import styles from './style';
import { createDeal } from '../../api/deals.api.js';
import { getClientsForSelect } from '../../api/clients.api.js';
import DealDetail from './dealDetail.jsx';
import KanbanBoard from './KanbanBoard.jsx';
import { columnConfig } from '../../dealStages.js';
import { getDealId } from './kanbanBoard.js';

export default function Deals() {
  const kanbanRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [viewMode, setViewMode] = useState('board');
  const [selectedDealId, setSelectedDealId] = useState(null);
  const [boardRefreshKey] = useState(0);
  const [clientsList, setClientsList] = useState([]);
  const [dealForm, setDealForm] = useState({
    name: '',
    clientId: '',
    company: '',
    amount: '',
    stage: 'new',
    description: '',
  });

  useEffect(() => {
    getClientsForSelect()
      .then(setClientsList)
      .catch(console.error)
      .finally(() => setClientsLoading(false));
  }, []);

  const updateForm = (field, value) => {
    setDealForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateDeal = async () => {
    setSaveError('');
    const amount = Number(dealForm.amount);

    if (
      !dealForm.name.trim() ||
      !dealForm.clientId ||
      Number.isNaN(amount) ||
      amount <= 0
    ) {
      setSaveError('Please provide a valid name, client, and amount.');
      return;
    }

    setSaveLoading(true);

    try {
      const result = await createDeal({
        name: dealForm.name.trim(),
        clientId: dealForm.clientId,
        company: dealForm.company.trim() || undefined,
        amount,
        stage: dealForm.stage,
        date: new Date().toISOString(),
        description: dealForm.description
          ? dealForm.description.trim()
          : undefined,
      });

      kanbanRef.current?.upsertDeal(result);
      setShowModal(false);
      setDealForm({
        name: '',
        clientId: '',
        company: '',
        amount: '',
        stage: 'new',
        description: '',
      });
    } catch (error) {
      setSaveError(error.message || 'Failed to save deal');
      console.error(error);
    } finally {
      setSaveLoading(false);
    }
  };

  if (clientsLoading && viewMode === 'board') {
    return (
      <div style={styles.page}>
        <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
          Loading…
        </div>
      </div>
    );
  }

  if (viewMode === 'detail' && selectedDealId) {
    return (
      <DealDetail
        dealId={selectedDealId}
        onBack={() => {
          setViewMode('board');
          setSelectedDealId(null);
        }}
        onUpdate={(updated) => {
          kanbanRef.current?.upsertDeal(updated, {
            removeId: getDealId(updated),
          });
        }}
        onDelete={(deletedId) => {
          kanbanRef.current?.removeDeal(deletedId);
        }}
      />
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>Deals</h1>
        </div>
        <button
          type="button"
          className="crm-btn-primary"
          style={styles.btnPrimary}
          onClick={() => setShowModal(true)}
        >
          + New Deal
        </button>
      </div>

      <KanbanBoard
        ref={kanbanRef}
        refreshKey={boardRefreshKey}
        onDealClick={(dealId) => {
          setViewMode('detail');
          setSelectedDealId(dealId);
        }}
      />

      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>New Deal</h2>
            <div style={styles.formGroup}>
              <label style={styles.label}>Name</label>
              <input
                style={styles.input}
                placeholder="Deal name"
                value={dealForm.name}
                onChange={(e) => updateForm('name', e.target.value)}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Client</label>
              <select
                style={styles.input}
                value={dealForm.clientId}
                onChange={(e) => {
                  const clientId = e.target.value;
                  const selected = clientsList.find((c) => c.id === clientId);
                  setDealForm((prev) => ({
                    ...prev,
                    clientId,
                    company: selected?.company || '',
                  }));
                }}
              >
                <option value="">Select a client</option>
                {clientsList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} · {c.company}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Amount ($)</label>
              <input
                style={styles.input}
                type="number"
                placeholder="0"
                value={dealForm.amount}
                onChange={(e) => updateForm('amount', e.target.value)}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Stage</label>
              <select
                style={styles.input}
                value={dealForm.stage}
                onChange={(e) => updateForm('stage', e.target.value)}
              >
                {Object.entries(columnConfig).map(([k, c]) => (
                  <option key={k} value={k}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                style={{ ...styles.input, resize: 'vertical', minHeight: 80 }}
                placeholder="Add a short description for this deal"
                value={dealForm.description}
                onChange={(e) => updateForm('description', e.target.value)}
              />
            </div>
            {saveError && (
              <div style={{ color: '#DC2626', marginBottom: 12, fontSize: 13 }}>
                {saveError}
              </div>
            )}
            <div style={styles.modalActions}>
              <button
                type="button"
                className="crm-btn-secondary"
                style={styles.btnSecondary}
                onClick={() => {
                  setShowModal(false);
                  setSaveError('');
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="crm-btn-primary"
                style={styles.btnPrimary}
                onClick={handleCreateDeal}
                disabled={saveLoading}
              >
                {saveLoading ? 'Saving…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
