import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authenticate, authorize } from '../auth/auth.middleware.js';
import { RoleNames } from '../../constants.js';
import { createDealSchema, updateDealSchema } from './deals.validator.js';
import {
  getDealsPaginated,
  getDealsKanbanStage,
  getAllDeals,
  getDealsByStage,
  getDealById,
  getDealManagerId,
  createDeal,
  updateDeal,
  deleteDeal,
} from './deals.service.js';
import { parsePaginationQuery } from '../../utils/pagination.js';

const router = Router();

router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { stage, all, kanban } = req.query;
  const isAdmin = req.user.role === RoleNames.ADMIN;
  const userId = req.user.role === RoleNames.STAFF ? req.user.id : undefined;

  if (kanban === 'true') {
    const { page, limit } = parsePaginationQuery(req.query);
    const result = await getDealsKanbanStage({
      userId,
      stage,
      page,
      limit,
      afterId: req.query.afterId,
    });
    res.json({ success: true, data: result });
    return;
  }

  if (isAdmin && all === 'true') {
    const deals = stage ? await getDealsByStage(stage) : await getAllDeals();
    res.json({ success: true, data: deals });
    return;
  }

  const { page, limit } = parsePaginationQuery(req.query);
  const result = await getDealsPaginated({ userId, stage, page, limit });

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const deal = await getDealById(req.params.id);
  if (!deal) {
    return res.status(404).json({ success: false, message: 'Deal not found' });
  }

  if (req.user.role === RoleNames.STAFF) {
    const managerId = getDealManagerId(deal);
    if (managerId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }
  }

  res.json({ success: true, data: deal });
}));

router.post('/', authenticate, validate(createDealSchema), asyncHandler(async (req, res) => {
  const deal = await createDeal(req.body, { actorId: req.user.id });
  res.status(201).json({ success: true, data: deal });
}));


router.put('/:id', authenticate, validate(updateDealSchema), asyncHandler(async (req, res) => {
  if (req.user.role === RoleNames.STAFF) {
    const existing = await getDealById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }
    if (getDealManagerId(existing) !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }
  }

  const deal = await updateDeal(req.params.id, req.body, { actorId: req.user.id });




  if (!deal) {
    return res.status(404).json({ success: false, message: 'Deal not found' });
  }
  res.json({ success: true, data: deal });
}));

router.delete(
  '/:id',
  authenticate,
  authorize(RoleNames.ADMIN),
  asyncHandler(async (req, res) => {
    const deal = await deleteDeal(req.params.id);
    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }
    res.json({ success: true, data: deal });
  }),
);

export default router;
