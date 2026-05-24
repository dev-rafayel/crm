import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getHealthStatus } from './health.service.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const health = getHealthStatus();
    res.json({ success: true, data: health });
  }),
);

export default router;
