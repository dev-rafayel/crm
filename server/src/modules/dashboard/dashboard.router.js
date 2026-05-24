import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../auth/auth.middleware.js';
import { getDashboardData } from './dashboard.service.js';

const router = Router();

router.get('/', authenticate, asyncHandler(async (req, res) => {
  const data = await getDashboardData();
  res.json({ success: true, data });
}));


export default router;

