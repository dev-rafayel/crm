import { Router } from 'express';
import healthRouter from './modules/health/health.router.js';
import usersRouter from './modules/users/users.router.js';
import authRouter from './modules/auth/auth.router.js';
import clientsRouter from './modules/clients/clients.router.js';
import dealsRouter from './modules/deals/deals.router.js';
import dashboardRouter from './modules/dashboard/dashboard.router.js';
const router = Router();

router.use('/health', healthRouter);
router.use('/users', usersRouter);
router.use('/auth', authRouter);
router.use('/clients', clientsRouter);
router.use('/deals', dealsRouter);
router.use('/dashboard', dashboardRouter);

export default router;

