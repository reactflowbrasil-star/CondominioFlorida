import { vi, describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';

vi.mock('../../src/config/database.js', () => ({ default: {}, prismaClient: {} }));
vi.mock('../../src/config/env.js', () => ({ env: { PORT: 4000, NODE_ENV: 'test', DATABASE_URL: 'postgresql://x', JWT_ACCESS_TOKEN_SECRET: 'a'.repeat(32), JWT_ACCESS_TOKEN_EXPIRES_IN: '15m', JWT_REFRESH_TOKEN_SECRET: 'b'.repeat(32), JWT_REFRESH_TOKEN_EXPIRES_IN: '7d', JWT_ISSUER: 'test', BCRYPT_ROUNDS: 12, LOGIN_RATE_LIMIT_MAX: 5, LOGIN_RATE_LIMIT_WINDOW_MS: 900000, COOKIE_SECURE: 'false', COOKIE_SAME_SITE: 'lax', FRONTEND_URL: 'http://localhost:5173', ADMIN_SETUP_KEY: undefined } }));
vi.mock('../../src/config/logger.js', () => ({ default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock('../../src/middlewares/rate-limit.middleware.js', () => ({ loginRateLimiter: (req: any, res: any, next: any) => next() }));

const app = createApp();

describe('Auth API', () => {
  it('should return 401 for unauthenticated me endpoint', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('Area API', () => {
  it('should return 401 for unauthenticated user', async () => {
    const res = await request(app).get('/api/v1/areas');
    expect(res.status).toBe(401);
  });
});

describe('User API', () => {
  it('should return 401 for unauthenticated user', async () => {
    const res = await request(app).get('/api/v1/residents');
    expect(res.status).toBe(401);
  });
});