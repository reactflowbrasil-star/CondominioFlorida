import prismaClient from '../config/database.js';
import { Prisma } from '@prisma/client';
export class UserRepository {
  async create(data: Prisma.UserCreateInput) { return prismaClient.user.create({ data }); }
  async findUnique(where: Prisma.UserWhereUniqueInput) { return prismaClient.user.findUnique({ where }); }
  async findMany(where: Prisma.UserWhereInput = {}) { return prismaClient.user.findMany({ where }); }
  async findWithFilters(params: { where: Prisma.UserWhereInput; skip: number; take: number }) {
    return prismaClient.user.findMany({ where: params.where, skip: params.skip, take: params.take, orderBy: { createdAt: 'desc' } });
  }
  async count(where: Prisma.UserWhereInput = {}) { return prismaClient.user.count({ where }); }
  async update(where: Prisma.UserWhereUniqueInput, data: Prisma.UserUpdateInput) { return prismaClient.user.update({ where, data }); }
  async delete(where: Prisma.UserWhereUniqueInput) { return prismaClient.user.delete({ where }); }
}
export const userRepository = new UserRepository();
