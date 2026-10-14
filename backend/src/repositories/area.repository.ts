import prismaClient from '../config/database.js';
import { Prisma } from '@prisma/client';
export class AreaRepository {
  async create(data: Prisma.AreaCreateInput) { return prismaClient.area.create({ data }); }
  async findMany(where: Prisma.AreaWhereInput = {}, includeInactive = false) {
    const merged: Prisma.AreaWhereInput = { ...where };
    if (!includeInactive) merged.active = true;
    return prismaClient.area.findMany({ where: merged, orderBy: { name: 'asc' } });
  }
  async findUnique(where: Prisma.AreaWhereUniqueInput) { return prismaClient.area.findUnique({ where }); }
  async count(where: Prisma.AreaWhereInput = {}) { return prismaClient.area.count({ where }); }
  async update(where: Prisma.AreaWhereUniqueInput, data: Prisma.AreaUpdateInput) { return prismaClient.area.update({ where, data }); }
  async delete(where: Prisma.AreaWhereUniqueInput) { return prismaClient.area.delete({ where }); }
}
export const areaRepository = new AreaRepository();
