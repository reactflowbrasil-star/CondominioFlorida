import { Router } from 'express';
import { qrCodeController } from '../controllers/qr-code.controller.js';
const router = Router();
router.get('/scan/:token', qrCodeController.validateQrCode);
router.post('/scan/:token/checkin', qrCodeController.validateAndCheckin);
export default router;
