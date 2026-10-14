import { Prisma, BookingStatus } from '@prisma/client';
import { bookingRepository } from '../repositories/booking.repository.js';
import { areaRepository } from '../repositories/area.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { systemSettingsService } from './system-settings.service.js';
import { auditLogRepository } from '../repositories/audit-log.repository.js';
import prismaClient from '../config/database.js';
import { NotFoundError, BusinessRuleError, AuthorizationError, ConflictError } from '../utils/error.js';
import logger from '../config/logger.js';
import { notificationService } from './notification.service.js';

export class BookingService {
  async createBooking(residentId: string, data: { areaId: string; date: string; startTime: string; endTime: string; guestCount: number }): Promise<any> {
    const area = await areaRepository.findUnique({ id: data.areaId });
    if (!area || !area.active) throw new NotFoundError('Area not found or inactive');

    const resident = await userRepository.findUnique({ id: residentId });
    if (!resident) throw new NotFoundError('Resident not found');
    if (resident.status !== 'ACTIVE') throw new BusinessRuleError('Resident account is inactive', 'RESIDENT_INACTIVE');

    const [startH, startM] = data.startTime.split(':').map(Number);
    const [endH, endM] = data.endTime.split(':').map(Number);
    const startsAt = new Date(data.date); startsAt.setHours(startH, startM, 0, 0);
    const endsAt = new Date(data.date); endsAt.setHours(endH, endM, 0, 0);
    if (endsAt <= startsAt) throw new BusinessRuleError('End time must be after start time', 'INVALID_TIME');

    const advanceDays = area.advanceBookingDays;
    const maxDate = new Date(); maxDate.setDate(maxDate.getDate() + advanceDays);
    const targetDate = new Date(data.date); targetDate.setHours(0, 0, 0, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (targetDate < today) throw new BusinessRuleError('Cannot book a date in the past', 'PAST_DATE');
    if (targetDate > maxDate) throw new BusinessRuleError(`Cannot book more than ${advanceDays} days in advance`, 'ADVANCE_LIMIT_EXCEEDED');

    const dayOfWeek = startsAt.getDay();
    if (!area.operatingDays.includes(dayOfWeek)) throw new BusinessRuleError('Area is not operating on this day', 'NOT_OPERATING_DAY');

    const openMinutes = this.toMinutes(area.openingTime);
    const closeMinutes = this.toMinutes(area.closingTime);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;
    if (startMin < openMinutes || endMin > closeMinutes) throw new BusinessRuleError(`Booking time must be within operating hours (${area.openingTime} - ${area.closingTime})`, 'OUTSIDE_OPERATING_HOURS');

    const actualDuration = endMin - startMin;
    if (area.reservationDurationMinutes > 0 && actualDuration !== area.reservationDurationMinutes) throw new BusinessRuleError(`Booking duration must be exactly ${area.reservationDurationMinutes} minutes`, 'INVALID_DURATION');

    if (data.guestCount > area.capacity) throw new BusinessRuleError(`Guest count exceeds capacity of ${area.capacity}`, 'CAPACITY_EXCEEDED');

    await this.checkWeeklyLimit(residentId, startsAt);

    const requiresApproval = area.requiresApproval;
    const result = await this.createBookingTransaction(residentId, data.areaId, startsAt, endsAt, data.guestCount, requiresApproval);

    await auditLogRepository.create({ userId: residentId, action: 'BOOKING_CREATED', entity: 'Booking', entityId: result.id, details: { areaId: data.areaId, startsAt, endsAt, guestCount: data.guestCount } });
    await notificationService.sendBookingNotification(residentId, 'BOOKING_CREATED', result.id);
    logger.info({ bookingId: result.id, residentId }, 'Booking created');
    return result;
  }

  private async createBookingTransaction(residentId: string, areaId: string, startsAt: Date, endsAt: Date, guestCount: number, requiresApproval: boolean): Promise<any> {
    const initialStatus = requiresApproval ? 'PENDING' : 'APPROVED';
    try {
      const result = await prismaClient.$transaction(async (tx) => {
        const overlap = await tx.$queryRaw<Array<{ id: string }>>`SELECT id FROM bookings WHERE area_id = ${areaId} AND status IN ('PENDING','APPROVED') AND tstzrange(starts_at, ends_at, '[)') && tstzrange(${startsAt}, ${endsAt}, '[)')`;
        if (overlap.length > 0) throw new ConflictError('Time slot is already reserved', 'BOOKING_CONFLICT');

        const maintenance = await tx.$queryRaw<Array<{ id: string }>>`SELECT id FROM maintenance_blocks WHERE area_id = ${areaId} AND tstzrange(starts_at, ends_at, '[)') && tstzrange(${startsAt}, ${endsAt}, '[)')`;
        if (maintenance.length > 0) throw new ConflictError('Area is under maintenance during this time', 'MAINTENANCE_BLOCK');

        return tx.booking.create({ data: { residentId, areaId, startsAt, endsAt, guestCount, status: initialStatus, ...(initialStatus === 'APPROVED' ? { approvedAt: new Date(), approvedBy: 'system' } : {}) } });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      return result;
    } catch (error) {
      if (error instanceof ConflictError) throw error;
      if (error instanceof BusinessRuleError) throw error;
      throw error;
    }
  }

  private async checkWeeklyLimit(residentId: string, startsAt: Date): Promise<void> {
    const limit = await systemSettingsService.getValue<number>('weekly_reservation_limit', 2);
    const dayOfWeek = startsAt.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : -(dayOfWeek - 1);
    const weekStart = new Date(startsAt); weekStart.setDate(startsAt.getDate() + mondayOffset); weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 7);

    const count = await bookingRepository.countByStatus(['PENDING', 'APPROVED'], residentId, weekStart, weekEnd);
    if (count >= limit) throw new BusinessRuleError(`Weekly reservation limit of ${limit} reached`, 'WEEKLY_LIMIT_EXCEEDED');
  }

  async getBookings(filters: any): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const page = filters.page || 1; const limit = filters.limit || 20; const skip = (page - 1) * limit;
    const where: Prisma.BookingWhereInput = {};
    if (filters.status) where.status = filters.status as BookingStatus;
    if (filters.areaId) where.areaId = filters.areaId;
    if (filters.residentId) where.residentId = filters.residentId;
    if (filters.dateFrom || filters.dateTo) { where.startsAt = {}; if (filters.dateFrom) (where.startsAt as any).gte = new Date(filters.dateFrom + 'T00:00:00'); if (filters.dateTo) (where.startsAt as any).lte = new Date(filters.dateTo + 'T23:59:59.999'); }
    if (filters.block || filters.apartment) {
      const rf: Prisma.UserWhereInput = { role: 'RESIDENT' };
      if (filters.block) rf.block = filters.block; if (filters.apartment) rf.apartment = filters.apartment;
      const residents = await userRepository.findMany(rf);
      where.residentId = { in: residents.map((r: any) => r.id) };
    }
    const [data, total] = await Promise.all([bookingRepository.findMany(where, skip, limit), bookingRepository.count(where)]);
    return { data, total, page, limit };
  }

  async getBookingById(id: string): Promise<any> { const b = await bookingRepository.findUnique({ id }); if (!b) throw new NotFoundError('Booking not found'); return b; }

  async getMyBookings(residentId: string, status?: string, page = 1, limit = 20): Promise<{ data: any[]; total: number }> {
    const skip = (page - 1) * limit;
    const where: Prisma.BookingWhereInput = { residentId };
    if (status) where.status = status as BookingStatus;
    const [data, total] = await Promise.all([bookingRepository.findMany(where, skip, limit), bookingRepository.count(where)]);
    return { data, total };
  }

  async approveBooking(bookingId: string, adminId: string): Promise<any> {
    const booking = await bookingRepository.findUnique({ id: bookingId });
    if (!booking) throw new NotFoundError('Booking not found');
    if (booking.status !== 'PENDING') throw new BusinessRuleError('Only pending bookings can be approved', 'INVALID_STATUS');

    const result = await prismaClient.$transaction(async (tx) => {
      const updated = await tx.booking.update({ where: { id: bookingId }, data: { status: 'APPROVED', approvedBy: adminId, approvedAt: new Date() } });
      await tx.auditLog.create({ data: { userId: adminId, action: 'BOOKING_APPROVED', entity: 'Booking', entityId: bookingId, details: { previousStatus: 'PENDING', newStatus: 'APPROVED' } } });
      return updated;
    });
    await notificationService.sendBookingNotification(booking.residentId, 'BOOKING_APPROVED', bookingId);
    logger.info({ bookingId, adminId }, 'Booking approved');
    return result;
  }

  async rejectBooking(bookingId: string, adminId: string, reason: string): Promise<any> {
    const booking = await bookingRepository.findUnique({ id: bookingId });
    if (!booking) throw new NotFoundError('Booking not found');
    if (booking.status !== 'PENDING') throw new BusinessRuleError('Only pending bookings can be rejected', 'INVALID_STATUS');

    const result = await prismaClient.$transaction(async (tx) => {
      const updated = await tx.booking.update({ where: { id: bookingId }, data: { status: 'REJECTED', rejectedBy: adminId, rejectedAt: new Date(), rejectionReason: reason } });
      await tx.auditLog.create({ data: { userId: adminId, action: 'BOOKING_REJECTED', entity: 'Booking', entityId: bookingId, details: { reason } } });
      return updated;
    });
    await notificationService.sendBookingNotification(booking.residentId, 'BOOKING_REJECTED', bookingId, reason);
    logger.info({ bookingId, adminId, reason }, 'Booking rejected');
    return result;
  }

  async cancelBooking(bookingId: string, userId: string, userRole: string, reason?: string): Promise<any> {
    const booking = await bookingRepository.findUnique({ id: bookingId });
    if (!booking) throw new NotFoundError('Booking not found');
    if (userRole === 'RESIDENT' && booking.residentId !== userId) throw new AuthorizationError('You can only cancel your own bookings');
    if (userRole === 'ADMIN' && !reason) throw new BusinessRuleError('Admin cancellation requires a reason', 'MISSING_REASON');
    if (userRole === 'RESIDENT') {
      const now = new Date();
      const advanceHours = await systemSettingsService.getValue<number>('cancellation_advance_hours', 12);
      const diffMs = booking.startsAt.getTime() - now.getTime();
      const diffMinutes = diffMs / (1000 * 60);
      if (diffMinutes < advanceHours * 60) throw new BusinessRuleError(`Must cancel at least ${advanceHours} hours before start time`, 'CANCELLATION_TOO_LATE');
      if (booking.status !== 'PENDING' && booking.status !== 'APPROVED') throw new BusinessRuleError('Booking cannot be cancelled in current status', 'INVALID_STATUS');
    }

    const result = await prismaClient.$transaction(async (tx) => {
      const updated = await tx.booking.update({ where: { id: bookingId }, data: { status: 'CANCELLED', cancelReason: reason || 'Cancelled by resident' } });
      await tx.auditLog.create({ data: { userId, action: 'BOOKING_CANCELLED', entity: 'Booking', entityId: bookingId, details: { reason, cancelledBy: userRole } } });
      return updated;
    });
    await notificationService.sendBookingNotification(booking.residentId, 'BOOKING_CANCELLED', bookingId);
    logger.info({ bookingId, userId, userRole, reason }, 'Booking cancelled');
    return result;
  }

  async completeBooking(bookingId: string): Promise<any> {
    const booking = await bookingRepository.findUnique({ id: bookingId });
    if (!booking) throw new NotFoundError('Booking not found');
    if (booking.status !== 'APPROVED') throw new BusinessRuleError('Only approved bookings can be completed', 'INVALID_STATUS');
    return bookingRepository.update({ id: bookingId }, { status: 'COMPLETED', completedAt: new Date() });
  }

  private toMinutes(t: string): number { const [h, m] = t.split(':').map(Number); return h * 60 + m; }
}
export const bookingService = new BookingService();
