import prismaClient from '../config/database.js';
export class BookingQrCodeRepository {
  async create(data: any) { return prismaClient.bookingQrCode.create({ data }); }
  async findByToken(token: string) { return prismaClient.bookingQrCode.findUnique({ where: { token }, include: { booking: { include: { area: true, resident: { select: { id: true, fullName: true, role: true } } } } } }); }
  async findByBooking(bookingId: string) { return prismaClient.bookingQrCode.findFirst({ where: { bookingId } }); }
  async markAsUsed(id: string) { return prismaClient.bookingQrCode.update({ where: { id }, data: { usedAt: new Date() } }); }
}
export const bookingQrCodeRepository = new BookingQrCodeRepository();
