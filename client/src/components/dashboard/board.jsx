import { useState, useEffect } from 'react';
import styles from './style';
import { API_URL } from '../config/api'

export default function Dashboard() {
  const [activeMetric, setActiveMetric] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${API_URL}/dashboard`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Failed to load dashboard data');
        }

        setData(json.data);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const metrics = data?.metrics || [];
  const pipeline = data?.pipeline || [];
  const managers = data?.managers || [];
  const activities = data?.activities || [];

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>Dashboard</h1>
          <p style={styles.subheading}>Monday, May 18 2026</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={styles.metricsGrid}>
        {metrics.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.metricCard,
              borderTop: `3px solid ${m.color}`,
              transform: activeMetric === i ? 'translateY(-3px)' : 'translateY(0)',
              boxShadow:
                activeMetric === i
                  ? `0 8px 24px ${m.color}22`
                  : '0 1px 3px rgba(0,0,0,0.06)',
            }}
            onMouseEnter={() => setActiveMetric(i)}
            onMouseLeave={() => setActiveMetric(null)}
          >
            <p style={styles.metricLabel}>{m.label}</p>
            <p style={{ ...styles.metricValue, color: m.color }}>{m.value}</p>
            <p style={styles.metricSub}>{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Middle row */}
      <div style={styles.twoCol}>
        {/* Sales by manager */}
        <div style={styles.card}>
          <p style={styles.cardTitle}>Sales by Manager</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {managers.length === 0 && (
              <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>
                No manager sales data yet. Add staff in Team or assign deals to users.
              </p>
            )}
            {managers.map((m, i) => (
              <div key={m.name + i}>
                <div style={styles.barHeader}>
                  <span style={styles.barName}>{m.name}</span>
                  <span style={{ ...styles.barAmount, color: m.color }}>{m.amount}</span>
                </div>
                <div style={styles.barTrack}>
                  <div
                    style={{
                      ...styles.barFill,
                      width: `${m.pct}%`,
                      background: m.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div style={styles.card}>
          <p style={styles.cardTitle}>Recent Activity</p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {activities.map((a, i) => (
              <div key={i} style={styles.activityItem}>
                <div style={{ ...styles.activityDot, background: a.color }} />
                <div>
                  <p style={styles.activityText}>{a.text}</p>
                  <p style={styles.activityTime}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <div style={styles.card}>
        <p style={styles.cardTitle}>Sales Funnel</p>
        <div style={styles.pipelineGrid}>
          {pipeline.map((p, i) => (
            <div key={i} style={styles.pipelineItem}>
              <div style={styles.pipelineTop}>
                <span style={styles.pipelineStage}>{p.stage}</span>
                <span style={{ ...styles.pipelineBadge, background: p.color + '22', color: p.color }}>
                  {p.count}
                </span>
              </div>
              <p style={{ ...styles.pipelineAmount, color: p.color }}>{p.amount}</p>
              <div style={styles.pipelineTrack}>
                <div
                  style={{
                    ...styles.pipelineFill,
                    width: `${p.pct}%`,
                    background: p.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

