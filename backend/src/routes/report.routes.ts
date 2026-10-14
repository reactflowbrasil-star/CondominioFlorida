import { Router } from 'express';
import { reportController } from '../controllers/report.controller.js';
import { authenticate, loadUser, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(authenticate, loadUser);
router.get('/usage', requireRole('ADMIN'), reportController.getUsage);
router.get('/bookings', requireRole('ADMIN'), reportController.getBookingsReport);
router.get('/bookings/csv', requireRole('ADMIN'), reportController.exportCsv);
export default router;
