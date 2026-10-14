import { Request, Response, NextFunction } from 'express';
import { JwtPayload, authService } from '../services/auth.service.js';
import prismaClient from '../config/database.js';
import { AuthorizationError, AuthenticationError } from '../utils/error.js';
import logger from '../config/logger.js';

export interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string; fullName: string };
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return next(new AuthenticationError('No token provided'));
  const token = authHeader.substring(7);
  try {
    const payload: JwtPayload = authService.verifyAccessToken(token);
    req.user = { id: payload.userId, role: payload.role, fullName: '' };
    next();
  } catch { next(new AuthenticationError('Invalid or expired token')); }
}

export async function loadUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  if (!req.user?.id) return next(new AuthenticationError('No user context'));
  const user = await prismaClient.user.findUnique({ where: { id: req.user.id }, select: { id: true, fullName: true, role: true, status: true, email: true } });
  if (!user) return next(new AuthenticationError('User not found'));
  if (user.status !== 'ACTIVE') return next(new AuthenticationError('Account is inactive'));
  req.user.fullName = user.fullName;
  req.user.role = user.role;
  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) return next(new AuthenticationError('Authentication required'));
    if (!roles.includes(req.user.role)) {
      logger.warn({ userId: req.user.id, action: 'UNAUTHORIZED_ACCESS' }, 'Unauthorized role access');
      return next(new AuthorizationError('Insufficient permissions'));
    }
    next();
  };
}
