import { bookingRepository } from '../repositories/booking.repository.js';
import { bookingQrCodeRepository } from '../repositories/booking-qr-code.repository.js';
import { bookingCheckinRepository } from '../repositories/booking-checkin.repository.js';
import { NotFoundError, BusinessRuleError, AuthenticationError } from '../utils/error.js';

export class QrCodeService {
  async generateQrCode(bookingId: string): Promise<string> {
    const booking = await bookingRepository.findUnique({ id: bookingId });
    if (!booking) throw new NotFoundError('Booking not found');
    if (booking.status !== 'APPROVED') throw new BusinessRuleError('QR Code only for approved bookings', 'INVALID_STATUS');
    const existing = await bookingQrCodeRepository.findByBooking(bookingId);
    if (existing && existing.token) return `/api/v1/qr-code/scan/${existing.token}`;
    const token = crypto.randomUUID();
    await bookingQrCodeRepository.create({ bookingId, token, expiresAt: booking.endsAt });
    return `/api/v1/qr-code/scan/${token}`;
  }

  async validateQrCode(token: string): Promise<any> {
    const qrCode = await bookingQrCodeRepository.findByToken(token);
    if (!qrCode) throw new NotFoundError('Invalid QR Code');
    const { booking } = qrCode;
    if (!booking) throw new NotFoundError('Booking not found');
    if (qrCode.usedAt) throw new BusinessRuleError('QR Code already used', 'QR_ALREADY_USED');
    if (qrCode.expiresAt && new Date(qrCode.expiresAt) < new Date()) throw new BusinessRuleError('QR Code expired', 'QR_EXPIRED');
    if (booking.status !== 'APPROVED') throw new BusinessRuleError(`Booking is ${booking.status.toLowerCase()}`, 'BOOKING_NOT_APPROVED');
    const now = new Date();
    if (now < booking.startsAt) throw new BusinessRuleError('Booking has not started yet', 'TOO_EARLY');
    if (now >= booking.endsAt) throw new BusinessRuleError('Booking time has passed', 'TOO_LATE');
    return { valid: true, bookingId: booking.id, area: booking.area, startsAt: booking.startsAt, endsAt: booking.endsAt, residentName: booking.resident?.fullName };
  }

  async performCheckin(token: string, validatorId: string, ipAddress?: string): Promise<any> {
    const validation = await this.validateQrCode(token);
    const qrCode = await bookingQrCodeRepository.findByToken(token);
    if (!qrCode || qrCode.usedAt) throw new BusinessRuleError('QR Code no longer valid', 'QR_ALREADY_USED');
    await bookingQrCodeRepository.markAsUsed(qrCode.id);
    const checkin = await bookingCheckinRepository.create({ bookingId: qrCode.bookingId, validatedBy: validatorId, ipAddress });
    return { valid: true, checkinAt: checkin.checkinAt, booking: validation.bookingId, area: validation.area };
  }

  async getMyQrCode(bookingId: string, residentId: string): Promise<string> {
    const booking = await bookingRepository.findUnique({ id: bookingId });
    if (!booking) throw new NotFoundError('Booking not found');
    if (booking.residentId !== residentId && booking.resident?.role !== 'ADMIN') throw new AuthenticationError('Not authorized to view this QR Code');
    if (booking.status !== 'APPROVED') throw new BusinessRuleError('QR Code only for approved bookings', 'INVALID_STATUS');
    return await this.generateQrCode(bookingId);
  }
}
export const qrCodeService = new QrCodeService();
