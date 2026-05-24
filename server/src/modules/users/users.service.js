import User from './users.model.js';
import RefreshToken from '../auth/auth.model.js';
import { RoleNames, UserStatuses, UserStatusesArray } from '../../constants.js';
import { AppError } from '../../utils/AppError.js';
import { hashPassword, sanitizeUser, buildUserDisplayName } from './users.utils.js';
import { getDealsByManagerId } from '../deals/deals.service.js';

export async function createUser(data) {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    throw new AppError('Email already in use', 409);
  }

  const passwordHash = await hashPassword(data.password);

  const user = await User.create({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: passwordHash,
    phone: data.phone,
    role: data.role,
    status: UserStatuses.ACTIVE,
  });

  return sanitizeUser(user);
}

export async function findUserByEmail(email, { withPassword = false } = {}) {
  const query = User.findOne({ email: email.toLowerCase().trim() });
  if (withPassword) query.select('+password');
  return query;
}

export async function findUserById(id) {
  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);
  return sanitizeUser(user);
}

function staffPublicProfile(user) {
  return {
    id: user._id.toString(),
    name: buildUserDisplayName(user),
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    deals: [],
  };
}

export async function getUserByIdForViewer(id, { viewerRole } = {}) {
  const user = await User.findById(id).lean();
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (viewerRole === RoleNames.STAFF) {
    return staffPublicProfile(user);
  }

  const safe = sanitizeUser(user);
  const deals = await getDealsByManagerId(user._id);
  const dealsTotal = deals.reduce((sum, d) => sum + (d.amount || 0), 0);

  return {
    id: user._id.toString(),
    firstName: safe.firstName,
    lastName: safe.lastName,
    name: buildUserDisplayName(user),
    email: safe.email,
    phone: safe.phone || '',
    role: safe.role,
    status: safe.status,
    totalSales: safe.totalSales ?? 0,
    graphColor: safe.graphColor,
    createdAt: safe.createdAt,
    deals,
    dealsCount: deals.length,
    dealsTotal,
  };
}

export async function updateUserStatus(id, status) {
  if (!UserStatusesArray.includes(status)) {
    throw new AppError('Invalid status', 400);
  }

  const user = await User.findByIdAndUpdate(id, { status }, { new: true }).lean();
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return getUserByIdForViewer(id, { viewerRole: RoleNames.ADMIN });
}

export async function listUsers() {
  const users = await User.find()
    .sort({ createdAt: 1 })
    .lean();

  return users.map((user) => {
    const safe = sanitizeUser(user);
    const name = [safe.firstName, safe.lastName].filter(Boolean).join(' ') || safe.email;
    return {
      id: user._id.toString(),
      firstName: safe.firstName,
      lastName: safe.lastName,
      name,
      email: safe.email,
      role: safe.role,
      status: safe.status,
      createdAt: safe.createdAt,
    };
  });
}

export async function deleteUser(id) {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  await RefreshToken.deleteMany({ user: id });

  return sanitizeUser(user);
}
