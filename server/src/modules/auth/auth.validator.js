import { z } from 'zod';
import { RoleNamesArray } from '../../constants.js';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
    password: z.string().min(1),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

export const logoutSchema = refreshSchema;

export const inviteSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
    role: z.enum(RoleNamesArray).default('staff'),
  }),
});

const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^\+?[1-9]\d{6,14}$/,
    'Phone number must be in international E.164 format with minimum 7 digits.',
  );

export const registerByInviteSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    firstName: z.string().trim().min(1, 'First name is required').max(50),
    lastName: z.string().trim().min(1, 'Last name is required').max(50),
    phone: phoneSchema,
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
    code: z
      .string()
      .trim()
      .regex(/^\d{6}$/, 'Verification code must be 6 digits'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

export const verifyPasswordResetCodeSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
    code: z
      .string()
      .trim()
      .regex(/^\d{6}$/, 'Verification code must be 6 digits'),
  }),
});
