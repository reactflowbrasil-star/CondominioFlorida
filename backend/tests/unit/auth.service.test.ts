import { vi, describe, it, expect, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authService } from '../../src/services/auth.service.js';
import { AuthenticationError } from '../../src/utils/error.js';

vi.mock('../../src/config/database.js', () => ({
  default: { user: { findUnique: vi.fn(), update: vi.fn() }, loginAttempt: { create: vi.fn(), deleteMany: vi.fn(), count: vi.fn() }, refreshToken: { create: vi.fn() } },
}));
vi.mock('../../src/config/env.js', () => ({ env: { BCRYPT_ROUNDS: 12, JWT_ACCESS_TOKEN_SECRET: 'a'.repeat(32), JWT_ACCESS_TOKEN_EXPIRES_IN: '15m', JWT_REFRESH_TOKEN_SECRET: 'b'.repeat(32), JWT_REFRESH_TOKEN_EXPIRES_IN: '7d', JWT_ISSUER: 'condominio-florida', LOGIN_RATE_LIMIT_MAX: 5, LOGIN_RATE_LIMIT_WINDOW_MS: 900000 } }));
vi.mock('../../src/config/logger.js', () => ({ default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

describe('Auth Service', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('hashPassword', () => {
    it('should hash password with bcrypt', async () => {
      const hash = await authService.hashPassword('password123');
      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(10);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const hash = await bcrypt.hash('password123', 12);
      const result = await authService.comparePassword('password123', hash);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const hash = await bcrypt.hash('password123', 12);
      const result = await authService.comparePassword('wrongpassword', hash);
      expect(result).toBe(false);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid token', () => {
      const token = jwt.sign({ userId: 'user-123', role: 'ADMIN', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 900 }, 'a'.repeat(32), { issuer: 'condominio-florida' });
      const payload = authService.verifyAccessToken(token);
      expect(payload.userId).toBe('user-123');
      expect(payload.role).toBe('ADMIN');
    });

    it('should throw for invalid token', () => {
      expect(() => authService.verifyAccessToken('invalid-token')).toThrow(AuthenticationError);
    });
  });
});