import { Request, Response, NextFunction } from 'express';
import { qrCodeService } from '../services/qr-code.service.js';
import QRCode from 'qrcode';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class QrCodeController {
  async getQrImage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try { const qrCodeUrl = await qrCodeService.getMyQrCode(req.params.id, req.user!.id); const qrCodeImage = await QRCode.toDataURL(qrCodeUrl, { errorCorrectionLevel: 'M', width: 512, margin: 2 }); res.status(200).json({ qrCodeImage, qrCodeUrl }); } catch (e: any) { next(e); }
  }
  async validateAndCheckin(req: Request, res: Response, next: NextFunction): Promise<void> { try { const { token } = req.params; const checkin = await qrCodeService.performCheckin(token, 'system', req.ip); res.status(200).json(checkin); } catch (e: any) { next(e); } }
  async getMyQrCode(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> { try { const qrCodeUrl = await qrCodeService.getMyQrCode(req.params.id, req.user!.id); res.status(200).json({ qrCodeUrl }); } catch (e: any) { next(e); } }
  async validateQrCode(req: Request, res: Response, next: NextFunction): Promise<void> { try { const { token } = req.params; const result = await qrCodeService.validateQrCode(token); res.status(200).json(result); } catch (e: any) { next(e); } }
}
export const qrCodeController = new QrCodeController();
