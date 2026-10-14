import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller.js';
import { authenticate, loadUser, requireRole } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { createBookingSchema, rejectionSchema, cancellationSchema } from '../schemas/booking.schema.js';

const router = Router();
router.use(authenticate, loadUser);
router.post('/', validateBody(createBookingSchema), bookingController.create);
router.get('/my', bookingController.getMyBookings);
router.get('/:id', bookingController.findById);
router.get('/:id/qr-code', bookingController.getQrCode);
router.get('/area/:areaId/availability', bookingController.getAvailability);
router.patch('/:id/cancel', validateBody(cancellationSchema), bookingController.cancel);
router.get('/', requireRole('ADMIN'), bookingController.findAll);
router.patch('/:id/approve', requireRole('ADMIN'), bookingController.approve);
router.patch('/:id/reject', requireRole('ADMIN'), validateBody(rejectionSchema), bookingController.reject);
export default router;
