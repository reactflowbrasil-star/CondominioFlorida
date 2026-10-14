import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import areaRoutes from './area.routes.js';
import bookingRoutes from './booking.routes.js';
import maintenanceRoutes from './maintenance.routes.js';
import reportRoutes from './report.routes.js';
import qrCodeRoutes from './qr-code.routes.js';

const router = Router();
router.use('/auth', authRoutes);
router.use('/residents', userRoutes);
router.use('/areas', areaRoutes);
router.use('/bookings', bookingRoutes);
router.use('/maintenance-blocks', maintenanceRoutes);
router.use('/reports', reportRoutes);
router.use('/qr-code', qrCodeRoutes);
export default router;
