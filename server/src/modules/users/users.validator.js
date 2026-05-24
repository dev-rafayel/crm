import { z } from 'zod';
import { RoleNamesArray, UserStatusesArray } from '../../constants.js';

export const createUserSchema = z.object({
  body: z.object({
    firstName: z.string().trim().max(50).optional(),
    lastName: z.string().trim().max(50).optional(),
    email: z.string().trim().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    phone: z.string().trim().regex(/^\+?[1-9]\d{6,14}$/, 'Phone number must be in international E.164 format with minimum 7 digits.').optional(),
    role: z.enum(RoleNamesArray).optional(),
  }),
});

export const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(UserStatusesArray),
  }),
});
