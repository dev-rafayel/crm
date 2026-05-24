import { useState, useEffect } from 'react';
import styles from './style';
import { activityIcons } from './data';
import fmt from '../../fmt';
import { getClients } from '../../api/clients.api.js';
import { getDeals } from '../../api/deals.api.js';

export default function ClientCard() {
  const [tab, setTab] = useState('activity');
  const [note, setNote] = useState(
    'Client is interested in the Enterprise plan. Key priority is 1C integration. Next call scheduled for May 20. Decision made together with the CTO.',
  );
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClient() {
      try {
        const { clients } = await getClients({ page: 1, limit: 1 });
        const clientData = clients[0];
        if (!clientData) {
          throw new Error('No clients available');
        }
        const allDeals = await getDeals();
        const clientDeals = allDeals.filter((d) => d.clientId === clientData.id);

        setClient({
          ...clientData,
          initials: clientData.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase(),
          deals: clientDeals,
          activity: [],
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadClient();
  }, []);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
          Loading…
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div style={styles.page}>
        <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
          Client not found
        </div>
      </div>
    );
  }

  const totalAmount = client.deals.reduce((s, d) => s + d.amount, 0);

  return (
    <div style={styles.page}>
      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <span style={styles.breadLink}>Clients</span>
        <span style={styles.breadSep}>›</span>
        <span style={styles.breadCurrent}>{client.name}</span>
      </div>

      <div style={styles.layout}>
        {/* LEFT PANEL */}
        <div style={styles.leftPanel}>
          {/* Profile card */}
          <div style={styles.profileCard}>
            <div style={styles.avatarLg}>{client.initials}</div>
            <h2 style={styles.clientName}>{client.name}</h2>
            <p style={styles.clientPos}>
              {client.position || 'Contact'} · {client.company}
            </p>
            <div style={styles.tagsRow}>
              {(client.tags || []).map((t, i) => (
                <span key={i} style={styles.tag}>
                  {t}
                </span>
              ))}
            </div>
            <div style={styles.actionBtns}>
              <button style={styles.actionBtn}>📞 Call</button>
              <button style={styles.actionBtn}>✉️ Email</button>
            </div>
          </div>

          {/* Info block */}
          <div style={styles.infoBlock}>
            <p style={styles.blockTitle}>Contacts</p>
            {[
              { key: 'Email', val: client.email, blue: true },
              { key: 'Phone', val: client.phone },
              { key: 'Company', val: client.company },
              { key: 'Source', val: client.source },
              {
                key: 'Added',
                val:
                  client.added ||
                  new Date(client.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }),
              },
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

          {/* Stats */}
          <div style={styles.statsRow}>
            <div style={styles.statItem}>
              <p style={styles.statVal}>{client.deals.length}</p>
              <p style={styles.statLabel}>Deals</p>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <p style={{ ...styles.statVal, color: '#3B82F6' }}>
                {fmt(totalAmount)}
              </p>
              <p style={styles.statLabel}>Total value</p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={styles.rightPanel}>
          {/* Tabs */}
          <div style={styles.tabs}>
            {['activity', 'deals', 'notes'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  ...styles.tabBtn,
                  borderBottom:
                    tab === t ? '2px solid #3B82F6' : '2px solid transparent',
                  color: tab === t ? '#3B82F6' : '#64748B',
                  fontWeight: tab === t ? 600 : 400,
                }}
              >
                {{ activity: 'History', deals: 'Deals', notes: 'Notes' }[t]}
              </button>
            ))}
          </div>

          {/* Activity tab */}
          {tab === 'activity' && (
            <div style={styles.tabContent}>
              {client.activity.map((a, i) => (
                <div key={i} style={styles.timelineItem}>
                  <div
                    style={{
                      ...styles.timelineIcon,
                      background: a.color + '22',
                      color: a.color,
                    }}
                  >
                    {activityIcons[a.type]}
                  </div>
                  <div style={styles.timelineBody}>
                    <div style={styles.timelineConnector} />
                    <p style={styles.timelineText}>{a.text}</p>
                    <p style={styles.timelineTime}>{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Deals tab */}
          {tab === 'deals' && (
            <div style={styles.tabContent}>
              {client.deals.map((d, i) => (
                <div key={i} style={styles.dealRow}>
                  <div>
                    <p style={styles.dealName}>{d.name}</p>
                    <p style={styles.dealStage}>{d.stage}</p>
                  </div>
                  <div style={styles.dealRight}>
                    <p style={styles.dealAmount}>{fmt(d.amount)}</p>
                    <span
                      style={{
                        ...styles.dealBadge,
                        background:
                          d.status === 'closed' ? '#DCFCE7' : '#DBEAFE',
                        color: d.status === 'closed' ? '#16A34A' : '#2563EB',
                      }}
                    >
                      {d.status === 'closed' ? 'Closed' : 'Active'}
                    </span>
                  </div>
                </div>
              ))}
              <button style={styles.addDealBtn}>+ Add Deal</button>
            </div>
          )}

          {/* Notes tab */}
          {tab === 'notes' && (
            <div style={styles.tabContent}>
              <textarea
                style={styles.noteArea}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter note..."
              />
              <button style={styles.saveBtn}>Save</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
