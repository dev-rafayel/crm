import Client from './clients.model.js';
import Deal from '../deals/deals.model.js';
import { getDealsByClientId } from '../deals/deals.service.js';
import { RoleNames } from '../../constants.js';
import { buildPaginationMeta } from '../../utils/pagination.js';

const INTERNAL_CLIENT_SOURCES = ['Invite registration', 'Self-registered'];

function buildClientsMatchStage({ filter, search } = {}) {
  const matchStage = {
    source: { $nin: INTERNAL_CLIENT_SOURCES },
  };

  if (search) {
    matchStage.$or = [
      { name: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  if (filter && filter !== 'all') {
    matchStage.status = filter;
  }

  return matchStage;
}

function clientsListPipeline(matchStage) {
  return [
    { $match: matchStage },
    {
      $lookup: {
        from: Deal.collection.name,
        localField: '_id',
        foreignField: 'clientId',
        as: 'deals',
      },
    },
    {
      $addFields: {
        dealsCount: { $size: '$deals' },
        amount: { $sum: '$deals.amount' },
      },
    },
    {
      $project: {
        id: { $toString: '$_id' },
        _id: 0,
        name: 1,
        company: 1,
        email: 1,
        phone: 1,
        status: 1,
        position: 1,
        source: 1,
        tags: 1,
        added: 1,
        dealsCount: 1,
        amount: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    { $sort: { createdAt: 1 } },
  ];
}

export async function getClients({ filter, search, page = 1, limit = 20 } = {}) {
  const matchStage = buildClientsMatchStage({ filter, search });
  const skip = (page - 1) * limit;

  const [result] = await Client.aggregate([
    ...clientsListPipeline(matchStage),
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        meta: [{ $count: 'total' }],
      },
    },
  ]);

  const totalItems = result?.meta?.[0]?.total ?? 0;

  return {
    data: result?.data ?? [],
    pagination: buildPaginationMeta(totalItems, page, limit),
  };
}

export async function getClientById(id, { userId, role } = {}) {
  const client = await Client.findById(id);
  if (!client) return null;

  const deals = await getDealsByClientId(id, {
    userId,
    role: role === RoleNames.ADMIN ? RoleNames.ADMIN : RoleNames.STAFF,
  });

  return {
    ...client.toObject(),
    id: client._id.toString(),
    dealsHistory: deals,
  };
}

export async function createClient(data) {
  const client = await Client.create(data);
  return {
    ...client.toObject(),
    id: client._id.toString(),
  };
}

export async function updateClient(id, data) {
  return await Client.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteClient(id) {
  return await Client.findByIdAndDelete(id);
}
