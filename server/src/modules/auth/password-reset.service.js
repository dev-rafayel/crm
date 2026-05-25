import crypto from 'crypto';
import PasswordReset, { MAX_ATTEMPTS } from './password-reset.model.js';
import RefreshToken from './auth.model.js';
import { findUserByEmail } from '../users/users.service.js';
import { hashPassword } from '../users/users.utils.js';
import { UserStatuses } from '../../constants.js';
import { AppError } from '../../utils/AppError.js';
import { sendPasswordResetEmail } from '../email/email.service.js';

function normalizeEmail(email) {
  return email.toLowerCase().trim();
}

function hashCode(code, email) {
  return crypto.createHash('sha256').update(`${code}:${email}`).digest('hex');
}

function generateCode() {
  return String(crypto.randomInt(100000, 1000000));
}

export async function requestPasswordResetCode(email) {
  const normalizedEmail = normalizeEmail(email);
  const user = await findUserByEmail(normalizedEmail, { withPassword: true });

  const canReset = user && user.status === UserStatuses.ACTIVE && user.password;

  if (canReset) {
    const code = generateCode();
    await PasswordReset.deleteMany({ email: normalizedEmail });
    await PasswordReset.create({
      email: normalizedEmail,
      codeHash: hashCode(code, normalizedEmail),
      expiresAt: PasswordReset.defaultExpiresAt(),
    });

    try {
      await sendPasswordResetEmail({ to: normalizedEmail, code });
    } catch (err) {
      await PasswordReset.deleteMany({ email: normalizedEmail });
      const isAuthError = err.code === 'EAUTH';
      throw new AppError(
        isAuthError
          ? 'Gmail rejected SMTP login. Use a Google App Password in SMTP_PASS.'
          : 'Failed to send verification email. Check mail settings and try again.',
        502,
        { cause: err.message },
      );
    }
  }

  return {
    message:
      'If an account exists for this email, a verification code has been sent.',
  };
}

export async function verifyPasswordResetCode({ email, code }) {
  const normalizedEmail = normalizeEmail(email);
  const reset = await PasswordReset.findOne({ email: normalizedEmail });

  if (!reset || reset.expiresAt <= new Date()) {
    throw new AppError('Invalid or expired verification code', 400);
  }

  if (reset.attempts >= MAX_ATTEMPTS) {
    await PasswordReset.deleteOne({ _id: reset._id });
    throw new AppError('Too many attempts. Request a new code.', 429);
  }

  const codeHash = hashCode(String(code).trim(), normalizedEmail);
  if (codeHash !== reset.codeHash) {
    reset.attempts += 1;
    await reset.save();
    throw new AppError('Invalid verification code', 400);
  }

  return { message: 'Verification code is valid' };
}

export async function resetPasswordWithCode({ email, code, password }) {
  const normalizedEmail = normalizeEmail(email);
  const reset = await PasswordReset.findOne({ email: normalizedEmail });

  if (!reset || reset.expiresAt <= new Date()) {
    throw new AppError('Invalid or expired verification code', 400);
  }

  if (reset.attempts >= MAX_ATTEMPTS) {
    await PasswordReset.deleteOne({ _id: reset._id });
    throw new AppError('Too many attempts. Request a new code.', 429);
  }

  const codeHash = hashCode(String(code).trim(), normalizedEmail);
  if (codeHash !== reset.codeHash) {
    reset.attempts += 1;
    await reset.save();
    throw new AppError('Invalid verification code', 400);
  }

  const user = await findUserByEmail(normalizedEmail, { withPassword: true });
  if (!user || user.status !== UserStatuses.ACTIVE) {
    await PasswordReset.deleteOne({ _id: reset._id });
    throw new AppError('Account is not available for password reset', 400);
  }

  user.password = await hashPassword(password);
  await user.save();
  await PasswordReset.deleteOne({ _id: reset._id });
  await RefreshToken.deleteMany({ user: user._id });

  return { message: 'Password updated successfully' };
}
