const styles = {
  page: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#F8F9FB",
    minHeight: "100vh",
    padding: "32px",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  heading: {
    fontSize: 26,
    fontWeight: 600,
    color: "#0F172A",
    margin: 0,
  },
  subheading: {
    fontSize: 13,
    color: "#94A3B8",
    margin: "4px 0 0",
  },
  headerRight: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginBottom: 20,
  },
  metricCard: {
    background: "#fff",
    borderRadius: 12,
    padding: "20px 20px 16px",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
    cursor: "default",
  },
  metricLabel: {
    fontSize: 12,
    color: "#94A3B8",
    margin: "0 0 8px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 700,
    margin: "0 0 6px",
    lineHeight: 1,
  },
  metricSub: {
    fontSize: 12,
    color: "#10B981",
    margin: 0,
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginBottom: 20,
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: "20px 24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#0F172A",
    margin: "0 0 18px",
  },
  barHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  barName: {
    fontSize: 13,
    color: "#475569",
  },
  barAmount: {
    fontSize: 13,
    fontWeight: 600,
  },
  barTrack: {
    height: 6,
    background: "#F1F5F9",
    borderRadius: 99,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 99,
    transition: "width 0.4s ease",
  },
  activityItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: "10px 0",
    borderBottom: "1px solid #F1F5F9",
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    marginTop: 4,
    flexShrink: 0,
  },
  activityText: {
    fontSize: 13,
    color: "#334155",
    margin: 0,
  },
  activityTime: {
    fontSize: 11,
    color: "#94A3B8",
    margin: "3px 0 0",
  },
  pipelineGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginTop: 4,
  },
  pipelineItem: {
    background: "#F8F9FB",
    borderRadius: 10,
    padding: "14px 16px",
  },
  pipelineTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  pipelineStage: {
    fontSize: 12,
    fontWeight: 500,
    color: "#475569",
  },
  pipelineBadge: {
    fontSize: 11,
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: 99,
  },
  pipelineAmount: {
    fontSize: 18,
    fontWeight: 700,
    margin: "0 0 10px",
  },
  pipelineTrack: {
    height: 4,
    background: "#E2E8F0",
    borderRadius: 99,
    overflow: "hidden",
  },
  pipelineFill: {
    height: "100%",
    borderRadius: 99,
  },
};

export default styles;