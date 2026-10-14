import { Request, Response, NextFunction } from 'express';
import { areaService } from '../services/area.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class AreaController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> { try { const area = await areaService.create(req.body); res.status(201).json({ area }); } catch (e: any) { next(e); } }
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> { try { const includeInactive = req.query.includeInactive === 'true'; const areas = await areaService.findAll(includeInactive); res.status(200).json({ data: areas }); } catch (e: any) { next(e); } }
  async findById(req: Request, res: Response, next: NextFunction): Promise<void> { try { const area = await areaService.findById(req.params.id); res.status(200).json({ area }); } catch (e: any) { next(e); } }
  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> { try { const area = await areaService.update(req.params.id, req.body); res.status(200).json({ area }); } catch (e: any) { next(e); } }
  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> { try { const area = await areaService.updateStatus(req.params.id, req.body.active); res.status(200).json({ area }); } catch (e: any) { next(e); } }
  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> { try { await areaService.delete(req.params.id); res.status(204).send(); } catch (e: any) { next(e); } }
  async getAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const date = req.query.date as string; if (!date) throw new Error('Date parameter is required'); const slots = await areaService.getAvailability(req.params.id, date); res.status(200).json({ availableSlots: slots }); } catch (e: any) { next(e); }
  }
}
export const areaController = new AreaController();
