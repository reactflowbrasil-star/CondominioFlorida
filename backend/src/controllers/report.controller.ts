import { Request, Response, NextFunction } from 'express';
import { Prisma, BookingStatus } from '@prisma/client';
import { areaRepository } from '../repositories/area.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { bookingRepository } from '../repositories/booking.repository.js';
import prismaClient from '../config/database.js';
import { systemSettingsService } from '../services/system-settings.service.js';

export class ReportController {
  async getUsage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dateFrom = req.query.dateFrom as string; const dateTo = req.query.dateTo as string; const areaId = req.query.areaId as string;
      const where: Prisma.BookingWhereInput = { status: { in: ['APPROVED', 'COMPLETED'] } };
      if (dateFrom) where.startsAt = { gte: new Date(dateFrom + 'T00:00:00') };
      if (dateTo) { where.startsAt = where.startsAt || {}; (where.startsAt as any).lte = new Date(dateTo + 'T23:59:59.999'); }
      if (areaId) where.areaId = areaId;
      const bookings = await bookingRepository.findMany(where, 0, 1000);
      const totalBookings = bookings.length;
      const totalDuration = bookings.reduce((sum: number, b: any) => sum + (new Date(b.endsAt).getTime() - new Date(b.startsAt).getTime()) / (1000 * 60), 0);
      const residents = await userRepository.findMany({});
      const activeAreas = await areaRepository.count({ active: true });
      const byStatus = await prismaClient.booking.groupBy({ by: ['status'], where, _count: { _all: true } });
      const weeklyLimit = await systemSettingsService.getValue('weekly_reservation_limit', 2);
      res.status(200).json({
        summary: { totalBookings, totalDurationMinutes: Math.round(totalDuration), activeResidents: residents.length, activeAreas, weeklyLimit },
        byStatus: byStatus.map((s: any) => ({ status: s.status, count: s._count?._all || 0 })),
      });
    } catch (e: any) { next(e); }
  }

  async getBookingsReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dateFrom = req.query.dateFrom as string; const dateTo = req.query.dateTo as string; const areaId = req.query.areaId as string; const status = req.query.status as string;
      const where: Prisma.BookingWhereInput = {};
      if (dateFrom) where.startsAt = { gte: new Date(dateFrom + 'T00:00:00') };
      if (dateTo) { where.startsAt = where.startsAt || {}; (where.startsAt as any).lte = new Date(dateTo + 'T23:59:59.999'); }
      if (areaId) where.areaId = areaId;
      if (status) where.status = status as BookingStatus;
      const page = req.query.page ? parseInt(req.query.page as string) : 1; const limit = req.query.limit ? parseInt(req.query.limit as string) : 50; const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([bookingRepository.findMany(where, skip, limit), bookingRepository.count(where)]);
      res.status(200).json({ data, total, page, limit });
    } catch (e: any) { next(e); }
  }

  async exportCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dateFrom = req.query.dateFrom as string; const dateTo = req.query.dateTo as string; const areaId = req.query.areaId as string; const status = req.query.status as string;
      const where: Prisma.BookingWhereInput = {};
      if (dateFrom) where.startsAt = { gte: new Date(dateFrom + 'T00:00:00') };
      if (dateTo) { where.startsAt = where.startsAt || {}; (where.startsAt as any).lte = new Date(dateTo + 'T23:59:59.999'); }
      if (areaId) where.areaId = areaId;
      if (status) where.status = status as BookingStatus;
      const bookings = await bookingRepository.findMany(where, 0, 5000);
      const rows = ['ID,Resident,Area,Start,End,Guests,Status,CreatedAt', ...bookings.map((b: any) => [b.id, b.resident?.fullName || 'N/A', b.area?.name || 'N/A', new Date(b.startsAt).toISOString(), new Date(b.endsAt).toISOString(), b.guestCount, b.status, b.createdAt ? new Date(b.createdAt).toISOString() : ''].join(','))];
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=bookings-report.csv');
      res.status(200).send(rows.join('\n'));
    } catch (e: any) { next(e); }
  }
}
export const reportController = new ReportController();
