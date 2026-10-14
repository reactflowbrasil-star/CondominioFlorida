import { Router } from 'express';
import { areaController } from '../controllers/area.controller.js';
import { authenticate, loadUser, requireRole } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { areaSchema, updateAreaSchema, areaStatusSchema } from '../schemas/area.schema.js';

const router = Router();
router.use(authenticate, loadUser);
router.post('/', requireRole('ADMIN'), validateBody(areaSchema), areaController.create);
router.get('/', areaController.findAll);
router.get('/:id', areaController.findById);
router.get('/:id/availability', areaController.getAvailability);
router.patch('/:id', requireRole('ADMIN'), validateBody(updateAreaSchema), areaController.update);
router.patch('/:id/status', requireRole('ADMIN'), validateBody(areaStatusSchema), areaController.updateStatus);
router.delete('/:id', requireRole('ADMIN'), areaController.delete);
export default router;
