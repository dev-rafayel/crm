import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function sanitizeUser(user) {
  const doc = user.toObject ? user.toObject() : user;
  const { password, __v, invite_token, ...safe } = doc;
  return safe;
}

export function buildUserDisplayName(user) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return name || user.email || 'User';
}
