import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import logger from '../config/logger.js';
import prismaClient from '../config/database.js';
import { AuthenticationError } from '../utils/error.js';
import { normalizeCpf, isValidCpfFormat } from '../utils/cpf.js';

export interface JwtPayload { userId: string; role: string; iat: number; exp: number; }
export interface RefreshTokenPayload { userId: string; role: string; tokenId: string; iat: number; exp: number; }

export class AuthService {
  async hashPassword(password: string): Promise<string> { return bcrypt.hash(password, env.BCRYPT_ROUNDS); }
  async comparePassword(password: string, hash: string): Promise<boolean> { return bcrypt.compare(password, hash); }

  async login(cpf: string, password: string, ipAddress?: string): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    const normalizedCpf = normalizeCpf(cpf);
    if (!isValidCpfFormat(normalizedCpf)) throw new AuthenticationError('Invalid credentials');

    const failedCount = await this.getFailedLoginCount(normalizedCpf, env.LOGIN_RATE_LIMIT_WINDOW_MS);
    if (failedCount >= env.LOGIN_RATE_LIMIT_MAX) throw new AuthenticationError('Too many failed attempts. Try again later.');

    const user = await prismaClient.user.findUnique({ where: { cpf: normalizedCpf } });
    if (!user) throw new AuthenticationError('Invalid credentials');
    if (user.status !== 'ACTIVE') throw new AuthenticationError('Account is inactive');

    const passwordValid = await this.comparePassword(password, user.passwordHash);
    if (!passwordValid) {
      await this.recordLoginAttempt(normalizedCpf, ipAddress, false);
      throw new AuthenticationError('Invalid credentials');
    }

    await this.clearLoginAttempts(normalizedCpf);
    await prismaClient.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const tokens = await this.generateTokens(user.id, user.role);
    logger.info({ userId: user.id, action: 'LOGIN' }, 'User logged in');
    return { ...tokens, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } };
  }

  async generateTokens(userId: string, role: string): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = jwt.sign({ userId, role }, env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: env.JWT_ACCESS_TOKEN_EXPIRES_IN, issuer: env.JWT_ISSUER } as SignOptions);
    const tokenId = crypto.randomUUID();
    const refreshToken = jwt.sign({ userId, role, tokenId }, env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: env.JWT_REFRESH_TOKEN_EXPIRES_IN, issuer: env.JWT_ISSUER } as SignOptions);
    await prismaClient.refreshToken.create({ data: { token: refreshToken, userId, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const payload = jwt.verify(refreshToken, env.JWT_REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
      const storedToken = await prismaClient.refreshToken.findUnique({ where: { token: refreshToken }, include: { user: true } });
      if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) throw new AuthenticationError('Invalid refresh token');
      if (storedToken.user.status !== 'ACTIVE') throw new AuthenticationError('Account is inactive');
      const { accessToken } = await this.generateTokens(payload.userId, payload.role);
      return accessToken;
    } catch { throw new AuthenticationError('Invalid refresh token'); }
  }

  verifyAccessToken(token: string): JwtPayload {
    try { return jwt.verify(token, env.JWT_ACCESS_TOKEN_SECRET) as JwtPayload; }
    catch { throw new AuthenticationError('Invalid or expired token'); }
  }

  async logout(refreshToken: string): Promise<void> {
    await prismaClient.refreshToken.updateMany({ where: { token: refreshToken }, data: { revoked: true } });
    logger.info({ action: 'LOGOUT' }, 'User logged out');
  }

  private async recordLoginAttempt(identifier: string, ipAddress: string | undefined, success: boolean): Promise<void> {
    await prismaClient.loginAttempt.create({ data: { identifier, ipAddress, success } });
  }
  private async clearLoginAttempts(identifier: string): Promise<void> {
    await prismaClient.loginAttempt.deleteMany({ where: { identifier } });
  }
  async getFailedLoginCount(identifier: string, windowMs: number): Promise<number> {
    const since = new Date(Date.now() - windowMs);
    return prismaClient.loginAttempt.count({ where: { identifier, success: false, attemptedAt: { gte: since } } });
  }
}
export const authService = new AuthService();
