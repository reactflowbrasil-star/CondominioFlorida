import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate, loadUser, requireRole } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { createUserSchema, resetPasswordSchema, userStatusSchema, changePasswordSchema } from '../schemas/auth.schema.js';

const router = Router();
router.use(authenticate, loadUser);
router.post('/', requireRole('ADMIN'), validateBody(createUserSchema), userController.create);
router.get('/', userController.findAll);
router.get('/:id', userController.findById);
router.patch('/:id', userController.update);
router.patch('/:id/status', validateBody(userStatusSchema), userController.updateStatus);
router.patch('/:id/reset-password', requireRole('ADMIN'), validateBody(resetPasswordSchema), userController.resetPassword);
router.post('/profile/change-password', validateBody(changePasswordSchema), userController.changePassword);
router.delete('/:id', requireRole('ADMIN'), userController.delete);
export default router;
