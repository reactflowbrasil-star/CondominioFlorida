import { areaRepository } from '../repositories/area.repository.js';
import { NotFoundError, BusinessRuleError } from '../utils/error.js';

export class AreaService {
  async create(data: any) { return areaRepository.create(data); }
  async findById(id: string) { const a = await areaRepository.findUnique({ id }); if (!a) throw new NotFoundError('Area not found'); return a; }
  async findAll(includeInactive = false) { return areaRepository.findMany({}, includeInactive); }
  async update(id: string, data: any) { const a = await areaRepository.findUnique({ id }); if (!a) throw new NotFoundError('Area not found'); return areaRepository.update({ id }, data); }
  async updateStatus(id: string, active: boolean) { const a = await areaRepository.findUnique({ id }); if (!a) throw new NotFoundError('Area not found'); return areaRepository.update({ id }, { active }); }
  async delete(id: string) { const a = await areaRepository.findUnique({ id }); if (!a) throw new NotFoundError('Area not found'); await areaRepository.delete({ id }); }

  async getAvailability(areaId: string, date: string): Promise<string[]> {
    const area = await this.findById(areaId);
    if (!area.active) throw new BusinessRuleError('Area is not active', 'AREA_INACTIVE');
    const targetDate = new Date(date + 'T00:00:00');
    const dayOfWeek = targetDate.getDay();
    if (!area.operatingDays.includes(dayOfWeek)) return [];

    const openMin = this.toMin(area.openingTime);
    const closeMin = this.toMin(area.closingTime);
    const duration = area.reservationDurationMinutes;
    const slots: string[] = [];
    for (let s = openMin; s + duration <= closeMin; s += duration) {
      const sh = Math.floor(s / 60).toString().padStart(2, '0');
      const sm = (s % 60).toString().padStart(2, '0');
      const em = Math.floor((s + duration) / 60).toString().padStart(2, '0');
      const em2 = ((s + duration) % 60).toString().padStart(2, '0');
      slots.push(`${sh}:${sm}-${em}:${em2}`);
    }
    return slots;
  }

  private toMin(t: string): number { const [h, m] = t.split(':').map(Number); return h * 60 + m; }
}
export const areaService = new AreaService();
