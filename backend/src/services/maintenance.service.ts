import { Prisma } from '@prisma/client';
import { maintenanceBlockRepository } from '../repositories/maintenance.repository.js';
import { areaRepository } from '../repositories/area.repository.js';
import prismaClient from '../config/database.js';
import { NotFoundError, BusinessRuleError, ConflictError } from '../utils/error.js';

export class MaintenanceService {
  async createBlock(data: { areaId: string; date: string; startTime: string; endTime: string; reason: string; createdBy: string }): Promise<any> {
    const area = await areaRepository.findUnique({ id: data.areaId });
    if (!area) throw new NotFoundError('Area not found');
    const [sh, sm] = data.startTime.split(':').map(Number);
    const [eh, em] = data.endTime.split(':').map(Number);
    const startsAt = new Date(data.date); startsAt.setHours(sh, sm, 0, 0);
    const endsAt = new Date(data.date); endsAt.setHours(eh, em, 0, 0);
    if (endsAt <= startsAt) throw new BusinessRuleError('End time must be after start time', 'INVALID_TIME');

    const result = await prismaClient.$transaction(async (tx) => {
      const overlap = await tx.$queryRaw<Array<{ id: string }>>`SELECT id FROM maintenance_blocks WHERE area_id = ${data.areaId} AND tstzrange(starts_at, ends_at, '[)') && tstzrange(${startsAt}, ${endsAt}, '[)')`;
      if (overlap.length > 0) throw new ConflictError('Maintenance block overlaps with existing maintenance', 'MAINTENANCE_CONFLICT');

      const conflictingBookings = await tx.$queryRaw<Array<{ id: string; residentId: string }>>`SELECT id, resident_id FROM bookings WHERE area_id = ${data.areaId} AND status IN ('PENDING','APPROVED') AND tstzrange(starts_at, ends_at, '[)') && tstzrange(${startsAt}, ${endsAt}, '[)')`;

      const block = await tx.maintenanceBlock.create({ data: { areaId: data.areaId, startsAt, endsAt, reason: data.reason, createdBy: data.createdBy } });

      const bookingIds: string[] = conflictingBookings.map(b => b.id);
      await tx.maintenanceBlock.update({ where: { id: block.id }, data: { conflictingBookings: bookingIds } });

      for (const booking of conflictingBookings) {
        await tx.notification.create({ data: { recipientId: booking.residentId, eventType: 'MAINTENANCE_BLOCK_CREATED', title: 'Maintenance Scheduled', message: `Maintenance block overlaps with your booking on ${area.name}.`, metadata: { bookingId: booking.id, maintenanceId: block.id, areaName: area.name } } });
      }

      return { block, conflictingBookings };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return result;
  }

  async findAll(filters: any): Promise<{ data: any[]; total: number }> {
    const page = filters.page || 1; const limit = filters.limit || 20; const skip = (page - 1) * limit;
    const where: Prisma.MaintenanceBlockWhereInput = {};
    if (filters.areaId) where.areaId = filters.areaId;
    if (filters.dateFrom || filters.dateTo) { where.startsAt = {}; if (filters.dateFrom) where.startsAt.gte = new Date(filters.dateFrom + 'T00:00:00'); if (filters.dateTo) where.startsAt.lte = new Date(filters.dateTo + 'T23:59:59.999'); }
    const [data, total] = await Promise.all([maintenanceBlockRepository.findMany(where, skip, limit), maintenanceBlockRepository.count(where)]);
    return { data, total };
  }

  async getById(id: string): Promise<any> { const b = await maintenanceBlockRepository.findUnique({ id }); if (!b) throw new NotFoundError('Maintenance block not found'); return b; }

  async delete(id: string, userId: string): Promise<void> {
    const block = await maintenanceBlockRepository.findUnique({ id });
    if (!block) throw new NotFoundError('Maintenance block not found');
    await prismaClient.$transaction(async (tx) => {
      await tx.maintenanceBlock.delete({ where: { id } });
      await tx.auditLog.create({ data: { userId, action: 'MAINTENANCE_BLOCK_DELETED', entity: 'MaintenanceBlock', entityId: id, details: { areaId: block.areaId } } });
    });
  }
}
export const maintenanceService = new MaintenanceService();
