import prismaClient from '../config/database.js';
export class BookingCheckinRepository {
  async create(data: any) { return prismaClient.bookingCheckin.create({ data }); }
  async findByBooking(bookingId: string) { return prismaClient.bookingCheckin.findFirst({ where: { bookingId } }); }
  async countByBooking(bookingId: string) { return prismaClient.bookingCheckin.count({ where: { bookingId } }); }
}
export const bookingCheckinRepository = new BookingCheckinRepository();
