import { useState, useEffect } from 'react';
import styles from './style';
import fmt from '../../fmt';
import { getDealById, updateDeal, deleteDeal } from '../../api/deals.api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { DEAL_STAGE_COLORS } from '../../dealStages.js';

export default function DealDetail({ dealId, onBack, onUpdate, onDelete }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    getDealById(dealId)
      .then((data) => {
        setDeal(data);
        setEditForm({
          name: data.name,
          amount: data.amount,
          stage: data.stage,
          description: data.description || '',
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [dealId]);

  const handleUpdateField = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDelete = async () => {
    if (!isAdmin) return;
    setDeleteError('');
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await deleteDeal(dealId);
      if (onDelete) onDelete(dealId);
      onBack();
    } catch (error) {
      console.error('Failed to delete deal:', error);
      setDeleteError(error.message || 'Failed to delete deal');
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    if (deleteLoading) return;
    setDeleteError('');
    setConfirmDeleteOpen(false);
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const updated = await updateDeal(dealId, {
        name: editForm.name.trim(),
        amount: Number(editForm.amount),
        stage: editForm.stage,
        description: editForm.description.trim(),
      });
      setDeal(updated);
      setEditing(false);
      if (onUpdate) onUpdate(updated);
    } catch (error) {
      console.error('Failed to update deal:', error);
      alert('Failed to save deal');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
          Loading…
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div style={styles.page}>
        <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
          Deal not found
        </div>
      </div>
    );
  }

  const stageConfig = Object.fromEntries(
    Object.entries(DEAL_STAGE_COLORS).map(([key, s]) => [
      key,
      { title: s.title, color: s.color },
    ]),
  );

  const stageInfo = stageConfig[deal.stage] || stageConfig.new;

  return (
    <div style={styles.page}>
      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 13,
            color: '#3B82F6',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          ← Deals
        </button>
        <span style={styles.breadSep}>›</span>
        <span style={styles.breadCurrent}>{deal.name}</span>
      </div>

      {/* Deal detail card */}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 32,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          maxWidth: 600,
        }}
      >
        {editing ? (
          <>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: '#0F172A',
                margin: '0 0 20px',
              }}
            >
              Edit Deal
            </h1>

            <div style={styles.formGroup}>
              <label style={styles.label}>Name</label>
              <input
                style={styles.input}
                value={editForm.name}
                onChange={(e) => handleUpdateField('name', e.target.value)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Manager</label>
              <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
                {deal.managerName || 'Unassigned'}
              </p>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Amount ($)</label>
              <input
                style={styles.input}
                type="number"
                value={editForm.amount}
                onChange={(e) => handleUpdateField('amount', e.target.value)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Stage</label>
              <select
                style={styles.input}
                value={editForm.stage}
                onChange={(e) => handleUpdateField('stage', e.target.value)}
              >
                {Object.entries(stageConfig).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.title}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                style={{ ...styles.input, resize: 'vertical', minHeight: 100 }}
                value={editForm.description || ''}
                onChange={(e) =>
                  handleUpdateField('description', e.target.value)
                }
                placeholder="Add description about this deal"
              />
            </div>

            <div
              style={{
                display: 'flex',
                gap: 8,
                marginTop: 24,
              }}
            >
              <button
                type="button"
                className="crm-btn-secondary"
                style={styles.btnSecondary}
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="crm-btn-primary"
                style={styles.btnPrimary}
                onClick={handleSave}
                disabled={saveLoading}
              >
                {saveLoading ? 'Saving…' : 'Save'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: 24,
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    color: '#0F172A',
                    margin: '0 0 8px',
                  }}
                >
                  {deal.name}
                </h1>
                <p style={{ fontSize: 14, color: '#94A3B8', margin: 0 }}>
                  {deal.managerName || 'Unassigned'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="crm-btn-secondary"
                  style={{
                    ...styles.btnSecondary,
                    padding: '8px 16px',
                    background: '#E0F2FE',
                    color: '#0284C7',
                    borderColor: '#7DD3FC',
                  }}
                  onClick={() => setEditing(true)}
                >
                  Edit
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    className="crm-btn-danger"
                    style={{
                      ...styles.btnSecondary,
                      padding: '8px 16px',
                      background: '#FEE2E2',
                      color: '#DC2626',
                      border: '1px solid #FECACA',
                      cursor: deleteLoading ? 'not-allowed' : 'pointer',
                      opacity: deleteLoading ? 0.7 : 1,
                    }}
                    onClick={handleDelete}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? 'Deleting…' : 'Delete'}
                  </button>
                )}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 24,
                marginBottom: 24,
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 11,
                    color: '#94A3B8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 8px',
                    fontWeight: 600,
                  }}
                >
                  Amount
                </p>
                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: stageInfo.color,
                    margin: 0,
                  }}
                >
                  {fmt(deal.amount)}
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontSize: 11,
                    color: '#94A3B8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 8px',
                    fontWeight: 600,
                  }}
                >
                  Stage
                </p>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    borderRadius: 6,
                    background: stageInfo.color + '22',
                    color: stageInfo.color,
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  {stageInfo.title}
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 16 }}>
              <p
                style={{
                  fontSize: 11,
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  margin: '0 0 12px',
                  fontWeight: 600,
                }}
              >
                About
              </p>
              {deal.description ? (
                <p
                  style={{
                    fontSize: 13,
                    color: '#334155',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {deal.description}
                </p>
              ) : (
                <p
                  style={{
                    fontSize: 13,
                    color: '#94A3B8',
                    fontStyle: 'italic',
                    margin: 0,
                  }}
                >
                  No description added
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {confirmDeleteOpen && (
        <div
          style={styles.modalOverlay}
          role="presentation"
          onClick={cancelDelete}
        >
          <div
            style={styles.modal}
            role="alertdialog"
            aria-labelledby="confirm-delete-title"
            aria-describedby="confirm-delete-desc"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="confirm-delete-title" style={styles.modalTitle}>
              Delete deal?
            </h2>
            <p
              id="confirm-delete-desc"
              style={{
                fontSize: 14,
                color: '#475569',
                lineHeight: 1.5,
                margin: '0 0 20px',
              }}
            >
              This action cannot be undone. Are you sure you want to delete "
              {deal.name}"?
            </p>
            {deleteError && (
              <p style={{ color: '#B91C1C', margin: '0 0 16px', fontSize: 13 }}>
                {deleteError}
              </p>
            )}
            <div style={styles.modalActions}>
              <button
                type="button"
                className="crm-btn-secondary"
                style={styles.btnSecondary}
                onClick={cancelDelete}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="crm-btn-danger"
                style={{
                  padding: '8px 18px',
                  fontSize: 13,
                  fontWeight: 600,
                  background: '#DC2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  cursor: deleteLoading ? 'not-allowed' : 'pointer',
                  opacity: deleteLoading ? 0.7 : 1,
                }}
                onClick={confirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
