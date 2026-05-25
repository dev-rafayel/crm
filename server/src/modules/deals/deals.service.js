import mongoose from 'mongoose';
import Deal from './deals.model.js';
import Client from '../clients/clients.model.js';
import User from '../users/users.model.js';
import { AppError } from '../../utils/AppError.js';
import { recordDealActivity } from '../dashboard/activities/activity.service.js';
import { buildPaginationMeta } from '../../utils/pagination.js';

function managerDisplayName(user) {
  if (!user) return 'Unassigned';
  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  return name || 'Staff';
}

async function attachManagerNames(deals) {
  const list = (Array.isArray(deals) ? deals : [deals]).map((d) =>
    d?.toObject ? d.toObject() : d,
  );
  if (!list.length) return Array.isArray(deals) ? [] : null;

  const managerIds = [
    ...new Set(
      list.flatMap((d) => {
        const id = d.managerId || d.createdBy;
        return id ? [id.toString()] : [];
      }),
    ),
  ];
  const clientIds = [
    ...new Set(
      list.flatMap((d) => {
        return d.clientId ? [d.clientId.toString()] : [];
      }),
    ),
  ];

  const [users, clients] = await Promise.all([
    managerIds.length
      ? await User.find(
          { _id: { $in: managerIds } },
          { firstName: 1, lastName: 1 },
        ).lean()
      : [],
    clientIds.length
      ? await Client.find({ _id: { $in: clientIds } }, { name: 1 }).lean()
      : [],
  ]);

  const usersById = new Map(users.map((u) => [u._id.toString(), u]));
  const clientsById = new Map(clients.map((c) => [c._id.toString(), c]));

  const enriched = list.map((d) => {
    const managerId = d.managerId?.toString?.() || d.createdBy?.toString?.();
    const clientId = d.clientId?.toString?.();
    const user = managerId ? usersById.get(managerId) : null;
    const client = clientId ? clientsById.get(clientId) : null;

    return {
      ...d,
      managerId,
      managerName: managerDisplayName(user),
      clientId,
      clientName: client?.name || d.company || 'Unknown client',
    };
  });

  return Array.isArray(deals) ? enriched : enriched[0];
}

function dealManagerFilter(userId) {
  return {
    $or: [
      { managerId: userId },
      { managerId: { $exists: false }, createdBy: userId },
    ],
  };
}

function buildDealsFilter({ userId, stage } = {}) {
  const filter = {};
  if (userId) {
    Object.assign(filter, dealManagerFilter(userId));
  }
  if (stage) {
    filter.stage = stage;
  }
  return filter;
}

export async function getDealsPaginated({
  userId,
  stage,
  page = 1,
  limit = 20,
} = {}) {
  const filter = buildDealsFilter({ userId, stage });
  const skip = (page - 1) * limit;

  const [totalItems, deals] = await Promise.all([
    Deal.countDocuments(filter),
    Deal.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
  ]);

  return {
    data: await attachManagerNames(deals),
    pagination: buildPaginationMeta(totalItems, page, limit),
  };
}

const KANBAN_SORT = { createdAt: -1, _id: -1 };

function withKanbanAnchor(filter, anchor) {
  const cursorFilter = {
    $or: [
      { createdAt: { $lt: anchor.createdAt } },
      { createdAt: anchor.createdAt, _id: { $lt: anchor._id } },
    ],
  };

  return Object.keys(filter).length
    ? { $and: [filter, cursorFilter] }
    : cursorFilter;
}

async function resolveKanbanAnchor(baseFilter, { afterId }) {
  if (!afterId || !mongoose.isValidObjectId(afterId)) {
    return null;
  }

  const anchor = await Deal.findOne({
    ...baseFilter,
    _id: new mongoose.Types.ObjectId(afterId),
  })
    .select({ createdAt: 1, _id: 1 })
    .lean();

  if (!anchor?.createdAt || !anchor._id) {
    return null;
  }

  return { createdAt: anchor.createdAt, _id: anchor._id };
}

