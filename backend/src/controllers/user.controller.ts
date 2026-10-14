import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { auditLogRepository } from '../repositories/audit-log.repository.js';

export class UserController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> { try { const user = await userService.createResident(req.body); res.status(201).json({ user }); } catch (e: any) { next(e); } }
  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = { name: req.query.name as string, block: req.query.block as string, apartment: req.query.apartment as string, role: req.query.role as string, status: req.query.status as string, page: req.query.page ? parseInt(req.query.page as string) : 1, limit: req.query.limit ? parseInt(req.query.limit as string) : 20 };
      const result = await userService.findAll(filters); res.status(200).json(result);
    } catch (e: any) { next(e); }
  }
  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> { try { const user = await userService.getUserById(req.params.id); res.status(200).json({ user }); } catch (e: any) { next(e); } }
  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> { try { const user = await userService.updateResident(req.params.id, req.body); res.status(200).json({ user }); } catch (e: any) { next(e); } }
  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> { try { const { status } = req.body; const user = await userService.updateUserRoleAndStatus(req.params.id, { status }); res.status(200).json({ user }); } catch (e: any) { next(e); } }
  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> { try { await userService.updateUserRoleAndStatus(req.params.id, { status: 'INACTIVE' }); res.status(204).send(); } catch (e: any) { next(e); } }
  async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try { const skip = req.query.page ? (parseInt(req.query.page as string) - 1) * (parseInt(req.query.limit as string) || 50) : 0; const take = req.query.limit ? parseInt(req.query.limit as string) : 50; const logs = await auditLogRepository.findMany({}, skip, take); res.status(200).json({ logs }); } catch (e: any) { next(e); }
  }
  async resetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> { try { await userService.resetPassword(req.params.id, req.body.newPassword); res.status(200).json({ message: 'Password reset successfully' }); } catch (e: any) { next(e); } }
  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> { try { await userService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword); res.status(200).json({ message: 'Password changed successfully' }); } catch (e: any) { next(e); } }
}
export const userController = new UserController();
