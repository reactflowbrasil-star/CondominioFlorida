import prismaClient from '../config/database.js';
export class AuditLogRepository {
  async create(data: any) { return prismaClient.auditLog.create({ data }); }
  async findMany(where: any = {}, skip = 0, take = 50) { return prismaClient.auditLog.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, fullName: true, role: true } } } }); }
}
export const auditLogRepository = new AuditLogRepository();
