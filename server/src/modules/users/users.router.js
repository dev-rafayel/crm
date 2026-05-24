import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authenticate, authorize } from '../auth/auth.middleware.js';
import { createUserSchema, updateUserStatusSchema } from './users.validator.js';
import {
  createUser,
  listUsers,
  deleteUser,
  getUserByIdForViewer,
  updateUserStatus,
} from './users.service.js';
import { RoleNames } from '../../constants.js';
import { AppError } from '../../utils/AppError.js';

const router = Router();

router.get(
  '/',
  authenticate,
  asyncHandler(async (_req, res) => {
    const users = await listUsers();
    res.json({ success: true, data: users });
  }),
);

router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const data = await getUserByIdForViewer(req.params.id, {
      viewerRole: req.user.role,
    });
    res.json({ success: true, data });
  }),
);

router.patch(
  '/:id',
  authenticate,
  authorize(RoleNames.ADMIN),
  validate(updateUserStatusSchema),
  asyncHandler(async (req, res) => {
    const data = await updateUserStatus(req.params.id, req.body.status);
    res.json({ success: true, data });
  }),
);

router.post('/', validate(createUserSchema), asyncHandler(async (req, res) => {
  const user = await createUser(req.body);
  if (!user) {
    throw new AppError('Failed to create user', 500);
  }
  res.status(201).json({ success: true, data: user });
}));

router.delete(
  '/:id',
  authenticate,
  authorize(RoleNames.ADMIN),
  asyncHandler(async (req, res) => {
    const user = await deleteUser(req.params.id);
    res.json({ success: true, data: user });
  }),
);

export default router;
