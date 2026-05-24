import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authenticate, authorize } from '../auth/auth.middleware.js';
import { createClientSchema, updateClientSchema } from './clients.validator.js';
import { getClients, getClientById, createClient, updateClient, deleteClient } from './clients.service.js';
import { RoleNames } from '../../constants.js';
import { parsePaginationQuery } from '../../utils/pagination.js';

const router = Router();

router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { filter, search } = req.query;
  const { page, limit } = parsePaginationQuery(req.query);
  const result = await getClients({ filter, search, page, limit });
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const client = await getClientById(req.params.id, {
    userId: req.user.id,
    role: req.user.role,
  });
  if (!client) {
    return res.status(404).json({ success: false, message: 'Client not found' });
  }
  res.json({ success: true, data: client });
}));

router.post('/', authenticate, validate(createClientSchema), asyncHandler(async (req, res) => {
  const client = await createClient(req.body);
  res.status(201).json({ success: true, data: client });
}));

router.put('/:id', authenticate, validate(updateClientSchema), asyncHandler(async (req, res) => {
  const client = await updateClient(req.params.id, req.body);
  if (!client) {
    return res.status(404).json({ success: false, message: 'Client not found' });
  }
  res.json({ success: true, data: client });
}));

router.delete(
  '/:id',
  authenticate,
  authorize(RoleNames.ADMIN),
  asyncHandler(async (req, res) => {
    const client = await deleteClient(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    res.json({ success: true, data: client });
  }),
);

export default router;