/** Kanban column feed: cursor (`afterId`) or page; stable sort prevents overlapping pages. */
export async function getDealsKanbanStage({
  userId,
  stage,
  page = 1,
  limit = 20,
  afterId,
} = {}) {
  if (!stage) {
    throw new AppError('stage query parameter is required', 400);
  }

  const baseFilter = buildDealsFilter({ userId, stage });
  let filter = baseFilter;

  if (afterId) {
    const anchor = await resolveKanbanAnchor(baseFilter, { afterId });
    if (!anchor) {
      throw new AppError('Invalid kanban cursor', 400);
    }
    filter = withKanbanAnchor(baseFilter, anchor);
  }

  let query = Deal.find(filter)
    .sort(KANBAN_SORT)
    .limit(limit + 1);
  if (!afterId && page > 1) {
    query = query.skip((page - 1) * limit);
  }

  const rows = await query.lean();

  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;

  return {
    stage,
    deals: await attachManagerNames(pageRows),
    hasMore,
  };
}

export async function getDeals(userId) {
  const filter = userId ? dealManagerFilter(userId) : {};
  const deals = await Deal.find(filter).sort({ createdAt: -1 });
  return await attachManagerNames(deals);
}

export async function getAllDeals() {
  const deals = await Deal.find().sort({ createdAt: -1 });
  return await attachManagerNames(deals);
}

export async function getDealsByStage(stage, userId) {
  const filter = buildDealsFilter({ userId, stage });
  const deals = await Deal.find(filter).sort({ createdAt: -1 });
  return await attachManagerNames(deals);
}

export async function getDealsByManagerId(managerId) {
  const filter = {
    $or: [
      { managerId },
      { managerId: { $exists: false }, createdBy: managerId },
    ],
  };
  const deals = await Deal.find(filter).sort({ createdAt: -1 }).lean();
  return await attachManagerNames(deals);
}

export async function getDealsByClientId(clientId, { userId, role }) {
  const filter = { clientId };
  if (role === 'staff' && userId) {
    filter.managerId = userId;
  }
  const deals = await Deal.find(filter).sort({ createdAt: -1 }).lean();
  return await attachManagerNames(deals);
}

export async function getDealById(id) {
  const deal = await Deal.findById(id);
  if (!deal) return null;
  return await attachManagerNames(deal);
}

export async function createDeal(data, { actorId } = {}) {
  const managerId = actorId || data.managerId;
  if (!managerId) {
    throw new AppError('Deal manager is required', 400);
  }

  if (!data.clientId) {
    throw new AppError('Client is required for this deal', 400);
  }

  const client = await Client.findById(data.clientId);
  if (!client) {
    throw new AppError('Client not found', 404);
  }

  const {
    createdBy: _ignoredCreatedBy,
    managerId: _ignoredManagerId,
    company: companyFromBody,
    ...rest
  } = data;

  const company = (companyFromBody && companyFromBody.trim()) || client.company;

  const deal = await Deal.create({
    ...rest,
    clientId: client._id,
    company,
    stage: rest.stage || 'new',
    managerId,
  });

  const verb = deal.stage === 'closed' ? 'Closed deal' : 'Created deal';
  await recordDealActivity({ verb, deal, actorId: managerId });

  return await attachManagerNames(deal);
}

export async function updateDeal(id, data, { actorId } = {}) {
  const {
    createdBy: _c,
    managerId: _m,
    ...safeData
  } = data;

  // 1. Сначала находим старую сделку, какая она была в базе до изменений
  const oldDeal = await Deal.findById(id);
  if (!oldDeal) return null;

  // 2. Делаем апдейт
  const updatedDeal = await Deal.findByIdAndUpdate(id, safeData, { new: true });
  if (!updatedDeal) return null;

  // 3. Проверяем, изменилось ли вообще хоть что-нибудь важное
  const isStageChanged = oldDeal.stage !== updatedDeal.stage;
  const isNameChanged = oldDeal.name !== updatedDeal.name;
  const isAmountChanged = oldDeal.amount !== updatedDeal.amount;

  // Записываем активность только если реально были изменения!
  if (isStageChanged || isNameChanged || isAmountChanged) {
    let verb = 'Updated deal';
    
    // Если изменилась стадия, сделаем лог красивым и понятным
    if (isStageChanged) {
      if (updatedDeal.stage === 'closed') {
        verb = 'Closed deal';
      } else {
        verb = `Moved to "${updatedDeal.stage}"`;
      }
    }

    const managerId = updatedDeal.managerId || updatedDeal.createdBy;
    await recordDealActivity({ 
      verb, 
      deal: updatedDeal, 
      actorId: actorId || managerId 
    });
  }

  return await attachManagerNames(updatedDeal);
}

export async function deleteDeal(id) {
  return await Deal.findByIdAndDelete(id);
}

export function getDealManagerId(deal) {
  return deal.managerId?.toString?.() || deal.createdBy?.toString?.() || null;
}
