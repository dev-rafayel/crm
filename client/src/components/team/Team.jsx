import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as inviteApi from '../../api/invite.api.js';
import * as usersApi from '../../api/users.api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import styles from './teamStyles.js';

function formatError(err) {
  if (err.details && typeof err.details === 'object') {
    const msgs = Object.values(err.details).flat();
    if (msgs.length) return msgs.join('. ');
  }
  return err.message || 'Failed to send invitation';
}

function getInitials(member) {
  const words = (member.name || member.email || '?').split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return (words[0] || '?').slice(0, 2).toUpperCase();
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function RoleBadge({ role }) {
  const isAdmin = role === 'admin';
  return (
    <span
      style={{
        ...styles.badge,
        background: isAdmin ? '#EDE9FE' : '#DBEAFE',
        color: isAdmin ? '#6D28D9' : '#2563EB',
      }}
    >
      {isAdmin ? 'Admin' : 'Staff'}
    </span>
  );
}

function StatusBadge({ status }) {
  const isActive = status === 'active';
  return (
    <span
      style={{
        ...styles.badge,
        background: isActive ? '#ECFDF5' : '#F1F5F9',
        color: isActive ? '#047857' : '#64748B',
      }}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

export default function Team() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const currentUserId = String(user?.id ?? user?._id ?? '');

  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('staff');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadTeamData = useCallback(async () => {
    const usersData = await usersApi.getUsers();
    setMembers(usersData);

    if (isAdmin) {
      const invitesData = await inviteApi.getInvites();
      setInvites(invitesData);
    } else {
      setInvites([]);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadTeamData()
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [loadTeamData]);

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => {
      const haystack = [m.name, m.email, m.firstName, m.lastName, m.role]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [members, search]);

  function openModal() {
    setEmail('');
    setRole('staff');
    setError('');
    setModalOpen(true);
  }

  function closeModal() {
    if (!submitting) setModalOpen(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await inviteApi.sendInvite({ email: email.trim(), role });
      setModalOpen(false);
      setSuccessMessage('Invitation sent successfully');
      setTimeout(() => setSuccessMessage(''), 5000);
      await loadTeamData();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteMember(member) {
    if (!isAdmin) return;
    if (member.id === currentUserId) {
      window.alert('You cannot delete your own account.');
      return;
    }
    if (!window.confirm(`Remove employee "${member.name}"?`)) return;

    setDeleting(true);
    try {
      await usersApi.deleteUser(member.id);
      await loadTeamData();
    } catch (err) {
      console.error(err);
      window.alert(formatError(err));
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Loading team…</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Team</h1>
          <p style={styles.subtitle}>
            {isAdmin
              ? 'Manage employees and pending invitations'
              : 'View your colleagues'}
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            className="crm-btn-primary"
            style={styles.btnPrimary}
            onClick={openModal}
          >
            Invite Employee
          </button>
        )}
      </div>

      {successMessage && <p style={styles.toast}>{successMessage}</p>}

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Total employees</p>
          <p style={styles.statValue}>{members.length}</p>
        </div>
        {isAdmin && (
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Awaiting registration</p>
            <p style={styles.statValue}>{invites.length}</p>
          </div>
        )}
      </div>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Team members</h2>
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
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Employee</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Added</th>
                {isAdmin && <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr
                  key={member.id}
                  className="crm-table-row"
                  style={{ ...styles.tr, cursor: 'pointer' }}
                  onClick={() => navigate(`/team/${member.id}`)}
                >
                  <td style={styles.td}>
                    <div style={styles.memberCell}>
                      <div style={styles.avatar}>{getInitials(member)}</div>
                      <span style={styles.memberName}>{member.name}</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.email}>{member.email}</span>
                  </td>
                  <td style={styles.td}>
                    <RoleBadge role={member.role} />
                  </td>
                  <td style={styles.td}>
                    <StatusBadge status={member.status} />
                  </td>
                  <td style={styles.td}>
                    <span style={styles.muted}>{formatDate(member.createdAt)}</span>
                  </td>
                  {isAdmin && (
                    <td
                      style={{ ...styles.td, ...styles.actionCell }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {member.id !== currentUserId && (
                        <button
                          type="button"
                          className="crm-btn-ghost"
                          style={styles.deleteBtn}
                          disabled={deleting}
                          onClick={() => handleDeleteMember(member)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredMembers.length === 0 && (
            <div style={styles.empty}>
              {members.length === 0 ? 'No team members yet' : 'Nothing found'}
            </div>
          )}
        </div>
      </section>

      {isAdmin && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Pending invites</h2>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Sent</th>
                  <th style={styles.th}>Expires</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((invite) => (
                  <tr key={invite.id} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={styles.email}>{invite.email}</span>
                    </td>
                    <td style={styles.td}>
                      <RoleBadge role={invite.role} />
                    </td>
                    <td style={styles.td}>
                      <span style={styles.muted}>{formatDate(invite.createdAt)}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.muted}>{formatDateTime(invite.expiresAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {invites.length === 0 && (
              <div style={styles.empty}>No pending invitations</div>
            )}
          </div>
        </section>
      )}

      {modalOpen && isAdmin && (
        <div style={styles.overlay} role="presentation" onClick={closeModal}>
          <div
            style={styles.modal}
            role="dialog"
            aria-labelledby="invite-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="invite-title" style={{ ...styles.title, fontSize: 18, marginBottom: 20 }}>
              Invite Employee
            </h2>

            {error && <p style={styles.errorBox}>{error}</p>}

            <form onSubmit={handleSubmit}>
              <div style={styles.field}>
                <label style={styles.label} htmlFor="invite-email">
                  Email
                </label>
                <input
                  id="invite-email"
                  style={styles.input}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="employee@company.com"
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label} htmlFor="invite-role">
                  Role
                </label>
                <select
                  id="invite-role"
                  style={styles.input}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
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
                  {submitting ? 'Sending…' : 'Send invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
