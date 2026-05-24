/** Shared deal pipeline stage colors (board columns, badges, dashboard). */
export const DEAL_STAGE_COLORS = {
  new: {
    title: 'New',
    color: '#3B82F6',
    badgeBg: '#EFF6FF',
    badgeColor: '#3B82F6',
  },
  inProgress: {
    title: 'In Progress',
    color: '#60A5FA',
    badgeBg: '#E0F2FE',
    badgeColor: '#2563EB',
  },
  negotiation: {
    title: 'Negotiations',
    color: '#F59E0B',
    badgeBg: '#FFFBEB',
    badgeColor: '#F59E0B',
  },
  closed: {
    title: 'Closed',
    color: '#10B981',
    badgeBg: '#ECFDF5',
    badgeColor: '#10B981',
  },
};

export const columnConfig = Object.fromEntries(
  Object.entries(DEAL_STAGE_COLORS).map(([key, stage]) => [
    key,
    { title: stage.title, color: stage.color },
  ]),
);

export function getDealStageBadge(stage) {
  const s = DEAL_STAGE_COLORS[stage] || DEAL_STAGE_COLORS.new;
  return { bg: s.badgeBg, color: s.badgeColor };
}

export function getDealStageTitle(stage) {
  return DEAL_STAGE_COLORS[stage]?.title || stage;
}
