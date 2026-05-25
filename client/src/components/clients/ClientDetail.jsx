import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import cardStyles from '../customerCard/style';
import { statusMap } from './style';
import fmt from '../../fmt';
import { getClientById } from '../../api/clients.api.js';
import { createDeal } from '../../api/deals.api.js';
import { getDealStageBadge, getDealStageTitle } from '../../dealStages.js';

function formatError(err) {
  if (err.details && typeof err.details === 'object') {
    const msgs = Object.values(err.details).flat();
    if (msgs.length) return msgs.join('. ');
  }
  return err.message || 'Something went wrong';
}

function sortDealsNewestFirst(deals) {
  return [...deals].sort(
    (a, b) =>
      new Date(b.createdAt || b.date).getTime() -
      new Date(a.createdAt || a.date).getTime(),
  );
}

const ACTIVITY_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'];

function formatRelativeTime(date) {
  const t = new Date(date).getTime();
  const diffMs = Math.max(0, Date.now() - t);
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function mapDealsToActivity(deals) {
  return sortDealsNewestFirst(deals).map((deal, idx) => {
    const verb = deal.stage === 'closed' ? 'Closed deal' : 'Updated deal';
    const label = deal.name || deal.company || 'Deal';
    return {
      text: `${verb} — ${label}, ${fmt(deal.amount || 0)}`,
      time: formatRelativeTime(deal.updatedAt || deal.createdAt || deal.date),
      color: ACTIVITY_COLORS[idx % ACTIVITY_COLORS.length],
      icon: '💼',
    };
  });
}

export default function ClientDetail() {
  const { id } = useParams();
  const [tab, setTab] = useState('activity');
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [dealName, setDealName] = useState('');
  const [dealAmount, setDealAmount] = useState('');
  const [dealError, setDealError] = useState('');
  const [dealSubmitting, setDealSubmitting] = useState(false);

  const loadClient = useCallback(async () => {
    const clientData = await getClientById(id);
    const clientDeals = sortDealsNewestFirst(clientData.dealsHistory || []);

    setClient({
      ...clientData,
      initials: clientData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase(),
      deals: clientDeals,
      activity: mapDealsToActivity(clientData.dealsHistory || []),
    });
  }, [id]);

  useEffect(() => {
    loadClient()
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [loadClient]);

  function openDealModal() {
    setDealName('');
    setDealAmount('');
    setDealError('');
    setDealModalOpen(true);
  }

  function closeDealModal() {
    if (!dealSubmitting) setDealModalOpen(false);
  }

  async function handleCreateDeal(e) {
    e.preventDefault();
    setDealError('');

    const amount = Number(dealAmount);
    if (!dealName.trim()) {
      setDealError('Enter a deal name');
      return;
    }
    if (Number.isNaN(amount) || amount <= 0) {
      setDealError('Enter a valid budget amount');
      return;
    }

    setDealSubmitting(true);
    try {
      const created = await createDeal({
        name: dealName.trim(),
        amount,
        clientId: id,
      });

      setClient((prev) => {
        const deals = sortDealsNewestFirst([created, ...(prev.deals || [])]);
        return {
          ...prev,
          deals,
          activity: mapDealsToActivity(deals),
        };
      });

      setDealModalOpen(false);
      setTab('deals');
    } catch (err) {
      setDealError(formatError(err));
    } finally {
      setDealSubmitting(false);
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

  if (!client) {
    return (
      <div style={cardStyles.page}>
        <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
          Client not found
        </div>
      </div>
    );
  }

  const st = statusMap[client.status] || statusMap.cold;
  const totalAmount = client.deals
    ? client.deals.reduce((s, d) => s + (d.amount || 0), 0)
    : 0;

  return (
    <div style={cardStyles.page}>
      <div style={cardStyles.breadcrumb}>
        <Link to="/clients" style={cardStyles.breadLink}>
          ← Clients
        </Link>
        <span style={cardStyles.breadSep}>›</span>
        <span style={cardStyles.breadCurrent}>{client.name}</span>
      </div>

      <div style={cardStyles.layout}>
        <div style={cardStyles.leftPanel}>
          <div style={cardStyles.profileCard}>
            <div
              style={{
                ...cardStyles.avatarLg,
                background: st.bg,
                color: st.color,
              }}
            >
              {client.initials}
            </div>
            <h2 style={cardStyles.clientName}>{client.name}</h2>
            <p style={cardStyles.clientPos}>
              {client.position || 'Contact'} · {client.company}
            </p>
            <div style={cardStyles.tagsRow}>
              {(client.tags || []).map((t, i) => (
                <span key={i} style={cardStyles.tag}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div style={cardStyles.infoBlock}>
            <p style={cardStyles.blockTitle}>Contacts</p>
            {[
              { key: 'Email', val: client.email, blue: true },
              { key: 'Phone', val: client.phone },
              { key: 'Company', val: client.company },
              { key: 'Source', val: client.source },
              { key: 'Status', val: st.label },
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

          <div style={cardStyles.statsRow}>
            <div style={cardStyles.statItem}>
              <p style={cardStyles.statVal}>
                {client.deals ? client.deals.length : 0}
              </p>
              <p style={cardStyles.statLabel}>Deals</p>
            </div>
            <div style={cardStyles.statDivider} />
            <div style={cardStyles.statItem}>
              <p style={{ ...cardStyles.statVal, color: '#3B82F6' }}>
                {fmt(totalAmount)}
              </p>
              <p style={cardStyles.statLabel}>Total value</p>
            </div>
          </div>
        </div>

        <div style={cardStyles.rightPanel}>
          <div style={cardStyles.tabs}>
            {['activity', 'deals'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                style={{
                  ...cardStyles.tabBtn,
                  borderBottom:
                    tab === t ? '2px solid #3B82F6' : '2px solid transparent',
                  color: tab === t ? '#3B82F6' : '#64748B',
                  fontWeight: tab === t ? 600 : 400,
                }}
              >
                {{ activity: 'History', deals: 'Deals' }[t]}
              </button>
            ))}
          </div>

          {tab === 'activity' && (
            <div style={cardStyles.tabContent}>
              {client.activity && client.activity.length > 0 ? (
                client.activity.slice(0, 5).map((a, i) => (
                  <div key={i} style={cardStyles.timelineItem}>
                    <div
                      style={{
                        ...cardStyles.timelineIcon,
                        background: (a.color || '#3B82F6') + '22',
                        color: a.color || '#3B82F6',
                      }}
                    >
                      {a.icon}
                    </div>
                    <div style={cardStyles.timelineBody}>
                      <div style={cardStyles.timelineConnector} />
                      <p style={cardStyles.timelineText}>{a.text}</p>
                      <p style={cardStyles.timelineTime}>{a.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    padding: '24px',
                    color: '#64748B',
                    textAlign: 'center',
                  }}
                >
                  No activity history
                </div>
              )}
            </div>
          )}

          {tab === 'deals' && (
            <div style={cardStyles.tabContent}>
              <div style={cardStyles.dealsTabHeader}>
                <button
                  type="button"
                  className="crm-btn-primary"
                  style={cardStyles.btnPrimary}
                  onClick={openDealModal}
                >
                  + Add Deal
                </button>
              </div>

              {client.deals && client.deals.length > 0 ? (
                <div>
                  {client.deals.map((d) => (
                    <div
                      key={d._id || d.id}
                      className="crm-deal-row"
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/deals/${d._id || d.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          navigate(`/deals/${d._id || d.id}`);
                        }
                      }}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: '1px solid #F1F5F9',
                        cursor: 'pointer',
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
                        <p
                          style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}
                        >
                          {d.managerName || 'Unassigned'}
                        </p>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
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
                <div
                  style={{
                    padding: '24px',
                    color: '#64748B',
                    textAlign: 'center',
                  }}
                >
                  No deals found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {dealModalOpen && (
        <div
          style={cardStyles.overlay}
          role="presentation"
          onClick={closeDealModal}
        >
          <div
            style={cardStyles.modal}
            role="dialog"
            aria-labelledby="add-deal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="add-deal-title" style={cardStyles.modalTitle}>
              New Deal
            </h2>

            {dealError && <p style={cardStyles.errorBox}>{dealError}</p>}

            <form onSubmit={handleCreateDeal}>
              <div style={cardStyles.field}>
                <label style={cardStyles.label} htmlFor="deal-name">
                  Deal name
                </label>
                <input
                  id="deal-name"
                  style={cardStyles.input}
                  value={dealName}
                  onChange={(e) => setDealName(e.target.value)}
                  placeholder="e.g. CRM Implementation"
                  required
                />
              </div>

              <div style={cardStyles.field}>
                <label style={cardStyles.label} htmlFor="deal-amount">
                  Budget ($)
                </label>
                <input
                  id="deal-amount"
                  style={cardStyles.input}
                  type="number"
                  min="1"
                  step="any"
                  value={dealAmount}
                  onChange={(e) => setDealAmount(e.target.value)}
                  placeholder="10000"
                  required
                />
              </div>

              <div style={cardStyles.modalActions}>
                <button
                  type="button"
                  className="crm-btn-secondary"
                  style={cardStyles.btnSecondary}
                  onClick={closeDealModal}
                  disabled={dealSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="crm-btn-primary"
                  style={cardStyles.btnPrimary}
                  disabled={dealSubmitting}
                >
                  {dealSubmitting ? 'Saving…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
