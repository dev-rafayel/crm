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
    marginBottom: 24,
  },
  heading: { fontSize: 26, fontWeight: 600, color: "#0F172A", margin: 0 },
  subheading: { fontSize: 13, color: "#94A3B8", margin: "4px 0 0" },
  btnPrimary: {
    padding: "8px 18px", fontSize: 13, fontWeight: 500,
    background: "#3B82F6", color: "#fff", border: "none",
    borderRadius: 8, cursor: "pointer",
  },
  btnDanger: {
    padding: "8px 14px", fontSize: 12, fontWeight: 500,
    background: "#FEE2E2", color: "#DC2626", border: "1px solid #FECACA",
    borderRadius: 8, cursor: "pointer",
  },
  toolbar: {
    display: "flex", gap: 10, marginBottom: 16, alignItems: "center", flexWrap: "wrap",
  },
  searchWrap: {
    position: "relative", flex: 1, minWidth: 220,
  },
  searchIcon: {
    position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
    width: 16, height: 16, pointerEvents: "none",
  },
  searchInput: {
    width: "100%", padding: "8px 12px 8px 34px", fontSize: 13,
    border: "1px solid #E2E8F0", borderRadius: 8,
    background: "#fff", color: "#0F172A", outline: "none", boxSizing: "border-box",
  },
  filters: { display: "flex", gap: 6 },
  filterBtn: {
    padding: "7px 14px", fontSize: 12, fontWeight: 500,
    border: "1px solid", borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
  },
  tableWrap: {
    background: "#fff", borderRadius: 12, overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #F1F5F9",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 600,
    color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em",
    background: "#F8F9FB", borderBottom: "1px solid #F1F5F9",
  },
  tr: { borderBottom: "1px solid #F8F9FB", transition: "background 0.1s" },
  td: { padding: "12px 16px", fontSize: 13, verticalAlign: "middle" },
  clientCell: { display: "flex", alignItems: "center", gap: 10 },
  avatar: {
    width: 32, height: 32, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 13, fontWeight: 600, flexShrink: 0,
  },
  clientName: { fontSize: 13, fontWeight: 500, color: "#0F172A" },
  company: { fontSize: 13, color: "#475569" },
  email: { fontSize: 12, color: "#3B82F6" },
  phone: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  dealsCount: { fontSize: 13, fontWeight: 500, color: "#0F172A" },
  amount: { fontSize: 13, fontWeight: 600, color: "#0F172A" },
  badge: {
    display: "inline-block", fontSize: 11, padding: "3px 10px",
    borderRadius: 99, fontWeight: 600,
  },
  actionBtn: {
    padding: "5px 12px", fontSize: 12, fontWeight: 500,
    background: "#F1F5F9", color: "#475569", border: "none",
    borderRadius: 6, cursor: "pointer",
  },
  actionRow: {
    display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center",
  },
  deleteBtn: {
    padding: "5px 10px", fontSize: 12, fontWeight: 500,
    background: "#FEE2E2", color: "#DC2626", border: "1px solid #FECACA",
    borderRadius: 6, cursor: "pointer",
  },
  overlay: {
    position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: 16,
  },
  modal: {
    background: "#fff", borderRadius: 12, padding: 28, width: "100%",
    maxWidth: 440, boxShadow: "0 16px 48px rgba(15, 23, 42, 0.12)",
  },
  modalTitle: {
    fontSize: 18, fontWeight: 600, color: "#0F172A", margin: "0 0 8px",
  },
  modalDesc: {
    fontSize: 14, color: "#64748B", lineHeight: 1.55, margin: "0 0 20px",
  },
  btnDangerSolid: {
    padding: "10px 16px", fontSize: 14, fontWeight: 500,
    background: "#DC2626", color: "#fff", border: "none",
    borderRadius: 8, cursor: "pointer",
  },
  field: { marginBottom: 16 },
  label: {
    display: "block", fontSize: 13, fontWeight: 500, color: "#334155", marginBottom: 6,
  },
  input: {
    width: "100%", padding: "10px 12px", fontSize: 14,
    border: "1px solid #E2E8F0", borderRadius: 8, boxSizing: "border-box",
  },
  errorBox: {
    marginBottom: 16, padding: "12px 14px", fontSize: 13,
    borderRadius: 8, background: "#FEF2F2", color: "#DC2626",
  },
  modalActions: {
    display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8,
  },
  btnSecondary: {
    padding: "10px 16px", fontSize: 14, fontWeight: 500, color: "#64748B",
    background: "#fff", border: "1px solid #E2E8F0", borderRadius: 8, cursor: "pointer",
  },
  empty: { padding: "40px", textAlign: "center", color: "#94A3B8", fontSize: 14 },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "16px 20px",
    borderTop: "1px solid #F1F5F9",
    background: "#FAFBFC",
    flexWrap: "wrap",
  },
  pageBtn: {
    minWidth: 36,
    height: 36,
    padding: "0 10px",
    fontSize: 13,
    fontWeight: 500,
    color: "#475569",
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: 8,
    cursor: "pointer",
  },
  pageBtnActive: {
    color: "#fff",
    background: "#3B82F6",
    borderColor: "#3B82F6",
    fontWeight: 600,
  },
  pageBtnDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
  },
  pageEllipsis: {
    padding: "0 4px",
    fontSize: 13,
    color: "#94A3B8",
  },
  paginationInfo: {
    marginLeft: 12,
    fontSize: 12,
    color: "#94A3B8",
  },
};

export const statusMap = {
  hot: { label: 'Aware', bg: '#FEE2E2', color: '#DC2626' },
  warm: { label: 'Unaware', bg: '#FEF3C7', color: '#D97706' },
  cold: { label: 'Cold', bg: '#E2E8F0', color: '#475569' },
};
 
export default styles;