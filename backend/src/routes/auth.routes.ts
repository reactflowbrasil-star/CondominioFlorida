import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate, loadUser, requireRole } from '../middlewares/auth.middleware.js';
import { loginRateLimiter } from '../middlewares/rate-limit.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { loginSchema, refreshTokenSchema, firstAdminSchema, changePasswordSchema } from '../schemas/auth.schema.js';

const router = Router();
router.post('/login', loginRateLimiter, validateBody(loginSchema), authController.login);
router.post('/refresh', validateBody(refreshTokenSchema), authController.refreshToken);
router.post('/logout', validateBody(refreshTokenSchema), authController.logout);
router.post('/first-admin', validateBody(firstAdminSchema), authController.createFirstAdmin);
router.use(authenticate, loadUser);
router.get('/me', authController.getMe);
router.post('/change-password', validateBody(changePasswordSchema), authController.changePassword);
router.get('/settings', requireRole('ADMIN'), authController.getSettings);
router.post('/settings', requireRole('ADMIN'), authController.updateSettings);
export default router;
