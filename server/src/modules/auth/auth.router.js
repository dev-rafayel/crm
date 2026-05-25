import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authenticate, authorize } from './auth.middleware.js';
import {
  loginSchema,
  refreshSchema,
  logoutSchema,
  inviteSchema,
  registerByInviteSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.validator.js';
import * as authService from './auth.service.js';
import * as inviteService from './invite.service.js';
import * as passwordResetService from './password-reset.service.js';
import { AppError } from '../../utils/AppError.js';
import { RoleNames } from '../../constants.js';

const router = Router();

router.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
    try {
      const data = await authService.login(req.body.email, req.body.password);
      res.json({ success: true, data });
      if (!data) {
        throw new AppError('Failed to login');
      }
    } catch (error) {
      throw new AppError(error.message, error.statusCode, error.details);
    }
  }),
);

router.post('/refresh', validate(refreshSchema), asyncHandler(async (req, res) => {
    try {
      const data = await authService.refresh(req.body.refreshToken);
      res.json({ success: true, data });
    } catch (error) {
      throw new AppError(error.message, error.statusCode, error.details);
    }
  }),
);

router.post('/logout', validate(logoutSchema), asyncHandler(async (req, res) => {
    try {
      await authService.logout(req.body.refreshToken);
      res.json({ success: true, message: 'Logged out' });
    } catch (error) {
      throw new AppError(error.message, error.statusCode, error.details);
    }
  }),
);

router.get('/me', authenticate, asyncHandler(async (req, res) => {
    try {
      const user = await authService.getMe(req.user.id);
      res.json({ success: true, data: user });
    } catch (error) {
      throw new AppError(error.message, error.statusCode, error.details);
    }
  }),
);

router.get(
  '/invites',
  authenticate,
  authorize(RoleNames.ADMIN),
  asyncHandler(async (_req, res) => {
    const invites = await inviteService.listPendingInvites();
    res.json({ success: true, data: invites });
  }),
);

router.post(
  '/invite',
  authenticate,
  authorize(RoleNames.ADMIN),
  validate(inviteSchema),
  asyncHandler(async (req, res) => {
    const data = await inviteService.createInvite(req.body);
    res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      data,
    });
  }),
);

router.post(
  '/register-by-invite',
  validate(registerByInviteSchema),
  asyncHandler(async (req, res) => {
    const user = await inviteService.registerByInvite(req.body);
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: user,
    });
  }),
);

router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  asyncHandler(async (req, res) => {
    const data = await passwordResetService.requestPasswordResetCode(req.body.email);
    res.json({ success: true, message: data.message });
  }),
);

router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  asyncHandler(async (req, res) => {
    const data = await passwordResetService.resetPasswordWithCode(req.body);
    res.json({ success: true, message: data.message });
  }),
);

export default router;
