import prismaClient from '../config/database.js';
import { Prisma, BookingStatus } from '@prisma/client';
export class BookingRepository {
  async create(data: any) { return prismaClient.booking.create({ data }); }
  async findUnique(where: Prisma.BookingWhereUniqueInput) {
    return prismaClient.booking.findUnique({ where, include: { resident: { select: { id: true, fullName: true, block: true, apartment: true, role: true } }, area: true } });
  }
  async findMany(where: Prisma.BookingWhereInput = {}, skip = 0, take = 20) {
    return prismaClient.booking.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { resident: { select: { id: true, fullName: true, block: true, apartment: true } }, area: true } });
  }
  async count(where: Prisma.BookingWhereInput = {}) { return prismaClient.booking.count({ where }); }
  async countByStatus(statuses: BookingStatus[], residentId: string, weekStart: Date, weekEnd: Date) {
    return prismaClient.booking.count({ where: { residentId, startsAt: { gte: weekStart, lt: weekEnd }, status: { in: statuses } } });
  }
  async update(where: Prisma.BookingWhereUniqueInput, data: Prisma.BookingUpdateInput) { return prismaClient.booking.update({ where, data }); }
  async findOverlappingBookings(areaId: string, startsAt: Date, endsAt: Date) {
    return prismaClient.$queryRaw<Array<{ id: string }>>`SELECT id FROM bookings WHERE area_id = ${areaId} AND status IN ('PENDING','APPROVED') AND tstzrange(starts_at, ends_at, '[)') && tstzrange(${startsAt}, ${endsAt}, '[)')`;
  }
  async findOverlappingMaintenance(areaId: string, startsAt: Date, endsAt: Date) {
    return prismaClient.$queryRaw<Array<{ id: string }>>`SELECT id FROM maintenance_blocks WHERE area_id = ${areaId} AND tstzrange(starts_at, ends_at, '[)') && tstzrange(${startsAt}, ${endsAt}, '[)')`;
  }
}
export const bookingRepository = new BookingRepository();
