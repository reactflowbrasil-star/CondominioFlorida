import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { userService } from '../services/user.service.js';
import { systemSettingsService } from '../services/system-settings.service.js';
import { AuthenticationError } from '../utils/error.js';
import { normalizeCpf } from '../utils/cpf.js';
import { env } from '../config/env.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cpf, password } = req.body;
      const normalizedCpf = normalizeCpf(cpf);
      const { accessToken, refreshToken, user } = await authService.login(cpf, password, req.ip);
      res.status(200)
        .cookie('refreshToken', refreshToken, { httpOnly: true, secure: env.COOKIE_SECURE === 'true', sameSite: env.COOKIE_SAME_SITE as any, maxAge: 7 * 24 * 60 * 60 * 1000 })
        .cookie('accessToken', accessToken, { httpOnly: true, secure: env.COOKIE_SECURE === 'true', sameSite: env.COOKIE_SAME_SITE as any, maxAge: 15 * 60 * 1000 })
        .json({ accessToken, refreshToken, user });
    } catch (error: any) { next(error); }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const { refreshToken } = req.body; if (!refreshToken) throw new AuthenticationError('Refresh token required'); const accessToken = await authService.refreshAccessToken(refreshToken); res.status(200).json({ accessToken }); } catch (e: any) { next(e); }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) await authService.logout(refreshToken);
      res.status(200).clearCookie('refreshToken', { httpOnly: true, secure: env.COOKIE_SECURE === 'true', sameSite: env.COOKIE_SAME_SITE as any }).clearCookie('accessToken', { httpOnly: true, secure: env.COOKIE_SECURE === 'true', sameSite: env.COOKIE_SAME_SITE as any }).json({ message: 'Logged out successfully' });
    } catch (e: any) { next(e); }
  }

  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) throw new AuthenticationError('Not authenticated');
      const user = await userService.getUserById(req.user.id);
      res.status(200).json({ user });
    } catch (e: any) { next(e); }
  }

  async createFirstAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fullName, cpf, email, password, setupKey } = req.body;
      const user = await userService.createAdmin({ fullName, cpf, email, password, setupKey });
      res.status(201).json({ message: 'First admin created successfully', user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } });
    } catch (e: any) { next(e); }
  }

  async getSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try { const settings = await systemSettingsService.getAll(); res.status(200).json({ settings }); } catch (e: any) { next(e); }
  }

  async updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try { const { key, value } = req.body; await systemSettingsService.setValue(key, value); await systemSettingsService.resetCache(); res.status(200).json({ message: 'Setting updated' }); } catch (e: any) { next(e); }
  }

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try { await userService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword); res.status(200).json({ message: 'Password changed successfully' }); } catch (e: any) { next(e); }
  }
}
export const authController = new AuthController();
