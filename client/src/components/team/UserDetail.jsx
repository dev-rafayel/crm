import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import cardStyles from '../customerCard/style';
import fmt from '../../fmt';
import { getUserById, updateUserStatus } from '../../api/users.api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { getDealStageBadge, getDealStageTitle } from '../../dealStages.js';

function formatError(err) {
  if (err.details && typeof err.details === 'object') {
    const msgs = Object.values(err.details).flat();
    if (msgs.length) return msgs.join('. ');
  }
  return err.message || 'Something went wrong';
}

function getInitials(name, email) {
  const source = name || email || '?';
  const words = source.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function formatRole(role) {
  if (role === 'admin') return 'Admin';
  if (role === 'staff') return 'Staff';
  return role || '—';
}

function formatStatus(status) {
  const labels = {
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Blocked',
    invited: 'Invited',
    archived: 'Archived',
  };
  return labels[status] || status || '—';
}

export default function UserDetail() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const currentUserId = String(currentUser?.id ?? currentUser?._id ?? '');

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('deals');
  const [statusLoading, setStatusLoading] = useState(false);
  const [blockModal, setBlockModal] = useState(null);
  const [blockError, setBlockError] = useState('');

  const loadMember = useCallback(async () => {
    const data = await getUserById(id);
    setMember(data);
  }, [id]);

  useEffect(() => {
    loadMember()
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [loadMember]);

  const isActive = member?.status === 'active';

  function openBlockModal() {
    if (!isAdmin || !member) return;
    setBlockError('');

    if (member.id === currentUserId) {
      setBlockModal({ type: 'error', message: 'You cannot block your own account.' });
      return;
    }

    setBlockModal({
      type: 'confirm',
      action: isActive ? 'block' : 'unblock',
    });
  }

  function closeBlockModal() {
    if (!statusLoading) {
      setBlockModal(null);
      setBlockError('');
    }
  }

  async function confirmBlockAction() {
    if (!member || blockModal?.type !== 'confirm') return;

    const nextStatus = member.status === 'active' ? 'inactive' : 'active';

    setStatusLoading(true);
    setBlockError('');
    try {
      const updated = await updateUserStatus(id, nextStatus);
      setMember(updated);
      setBlockModal(null);
    } catch (err) {
      setBlockError(formatError(err));
    } finally {
      setStatusLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={cardStyles.page}>
        <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
          Loading…
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div style={cardStyles.page}>
        <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
          Employee not found
        </div>
      </div>
    );
  }

  const initials = getInitials(member.name, member.email);
  const roleColor =
    member.role === 'admin'
      ? { bg: '#EDE9FE', color: '#6D28D9' }
      : { bg: '#DBEAFE', color: '#2563EB' };

  const contactRows = isAdmin
    ? [
        { key: 'Email', val: member.email, blue: true },
        { key: 'Phone', val: member.phone || '—' },
        { key: 'Role', val: formatRole(member.role) },
        { key: 'Status', val: formatStatus(member.status) },
        {
          key: 'Joined',
          val: member.createdAt
            ? new Date(member.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : '—',
        },
      ]
    : [
        { key: 'Name', val: member.name },
        { key: 'Email', val: member.email, blue: true },
        { key: 'Phone', val: member.phone || '—' },
        { key: 'Role', val: formatRole(member.role) },
      ];

  const leftPanel = (
    <div style={cardStyles.leftPanel}>
      <div style={cardStyles.profileCard}>
        <div
          style={{
            ...cardStyles.avatarLg,
            background: roleColor.bg,
            color: roleColor.color,
          }}
        >
          {initials}
        </div>
        <h2 style={cardStyles.clientName}>{member.name}</h2>
        <p style={cardStyles.clientPos}>{formatRole(member.role)}</p>
        {isAdmin && member.status && (
          <span
            style={{
              ...cardStyles.tag,
              background: isActive ? '#ECFDF5' : '#F1F5F9',
              color: isActive ? '#047857' : '#64748B',
            }}
          >
            {formatStatus(member.status)}
          </span>
        )}
        {isAdmin && member.id !== currentUserId && (
          <button
            type="button"
            className={`crm-btn-block ${isActive ? 'crm-btn-block--danger' : 'crm-btn-block--success'}`}
            onClick={openBlockModal}
            disabled={statusLoading}
          >
            {statusLoading ? 'Processing…' : isActive ? 'Block employee' : 'Unblock employee'}
          </button>
        )}
      </div>

      <div style={cardStyles.infoBlock}>
        <p style={cardStyles.blockTitle}>Contacts</p>
        {contactRows.map((r, i) => (
          <div key={i} style={cardStyles.infoRow}>
            <span style={cardStyles.infoKey}>{r.key}</span>
            <span
              style={{
                ...cardStyles.infoVal,
                color: r.blue ? '#3B82F6' : '#0F172A',
              }}
            >
              {r.val}
            </span>
          </div>
        ))}
      </div>

      {isAdmin && (
        <div style={cardStyles.statsRow}>
          <div style={cardStyles.statItem}>
            <p style={cardStyles.statVal}>{member.dealsCount ?? 0}</p>
            <p style={cardStyles.statLabel}>Deals</p>
          </div>
          <div style={cardStyles.statDivider} />
          <div style={cardStyles.statItem}>
            <p style={{ ...cardStyles.statVal, color: '#3B82F6' }}>
              {fmt(member.dealsTotal ?? 0)}
            </p>
            <p style={cardStyles.statLabel}>Total value</p>
          </div>
        </div>
      )}
    </div>
  );

  const isBlockConfirm = blockModal?.type === 'confirm';
  const isBlockError = blockModal?.type === 'error';
  const blocking = blockModal?.action === 'block';

  return (
    <div style={cardStyles.page}>
      <div style={cardStyles.breadcrumb}>
        <Link to="/team" style={cardStyles.breadLink}>
          Team
        </Link>
        <span style={cardStyles.breadSep}>›</span>
        <span style={cardStyles.breadCurrent}>{member.name}</span>
      </div>

      {isAdmin ? (
        <div style={cardStyles.layout}>
          {leftPanel}
          <div style={cardStyles.rightPanel}>
            <div style={cardStyles.tabs}>
              <button
                type="button"
                onClick={() => setTab('deals')}
                style={{
                  ...cardStyles.tabBtn,
                  borderBottom:
                    tab === 'deals' ? '2px solid #3B82F6' : '2px solid transparent',
                  color: tab === 'deals' ? '#3B82F6' : '#64748B',
                  fontWeight: tab === 'deals' ? 600 : 400,
                }}
              >
                Manager deals
              </button>
            </div>

            <div style={cardStyles.tabContent}>
              {tab === 'deals' &&
                (member.deals && member.deals.length > 0 ? (
                  <div>
                    {member.deals.map((d) => (
                      <div
                        key={d._id || d.id}
                        className="crm-deal-row"
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px 0',
                          borderBottom: '1px solid #F1F5F9',
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontSize: 14,
                              fontWeight: 500,
                              color: '#0F172A',
                              margin: '0 0 2px',
                            }}
                          >
                            {d.name}
                          </p>
                          <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>
                            {d.company}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <p
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: '#0F172A',
                              margin: 0,
                            }}
                          >
                            {fmt(d.amount || 0)}
                          </p>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 500,
                              padding: '3px 8px',
                              borderRadius: 6,
                              background: getDealStageBadge(d.stage).bg,
                              color: getDealStageBadge(d.stage).color,
                            }}
                          >
                            {getDealStageTitle(d.stage)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '24px', color: '#64748B', textAlign: 'center' }}>
                    No deals for this manager
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: 320 }}>{leftPanel}</div>
      )}

      {blockModal && (
        <div style={cardStyles.overlay} role="presentation" onClick={closeBlockModal}>
          <div
            style={{ ...cardStyles.modal, maxWidth: 420 }}
            role="alertdialog"
            aria-labelledby="block-modal-title"
            aria-describedby="block-modal-desc"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: isBlockError ? '#FEF2F2' : blocking ? '#FEF2F2' : '#ECFDF5',
                color: isBlockError ? '#DC2626' : blocking ? '#DC2626' : '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                marginBottom: 16,
              }}
            >
              {isBlockError ? '!' : blocking ? '⛔' : '✓'}
            </div>

            <h2 id="block-modal-title" style={{ ...cardStyles.modalTitle, marginBottom: 8 }}>
              {isBlockError
                ? 'Action not allowed'
                : blocking
                  ? 'Block employee?'
                  : 'Unblock employee?'}
            </h2>

            <p
              id="block-modal-desc"
              style={{ fontSize: 14, color: '#64748B', lineHeight: 1.55, margin: '0 0 20px' }}
            >
              {isBlockError
                ? blockModal.message
                : blocking
                  ? `"${member.name}" will lose access to the CRM. You can restore access later.`
                  : `"${member.name}" will be able to sign in and work with the CRM again.`}
            </p>

            {blockError && (
              <p style={{ ...cardStyles.errorBox, marginBottom: 16 }}>{blockError}</p>
            )}

            <div style={cardStyles.modalActions}>
              {isBlockError ? (
                <button
                  type="button"
                  className="crm-btn-primary"
                  style={cardStyles.btnPrimary}
                  onClick={closeBlockModal}
                >
                  OK
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="crm-btn-secondary"
                    style={cardStyles.btnSecondary}
                    onClick={closeBlockModal}
                    disabled={statusLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="crm-btn-primary"
                    style={{
                      ...cardStyles.btnPrimary,
                      background: blocking ? '#DC2626' : '#10B981',
                    }}
                    onClick={confirmBlockAction}
                    disabled={statusLoading}
                  >
                    {statusLoading
                      ? 'Processing…'
                      : blocking
                        ? 'Block'
                        : 'Unblock'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
