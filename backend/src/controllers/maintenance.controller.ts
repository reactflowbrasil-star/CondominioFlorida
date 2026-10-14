import { Request, Response, NextFunction } from 'express';
import { maintenanceService } from '../services/maintenance.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class MaintenanceController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> { try { const result = await maintenanceService.createBlock({ ...req.body, createdBy: req.user!.id }); res.status(201).json(result); } catch (e: any) { next(e); } }
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> { try { const filters = { areaId: req.query.areaId as string, dateFrom: req.query.dateFrom as string, dateTo: req.query.dateTo as string, page: req.query.page ? parseInt(req.query.page as string) : 1, limit: req.query.limit ? parseInt(req.query.limit as string) : 20 }; const result = await maintenanceService.findAll(filters); res.status(200).json(result); } catch (e: any) { next(e); } }
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> { try { const block = await maintenanceService.getById(req.params.id); res.status(200).json({ block }); } catch (e: any) { next(e); } }
  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> { try { await maintenanceService.delete(req.params.id, req.user!.id); res.status(204).send(); } catch (e: any) { next(e); } }
}
export const maintenanceController = new MaintenanceController();
