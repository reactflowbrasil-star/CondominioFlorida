import { z } from 'zod';
import { normalizeCpf, isValidCpfFormat } from '../utils/cpf.js';

export const loginSchema = z.object({
  cpf: z.string().refine(v => isValidCpfFormat(normalizeCpf(v)), { message: 'Invalid CPF' }),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
export const refreshTokenSchema = z.object({ refreshToken: z.string().min(1) });
export const changePasswordSchema = z.object({ currentPassword: z.string().min(8), newPassword: z.string().min(8, 'Password must be at least 8 characters') });
export const firstAdminSchema = z.object({
  fullName: z.string().min(2), cpf: z.string().refine(v => isValidCpfFormat(normalizeCpf(v)), { message: 'Invalid CPF' }),
  email: z.string().email(), password: z.string().min(8, 'Password must be at least 8 characters'), setupKey: z.string().min(1),
});
export const createUserSchema = z.object({
  fullName: z.string().min(2), cpf: z.string().refine(v => isValidCpfFormat(normalizeCpf(v)), { message: 'Invalid CPF' }),
  email: z.string().email(), password: z.string().min(8), block: z.string().optional(), apartment: z.string().optional(),
  role: z.enum(['ADMIN', 'RESIDENT']).default('RESIDENT'),
});
export const updateUserSchema = z.object({ fullName: z.string().min(2).optional(), email: z.string().email().optional(), block: z.string().optional(), apartment: z.string().optional(), role: z.enum(['ADMIN', 'RESIDENT']).optional(), status: z.enum(['ACTIVE', 'INACTIVE']).optional() });
export const userStatusSchema = z.object({ status: z.enum(['ACTIVE', 'INACTIVE']) });
export const resetPasswordSchema = z.object({ newPassword: z.string().min(8, 'Password must be at least 8 characters') });
