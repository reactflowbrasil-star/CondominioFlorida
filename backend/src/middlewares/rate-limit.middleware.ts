import { RequestHandler } from 'express';
import { env } from '../config/env.js';
import { RateLimitError } from '../utils/error.js';

interface State { [key: string]: { count: number; resetTime: number }; }
const store: State = {};

export const loginRateLimiter: RequestHandler = (req, res, next) => {
  const identifier = req.body.cpf || req.ip || 'unknown';
  const now = Date.now();
  const stored = store[identifier];
  if (stored && stored.resetTime < now) delete store[identifier];
  if (stored && stored.count >= env.LOGIN_RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((stored.resetTime - now) / 1000);
    res.set('Retry-After', String(retryAfter));
    return next(new RateLimitError(`Too many login attempts. Try again in ${retryAfter} seconds.`));
  }
  next();
};
