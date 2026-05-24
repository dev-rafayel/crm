import { z } from 'zod';

const clientFieldsSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  company: z.string().min(1, 'Company is required').max(100),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, 'Phone number must be in international E.164 format with minimum 7 digits.').optional(),
  status: z.enum(['hot', 'warm', 'cold']).optional(),
  position: z.string().optional(),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
  added: z.string().optional(),
});

export const createClientSchema = z.object({
  body: clientFieldsSchema,
  query: z.record(z.unknown()).optional(),
  params: z.record(z.unknown()).optional(),
});

export const updateClientSchema = z.object({
  body: clientFieldsSchema.partial(),
  query: z.record(z.unknown()).optional(),
  params: z.record(z.unknown()).optional(),
});
