import prismaClient from '../config/database.js';
import { normalizeCpf, isValidCpfFormat } from '../utils/cpf.js';
import { Prisma } from '@prisma/client';
import { NotFoundError, BusinessRuleError, ConflictError } from '../utils/error.js';
import { auditLogRepository } from '../repositories/audit-log.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import logger from '../config/logger.js';
import { authService } from './auth.service.js';

export class UserService {
  private sanitize(user: any): any { const { passwordHash, ...s } = user; return s; }

  async createResident(data: { fullName: string; cpf: string; email: string; password: string; block?: string; apartment?: string }): Promise<any> {
    const normalizedCpf = normalizeCpf(data.cpf);
    if (!isValidCpfFormat(normalizedCpf)) throw new BusinessRuleError('Invalid CPF', 'INVALID_CPF');
    const existing = await prismaClient.user.findUnique({ where: { cpf: normalizedCpf } });
    if (existing) throw new ConflictError('A user with this CPF already exists', 'CPF_DUPLICATE');
    const existingEmail = await prismaClient.user.findUnique({ where: { email: data.email } });
    if (existingEmail) throw new ConflictError('A user with this email already exists', 'EMAIL_DUPLICATE');
    const passwordHash = await authService.hashPassword(data.password);
    const user = await prismaClient.user.create({ data: { fullName: data.fullName, cpf: normalizedCpf, email: data.email, passwordHash, block: data.block, apartment: data.apartment, role: 'RESIDENT', status: 'ACTIVE' } });
    logger.info({ userId: user.id }, 'Resident created');
    return this.sanitize(user);
  }

  async createAdmin(data: { fullName: string; cpf: string; email: string; password: string; block?: string; apartment?: string; setupKey: string }): Promise<any> {
    if (process.env.ADMIN_SETUP_KEY && data.setupKey !== process.env.ADMIN_SETUP_KEY) throw new BusinessRuleError('Invalid setup key', 'INVALID_SETUP_KEY');
    const normalizedCpf = normalizeCpf(data.cpf);
    if (!isValidCpfFormat(normalizedCpf)) throw new BusinessRuleError('Invalid CPF', 'INVALID_CPF');
    const existing = await prismaClient.user.findUnique({ where: { cpf: normalizedCpf } });
    if (existing) throw new ConflictError('A user with this CPF already exists', 'CPF_DUPLICATE');
    const passwordHash = await authService.hashPassword(data.password);
    const user = await prismaClient.user.create({ data: { fullName: data.fullName, cpf: normalizedCpf, email: data.email, passwordHash, block: data.block, apartment: data.apartment, role: 'ADMIN', status: 'ACTIVE' } });
    logger.info({ userId: user.id }, 'Admin created via setup');
    return this.sanitize(user);
  }

  async getUserById(id: string): Promise<any> { const u = await prismaClient.user.findUnique({ where: { id } }); if (!u) throw new NotFoundError('User not found'); return this.sanitize(u); }
  async getByCpf(cpf: string): Promise<any> { const u = await prismaClient.user.findUnique({ where: { cpf: normalizeCpf(cpf) } }); if (!u) throw new NotFoundError('User not found'); return this.sanitize(u); }

  async updateResident(userId: string, data: { fullName?: string; email?: string; block?: string; apartment?: string }): Promise<any> {
    const u = await prismaClient.user.findUnique({ where: { id: userId } });
    if (!u) throw new NotFoundError('User not found');
    if (u.role !== 'RESIDENT') throw new BusinessRuleError('Can only update resident accounts', 'INVALID_ROLE');
    if (data.email) { const existing = await prismaClient.user.findUnique({ where: { email: data.email } }); if (existing && existing.id !== userId) throw new ConflictError('Email already in use', 'EMAIL_DUPLICATE'); }
    const updated = await prismaClient.user.update({ where: { id: userId }, data: { fullName: data.fullName, email: data.email, block: data.block, apartment: data.apartment } });
    logger.info({ userId }, 'Resident updated');
    return this.sanitize(updated);
  }

  async updateUserRoleAndStatus(id: string, data: { role?: 'ADMIN' | 'RESIDENT'; status?: 'ACTIVE' | 'INACTIVE' }): Promise<any> {
    const u = await prismaClient.user.findUnique({ where: { id } });
    if (!u) throw new NotFoundError('User not found');
    const updated = await prismaClient.user.update({ where: { id }, data });
    return this.sanitize(updated);
  }

  async resetPassword(id: string, newPassword: string): Promise<void> {
    const u = await prismaClient.user.findUnique({ where: { id } });
    if (!u) throw new NotFoundError('User not found');
    const passwordHash = await authService.hashPassword(newPassword);
    await prismaClient.user.update({ where: { id }, data: { passwordHash } });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const u = await prismaClient.user.findUnique({ where: { id: userId } });
    if (!u) throw new NotFoundError('User not found');
    const valid = await authService.comparePassword(currentPassword, u.passwordHash);
    if (!valid) throw new BusinessRuleError('Current password is incorrect', 'INVALID_PASSWORD');
    const passwordHash = await authService.hashPassword(newPassword);
    await prismaClient.user.update({ where: { id: userId }, data: { passwordHash } });
  }

  async findAll(filters: { name?: string; block?: string; apartment?: string; role?: string; status?: string; page?: number; limit?: number }): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const page = filters.page || 1; const limit = filters.limit || 20; const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {};
    if (filters.role) where.role = filters.role as any;
    if (filters.status) where.status = filters.status as any;
    if (filters.name) where.fullName = { contains: filters.name, mode: 'insensitive' };
    if (filters.block) where.block = filters.block;
    if (filters.apartment) where.apartment = filters.apartment;
    const [data, total] = await Promise.all([userRepository.findWithFilters({ where, skip, take: limit }), userRepository.count(where)]);
    return { data: data.map((u: any) => this.sanitize(u)), total, page, limit };
  }

  async countActiveResidents(): Promise<number> { return prismaClient.user.count({ where: { status: 'ACTIVE', role: 'RESIDENT' } }); }
}
export const userService = new UserService();
