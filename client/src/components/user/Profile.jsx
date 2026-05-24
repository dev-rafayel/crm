import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import styles from './style';
import { getDeals } from '../../api/deals.api.js';
import fmt from '../../fmt';
import { getDealStageBadge, getDealStageTitle } from '../../dealStages.js';

export default function Profile() {
  const { user, getInitials, formatRole } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDeals() {
      try {
        const userDeals = await getDeals();
        // Sort by date (most recent first) and limit to 5
        const sortedDeals = userDeals
          .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
          .slice(0, 5);
        setDeals(sortedDeals);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      loadDeals();
    }
  }, [user]);

  if (!user) {
    return (
      <div style={styles.page}>
        <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
          User not found
        </div>
      </div>
    );
  }

  const totalAmount = deals.reduce((s, d) => s + (d.amount || 0), 0);

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>My Profile</h1>
          <p style={styles.subheading}>Manage your personal information</p>
        </div>
      </div>

      <div style={styles.layout}>
        {/* Profile Card */}
        <div style={styles.profileCard}>
          <div style={styles.avatarLg}>{getInitials(user)}</div>
          <h2 style={styles.userName}>
            {user.firstName} {user.lastName}
          </h2>
          <p style={styles.userRole}>{formatRole(user.role)}</p>
          <div style={styles.statusBadge}>
            <span
              style={{
                ...styles.badge,
                background: user.status === 'active' ? '#DCFCE7' : '#FEE2E2',
                color: user.status === 'active' ? '#16A34A' : '#DC2626',
              }}
            >
              {user.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Info Block */}
        <div style={styles.infoBlock}>
          <p style={styles.blockTitle}>Personal Information</p>
          {[
            { key: 'First Name', val: user.firstName || '-' },
            { key: 'Last Name', val: user.lastName || '-' },
            { key: 'Email', val: user.email, blue: true },
            { key: 'Phone', val: user.phone || '-' },
            { key: 'Role', val: formatRole(user.role) },
            { key: 'Status', val: user.status === 'active' ? 'Active' : 'Inactive' },
          ].map((r, i) => (
            <div key={i} style={styles.infoRow}>
              <span style={styles.infoKey}>{r.key}</span>
              <span
                style={{
                  ...styles.infoVal,
                  color: r.blue ? '#3B82F6' : '#0F172A',
                }}
              >
                {r.val}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Deals Block - Moved to bottom */}
      <div style={{ ...styles.layout, marginTop: '24px' }}>
        <div style={styles.infoBlock}>
          <p style={styles.blockTitle}>My Deals</p>
          {loading ? (
            <div style={{ padding: '24px', color: '#64748B', textAlign: 'center' }}>
              Loading…
            </div>
          ) : deals.length > 0 ? (
            <div>
              {deals.map((d, i) => (
                <div key={i} style={{ ...styles.infoRow, borderBottom: '1px solid #E2E8F0', paddingBottom: '12px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 500, color: '#0F172A' }}>{d.name}</p>
                    <p style={{ fontSize: 13, color: '#64748B' }}>
                      {getDealStageTitle(d.stage)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 600, color: '#0F172A' }}>{fmt(d.amount || 0)}</p>
                    <span
                      style={{
                        ...styles.badge,
                        background: getDealStageBadge(d.stage).bg,
                        color: getDealStageBadge(d.stage).color,
                        fontSize: 12,
                        padding: '4px 8px',
                      }}
                    >
                      {getDealStageTitle(d.stage)}
                    </span>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                <div style={styles.infoRow}>
                  <span style={styles.infoKey}>Total Value</span>
                  <span style={{ ...styles.infoVal, color: '#3B82F6', fontWeight: 600 }}>{fmt(totalAmount)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '24px', color: '#64748B', textAlign: 'center' }}>
              No deals found
            </div>
          )}
        </div>
      </div>
    </div>
  );

}
