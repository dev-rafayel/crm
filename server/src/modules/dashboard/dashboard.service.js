import Deal from '../deals/deals.model.js';
import Client from '../clients/clients.model.js';
import User from '../users/users.model.js';
import { UserStatuses } from '../../constants.js';
import Activity from './activities/activity.model.js';

function formatRelativeTime(date) {
  const t = new Date(date).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - t);
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export async function getDashboardData() {
  // Добавляем Activity.find() в наш общий Promise.all
  const [clients, deals, staff, dbActivities] = await Promise.all([
    Client.find({}, { _id: 1 }).lean(),
    Deal.find({}).lean(),
    User.find(
      { role: { $in: ['staff', 'admin'] }, status: UserStatuses.ACTIVE },
      { firstName: 1, lastName: 1, _id: 1, totalSales: 1, graphColor: 1 },
    ).lean(),
    Activity.find().sort({ createdAt: -1 }).limit(6).lean().catch(() => []), // Фолбек на случай, если коллекции еще нет
  ]);

  // 1. АГРЕГАЦИЯ МЕНЕДЖЕРОВ
  const amountByUser = new Map();
  for (const d of deals) {
    const uid = d.managerId?.toString?.() || d.createdBy?.toString?.() || d.createdBy;
    if (!uid) continue;
    const prev = amountByUser.get(uid) || 0;
    amountByUser.set(uid, prev + (d.amount || 0));
  }

  const staffById = new Map(
    staff.map((u) => [u._id.toString(), u]),
  );

  const defaultColors = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899'];

  const managerRows = staff
    .map((u) => {
      const userId = u._id.toString();
      const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown';
      const dealTotal = amountByUser.get(userId) || 0;
      const amount = dealTotal > 0 ? dealTotal : (u.totalSales || 0);
      return {
        name,
        amount,
        color: u.graphColor || defaultColors[0],
        userId,
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  const maxSales = managerRows.length > 0 ? Math.max(...managerRows.map((m) => m.amount), 1) : 1;
  const managersFinal = managerRows.map((m, i) => ({
    name: m.name,
    amount: `$${Math.round(m.amount / 1000)}k`,
    pct: Math.round((m.amount / maxSales) * 100),
    color: m.color || defaultColors[i % defaultColors.length],
  }));

  // 2. РАСЧЁТ МЕТРИК И ВОРОНКИ (Твой оригинальный код)
  const stageConfig = {
    new: { title: 'New', color: '#3B82F6' },
    inProgress: { title: 'In progress', color: '#60A5FA' },
    negotiation: { title: 'Negotiations', color: '#F59E0B' },
    closed: { title: 'Closed', color: '#10B981' },
  };

  const totalClients = clients.length;
  const activeDeals = deals.filter((d) => d.stage !== 'closed').length;
  const totalRevenue = deals.reduce((sum, d) => sum + (d.amount || 0), 0);
  const conversion = totalClients > 0 ? Math.round((deals.length / totalClients) * 100) : 0;

  const metrics = [
    { label: 'Total clients', value: totalClients.toString(), sub: `+${totalClients} this month`, color: '#3B82F6' },
    { label: 'Active deals', value: activeDeals.toString(), sub: `+${activeDeals} this week`, color: '#10B981' },
    { label: 'Revenue (total)', value: `$${(totalRevenue / 1000).toFixed(1)}k`, sub: '+18% from last', color: '#F59E0B' },
    { label: 'Conversion', value: `${conversion}%`, sub: '+2% from last', color: '#8B5CF6' },
  ];

  const pipeline = Object.entries(stageConfig).map(([stage, config]) => {
    const stageDeals = deals.filter((d) => d.stage === stage);
    const amount = stageDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
    return {
      stage: config.title,
      count: stageDeals.length,
      amount: `$${(amount / 1000).toFixed(1)}k`,
      color: config.color,
      pct: Math.min(100, stageDeals.length * 20),
    };
  });

  // 3. ОБРАБОТКА ЛЕНТЫ АКТИВНОСТЕЙ (Recent Activities)
  let activities = [];

  if (dbActivities && dbActivities.length > 0) {
    const newestFirst = [...dbActivities].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    activities = newestFirst.map((act, idx) => ({
      text: act.text,
      time: formatRelativeTime(act.createdAt),
      color: defaultColors[idx % defaultColors.length],
    }));
  } else {
    // Иначе откатываемся на твою крутую генерацию логов на лету из последних сделок
    const latestDeals = deals
      .slice()
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
      .slice(0, 4);

    activities = latestDeals.map((d, idx) => {
      const uid = d.managerId?.toString?.() || d.createdBy?.toString?.() || d.createdBy;
      const staffUser = staffById.get(uid);
      const staffName = staffUser
        ? `${staffUser.firstName || ''} ${staffUser.lastName || ''}`.trim() || 'Staff'
        : 'Staff';
      const verb = d.stage === 'closed' ? 'Closed deal' : 'Updated deal';

      return {
        text: `${verb} — ${d.name || 'Deal'}, $${(d.amount || 0).toLocaleString()} (${staffName})`,
        time: formatRelativeTime(d.updatedAt || d.createdAt),
        color: defaultColors[idx % defaultColors.length],
      };
    });
  }

  return {
    metrics,
    pipeline,
    managers: managersFinal,
    activities,
  };
}