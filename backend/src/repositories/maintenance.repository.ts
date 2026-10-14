import prismaClient from '../config/database.js';
import { Prisma } from '@prisma/client';
export class MaintenanceBlockRepository {
  async create(data: Prisma.MaintenanceBlockCreateInput) { return prismaClient.maintenanceBlock.create({ data }); }
  async findUnique(where: Prisma.MaintenanceBlockWhereUniqueInput) { return prismaClient.maintenanceBlock.findUnique({ where, include: { area: true, creator: { select: { id: true, fullName: true } } } }); }
  async findMany(where: Prisma.MaintenanceBlockWhereInput = {}, skip = 0, take = 20) { return prismaClient.maintenanceBlock.findMany({ where, skip, take, orderBy: { startsAt: 'desc' }, include: { area: true } }); }
  async count(where: Prisma.MaintenanceBlockWhereInput = {}) { return prismaClient.maintenanceBlock.count({ where }); }
  async delete(where: Prisma.MaintenanceBlockWhereUniqueInput) { return prismaClient.maintenanceBlock.delete({ where }); }
}
export const maintenanceBlockRepository = new MaintenanceBlockRepository();
