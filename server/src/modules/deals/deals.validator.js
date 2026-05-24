import { z } from 'zod';

const dealFieldsSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  company: z.string().min(1, 'Company is required').max(100),
  amount: z.number().positive('Amount must be positive'),
  stage: z.enum(['new', 'inProgress', 'negotiation', 'closed']).optional(),
  date: z.string().optional(),
  clientId: z.string().optional(),
  description: z.string().optional(),
});

/** Create deal — clientId required; company optional (filled from Client on server). */
const createDealBodySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  amount: z.number().positive('Amount must be positive'),
  clientId: z.string().min(1, 'clientId is required'),
  company: z.string().min(1).max(100).optional(),
  stage: z.enum(['new', 'inProgress', 'negotiation', 'closed']).optional(),
  date: z.string().optional(),
  description: z.string().optional(),
});

// NOTE: managerId is set server-side from req.user.id, not accepted from client.

export const createDealSchema = z.object({
  body: createDealBodySchema,
  query: z.record(z.unknown()).optional(),
  params: z.record(z.unknown()).optional(),
});

export const updateDealSchema = z.object({
  body: dealFieldsSchema.partial(),
  query: z.record(z.unknown()).optional(),
  params: z.record(z.unknown()).optional(),
});
