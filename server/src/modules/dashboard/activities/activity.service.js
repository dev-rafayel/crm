import Activity from './activity.model.js';
import User from '../../users/users.model.js';

export async function getStaffDisplayName(userId) {
  if (!userId) return 'Staff';
  const user = await User.findById(userId, { firstName: 1, lastName: 1 }).lean();
  if (!user) return 'Staff';
  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  return name || 'Staff';
}

export function formatDealActivityText({ verb, dealName, amount, staffName }) {
  const formattedAmount = Number(amount || 0).toLocaleString('en-US');
  const label = dealName || 'Deal';
  return `${verb} — ${label}, $${formattedAmount} (${staffName})`;
}

export async function recordDealActivity({ verb, deal, actorId }) {
  const staffName = await getStaffDisplayName(
    actorId || deal.managerId || deal.createdBy,
  );
  const text = formatDealActivityText({
    verb,
    dealName: deal.name,
    amount: deal.amount,
    staffName,
  });

  return Activity.create({
    text,
    type: 'deal',
  });
}

export async function createActivity({ text, type = 'system' }) {
  return Activity.create({ text, type });
}
