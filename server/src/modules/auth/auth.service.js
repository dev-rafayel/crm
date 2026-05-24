import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../users/users.model.js';
import RefreshToken from './auth.model.js';
import { UserStatuses } from '../../constants.js';
import { AppError } from '../../utils/AppError.js';
import { comparePassword } from '../users/users.utils.js';
import { sanitizeUser } from '../users/users.utils.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from './auth.utils.js';
import { findUserByEmail, findUserById } from '../users/users.service.js';

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function getRefreshExpiry(refreshToken) {
  const decoded = jwt.decode(refreshToken);
  if (!decoded?.exp) throw new AppError('Invalid refresh token', 401);
  return new Date(decoded.exp * 1000);
}

async function saveRefreshToken(userId, refreshToken) {
  await RefreshToken.create({
    user: userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: getRefreshExpiry(refreshToken),
  });
}

async function issueTokenPair(user) {
  const payload = { sub: user._id.toString(), role: user.role, email: user.email };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await saveRefreshToken(user._id, refreshToken);

  return {
    accessToken,
    refreshToken,
    user: sanitizeUser(user),
  };
}

export async function login(email, password) {
  const user = await findUserByEmail(email, { withPassword: true });

  if (!user) {
    throw new AppError('Check the information you have provided for accuracy.', 401);
  }

  if (user.status !== UserStatuses.ACTIVE) {
    throw new AppError(`Account is ${user.status}`, 403);
  }

  if (!user.password) {
    throw new AppError('Password not set. Complete your invite first.', 403);
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    throw new AppError('Check the information you have provided for accuracy.', 422);
  }

  return issueTokenPair(user);
}

export async function refresh(refreshToken) {
  try {
    verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Invalid or expired refresh token', 422);
  }

  const stored = await RefreshToken.findOne({ tokenHash: hashToken(refreshToken) });
  if (!stored) {
    throw new AppError('Refresh token revoked or not found', 422);
  }

  await RefreshToken.deleteOne({ _id: stored._id });

  const user = await User.findById(stored.user);
  if (!user || user.status !== UserStatuses.ACTIVE) {
    throw new AppError('User is not available', 422);
  }

  return issueTokenPair(user);
}

export async function logout(refreshToken) {
  await RefreshToken.deleteOne({ tokenHash: hashToken(refreshToken) });
}

export async function getMe(userId) {
  return findUserById(userId);
}
