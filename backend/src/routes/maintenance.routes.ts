import { Router } from 'express';
import { maintenanceController } from '../controllers/maintenance.controller.js';
import { authenticate, loadUser, requireRole } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { createMaintenanceBlockSchema } from '../schemas/maintenance.schema.js';

const router = Router();
router.use(authenticate, loadUser);
router.post('/', requireRole('ADMIN'), validateBody(createMaintenanceBlockSchema), maintenanceController.create);
router.get('/', maintenanceController.findAll);
router.get('/:id', maintenanceController.getById);
router.delete('/:id', requireRole('ADMIN'), maintenanceController.delete);
export default router;
