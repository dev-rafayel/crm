import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles, { statusMap } from './style';
import fmt from '../../fmt';
import { getClients, createClient, deleteClient } from '../../api/clients.api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Pagination from './Pagination.jsx';

const PAGE_LIMIT = 20;
const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/;

const emptyPagination = {
  totalItems: 0,
  totalPages: 1,
  currentPage: 1,
};

function normalizePhone(value) {
  return value.replace(/[\s\-()]/g, '');
}

function formatError(err) {
  if (err.details && typeof err.details === 'object') {
    const msgs = Object.values(err.details).flat();
    if (msgs.length) return msgs.join('. ');
  }
  return err.message || 'Something went wrong';
}

const emptyForm = {
  name: '',
  company: '',
  email: '',
  phone: '',
  status: 'warm',
};

export default function Customers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(emptyPagination);
  const [selected, setSelected] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, debouncedSearch]);

  const loadClients = useCallback(
    async (page) => {
      setListLoading(true);
      try {
        const { clients: rows, pagination: meta } = await getClients({
          page,
          limit: PAGE_LIMIT,
          filter,
          search: debouncedSearch,
        });
        setClients(rows);
        setPagination(meta);
        if (meta.currentPage !== page) {
          setCurrentPage(meta.currentPage);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setListLoading(false);
        setLoading(false);
      }
    },
    [filter, debouncedSearch],
  );

  useEffect(() => {
    loadClients(currentPage);
  }, [loadClients, currentPage]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  function openModal() {
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  }

  function closeModal() {
    if (!submitting) setModalOpen(false);
  }

  function goToPage(page) {
    if (page < 1 || page > pagination.totalPages || page === currentPage) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleCreate(e) {
    e.preventDefault();
    setFormError('');

    const phone = form.phone.trim();
    if (phone && !PHONE_REGEX.test(normalizePhone(phone))) {
      setFormError('Enter a valid international phone number, e.g. +37499123456');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        company: form.company.trim(),
        email: form.email.trim(),
        status: form.status,
      };
      if (phone) payload.phone = normalizePhone(phone);

      await createClient(payload);
      setModalOpen(false);
      setCurrentPage(1);
      await loadClients(1);
    } catch (err) {
      setFormError(formatError(err));
    } finally {
      setSubmitting(false);
    }
  }

  function openDeleteModal() {
    if (!isAdmin || selected.length === 0) return;
    setDeleteModal({ type: 'confirm', count: selected.length });
  }

  function closeDeleteModal() {
    if (!deleting) setDeleteModal(null);
  }

  async function confirmBulkDelete() {
    if (!isAdmin || selected.length === 0 || deleteModal?.type !== 'confirm') return;

    setDeleting(true);
    try {
      await Promise.all(selected.map((id) => deleteClient(id)));
      setSelected([]);
      setDeleteModal(null);
      await loadClients(currentPage);
    } catch (err) {
      console.error(err);
      setDeleteModal({ type: 'error', message: formatError(err) });
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
          Loading…
        </div>
      </div>
    );
  }

  const totalLabel =
    pagination.totalItems === 1
      ? '1 customer'
      : `${pagination.totalItems} customers`;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>Customers</h1>
          <p style={styles.subheading}>{totalLabel}</p>
        </div>
        <button
          type="button"
          className="crm-btn-primary"
          style={styles.btnPrimary}
          onClick={openModal}
        >
          + New Customer
        </button>
      </div>

      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <svg style={styles.searchIcon} viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="#94A3B8" strokeWidth="1.5" />
            <path
              d="M13.5 13.5L17 17"
              stroke="#94A3B8"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            style={styles.searchInput}
            placeholder="Search by name, company, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={styles.filters}>
          {['all', 'hot', 'warm'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              style={{
                ...styles.filterBtn,
                background: filter === f ? '#0F172A' : '#fff',
                color: filter === f ? '#fff' : '#475569',
                borderColor: filter === f ? '#0F172A' : '#E2E8F0',
              }}
            >
              {f === 'all' ? 'All' : statusMap[f].label}
            </button>
          ))}
        </div>
        {isAdmin && selected.length > 0 && (
          <button
            type="button"
            className="crm-btn-danger"
            style={styles.btnDanger}
            onClick={openDeleteModal}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : `${selected.length} selected — delete`}
          </button>
        )}
      </div>

      <div style={{ ...styles.tableWrap, opacity: listLoading ? 0.6 : 1, transition: 'opacity 0.2s' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              {isAdmin && (
                <th style={{ ...styles.th, width: 36 }}>
                  <input type="checkbox" style={{ cursor: 'pointer' }} readOnly />
                </th>
              )}
              <th style={styles.th}>Client</th>
              <th style={styles.th}>Company</th>
              <th style={styles.th}>Contact</th>
              <th style={styles.th}>Deals</th>
              <th style={styles.th}>Amount</th>
              <th style={styles.th}>Status</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => {
              const st = statusMap[c.status] || statusMap.cold;
              const isSelected = selected.includes(c.id);
              return (
                <tr
                  key={c.id}
                  className="crm-table-row"
                  style={{
                    ...styles.tr,
                    background: isSelected ? '#EFF6FF' : '#fff',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/clients/${c.id}`)}
                >
                  {isAdmin && (
                    <td style={styles.td} onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(c.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                  )}
                  <td style={styles.td}>
                    <div style={styles.clientCell}>
                      <div
                        style={{
                          ...styles.avatar,
                          background: st.bg,
                          color: st.color,
                        }}
                      >
                        {c.name?.charAt(0) || '?'}
                      </div>
                      <span style={styles.clientName}>{c.name}</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.company}>{c.company}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.email}>{c.email}</span>
                    <br />
                    <span style={styles.phone}>{c.phone}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.dealsCount}>{c.dealsCount || 0}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.amount}>{fmt(c.amount || 0)}</span>
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        background: st.bg,
                        color: st.color,
                      }}
                    >
                      {st.label}
                    </span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="crm-btn-ghost"
                      style={styles.actionBtn}
                      onClick={() => navigate(`/clients/${c.id}`)}
                    >
                      Open
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {clients.length === 0 && !listLoading && (
          <div style={styles.empty}>Nothing found</div>
        )}
        <Pagination
          pagination={pagination}
          onPageChange={goToPage}
          loading={listLoading}
        />
      </div>

      {deleteModal && (
        <div style={styles.overlay} role="presentation" onClick={closeDeleteModal}>
          <div
            style={{ ...styles.modal, maxWidth: 420 }}
            role="alertdialog"
            aria-labelledby="delete-clients-title"
            aria-describedby="delete-clients-desc"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: deleteModal.type === 'error' ? '#FEF2F2' : '#FEF2F2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                marginBottom: 16,
              }}
            >
              {deleteModal.type === 'error' ? '!' : '🗑'}
            </div>

            <h2 id="delete-clients-title" style={styles.modalTitle}>
              {deleteModal.type === 'error'
                ? 'Could not delete'
                : 'Delete customers?'}
            </h2>

            <p id="delete-clients-desc" style={styles.modalDesc}>
              {deleteModal.type === 'error'
                ? deleteModal.message
                : deleteModal.count === 1
                  ? 'This customer and their data will be removed permanently. This cannot be undone.'
                  : `${deleteModal.count} customers will be removed permanently. This cannot be undone.`}
            </p>

            <div style={styles.modalActions}>
              {deleteModal.type === 'error' ? (
                <button
                  type="button"
                  className="crm-btn-primary"
                  style={styles.btnPrimary}
                  onClick={closeDeleteModal}
                >
                  OK
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="crm-btn-secondary"
                    style={styles.btnSecondary}
                    onClick={closeDeleteModal}
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="crm-btn-danger"
                    style={{
                      ...styles.btnDangerSolid,
                      opacity: deleting ? 0.7 : 1,
                      cursor: deleting ? 'not-allowed' : 'pointer',
                    }}
                    onClick={confirmBulkDelete}
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting…' : 'Delete'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div style={styles.overlay} role="presentation" onClick={closeModal}>
          <div
            style={styles.modal}
            role="dialog"
            aria-labelledby="new-client-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="new-client-title" style={{ ...styles.heading, fontSize: 18, marginBottom: 20 }}>
              New customer
            </h2>

            {formError && <p style={styles.errorBox}>{formError}</p>}

            <form onSubmit={handleCreate}>
              <div style={styles.field}>
                <label style={styles.label} htmlFor="client-name">
                  Name
                </label>
                <input
                  id="client-name"
                  style={styles.input}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label} htmlFor="client-company">
                  Company
                </label>
                <input
                  id="client-company"
                  style={styles.input}
                  value={form.company}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label} htmlFor="client-email">
                  Email
                </label>
                <input
                  id="client-email"
                  style={styles.input}
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label} htmlFor="client-phone">
                  Phone (optional)
                </label>
                <input
                  id="client-phone"
                  style={styles.input}
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+37499123456"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label} htmlFor="client-status">
                  Status
                </label>
                <select
                  id="client-status"
                  style={styles.input}
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                >
                  <option value="hot">Aware</option>
                  <option value="warm">Unaware</option>
                </select>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  className="crm-btn-secondary"
                  style={styles.btnSecondary}
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="crm-btn-primary"
                  style={styles.btnPrimary}
                  disabled={submitting}
                >
                  {submitting ? 'Saving…' : 'Create customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
