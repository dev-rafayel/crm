import crypto from 'crypto';
import Invite from './invite.model.js';
import User from '../users/users.model.js';
import { RoleNames, UserStatuses } from '../../constants.js';
import { AppError } from '../../utils/AppError.js';
import { hashPassword, sanitizeUser } from '../users/users.utils.js';
import { sendInviteEmail } from '../email/email.service.js';

export async function createInvite({ email, role }) {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  const pendingInvite = await Invite.findOne({
    email: normalizedEmail,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });
  if (pendingInvite) {
    throw new AppError('An active invite already exists for this email', 409);
  }

  const token = crypto.randomBytes(32).toString('hex');
  const invite = await Invite.create({
    email: normalizedEmail,
    token,
    role: role || RoleNames.STAFF,
    expiresAt: Invite.defaultExpiresAt(),
  });

  try {
    await sendInviteEmail({ to: normalizedEmail, token });
  } catch (err) {
    await Invite.deleteOne({ _id: invite._id });
    const isAuthError = err.code === 'EAUTH';
    throw new AppError(
      isAuthError
        ? 'Gmail rejected SMTP login. Use a Google App Password (not your account password) in SMTP_PASS.'
        : 'Failed to send invitation email. Please check mail settings and try again.',
      502,
      { cause: err.message },
    );
  }

  return {
    email: invite.email,
    role: invite.role,
    expiresAt: invite.expiresAt,
  };
}

export async function registerByInvite({ token, firstName, lastName, phone, password }) {
  const invite = await Invite.findOne({ token });

  if (!invite) {
    throw new AppError('Invalid or expired invitation', 400);
  }

  if (invite.isUsed) {
    throw new AppError('This invitation has already been used', 400);
  }

  if (invite.expiresAt <= new Date()) {
    throw new AppError('Invitation has expired', 400);
  }

  const existingUser = await User.findOne({ email: invite.email });
  if (existingUser) {
    invite.isUsed = true;
    await invite.save();
    throw new AppError('User with this email already exists', 409);
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    firstName,
    lastName,
    email: invite.email,
    phone,
    password: passwordHash,
    role: invite.role,
    status: UserStatuses.ACTIVE,
  });

  invite.isUsed = true;
  await invite.save();

  return sanitizeUser(user);
}

export async function listPendingInvites() {
  const invites = await Invite.find({
    isUsed: false,
    expiresAt: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .lean();

  return invites.map((invite) => ({
    id: invite._id.toString(),
    email: invite.email,
    role: invite.role,
    createdAt: invite.createdAt,
    expiresAt: invite.expiresAt,
  }));
}
