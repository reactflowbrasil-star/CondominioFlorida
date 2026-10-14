import { Request, Response, NextFunction } from 'express';
import { bookingService } from '../services/booking.service.js';
import { qrCodeService } from '../services/qr-code.service.js';
import { areaService } from '../services/area.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { AppError } from '../utils/error.js';

export class BookingController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> { try { const booking = await bookingService.createBooking(req.user!.id, req.body); res.status(201).json({ booking }); } catch (e: any) { next(e); } }
  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = { status: req.query.status as string, areaId: req.query.areaId as string, residentId: req.query.residentId as string, block: req.query.block as string, apartment: req.query.apartment as string, dateFrom: req.query.dateFrom as string, dateTo: req.query.dateTo as string, page: req.query.page ? parseInt(req.query.page as string) : 1, limit: req.query.limit ? parseInt(req.query.limit as string) : 20 };
      const result = await bookingService.getBookings(filters); res.status(200).json(result);
    } catch (e: any) { next(e); }
  }
  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> { try { const booking = await bookingService.getBookingById(req.params.id); res.status(200).json({ booking }); } catch (e: any) { next(e); } }
  async approve(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> { try { const booking = await bookingService.approveBooking(req.params.id, req.user!.id); res.status(200).json({ booking }); } catch (e: any) { next(e); } }
  async reject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> { try { const booking = await bookingService.rejectBooking(req.params.id, req.user!.id, req.body.reason); res.status(200).json({ booking }); } catch (e: any) { next(e); } }
  async cancel(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> { try { const booking = await bookingService.cancelBooking(req.params.id, req.user!.id, req.user!.role, req.body.reason); res.status(200).json({ booking }); } catch (e: any) { next(e); } }
  async getMyBookings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try { const result = await bookingService.getMyBookings(req.user!.id, req.query.status as string, req.query.page ? parseInt(req.query.page as string) : 1, req.query.limit ? parseInt(req.query.limit as string) : 20); res.status(200).json(result); } catch (e: any) { next(e); }
  }
  async getAvailability(req: Request, res: Response, next: NextFunction): Promise<void> { try { const date = req.query.date as string; if (!date) throw new AppError('Date parameter required', 400); const slots = await areaService.getAvailability(req.params.areaId, date); res.status(200).json({ availableSlots: slots }); } catch (e: any) { next(e); } }
  async getQrCode(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> { try { const qrCodeUrl = await qrCodeService.getMyQrCode(req.params.id, req.user!.id); res.status(200).json({ qrCodeUrl }); } catch (e: any) { next(e); } }
}
export const bookingController = new BookingController();
