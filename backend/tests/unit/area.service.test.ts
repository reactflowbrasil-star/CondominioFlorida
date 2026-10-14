import { vi, describe, it, expect, beforeEach } from 'vitest';
import { areaService } from '../../src/services/area.service.js';
import { areaRepository } from '../../src/repositories/area.repository.js';
import { NotFoundError, BusinessRuleError } from '../../src/utils/error.js';

vi.mock('../../src/repositories/area.repository.js');

describe('Area Service', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('findById', () => {
    it('should return area when found', async () => {
      vi.mocked(areaRepository.findUnique).mockResolvedValue({ id: 'area-1', name: 'Gym', active: true } as any);
      const result = await areaService.findById('area-1');
      expect(result).toEqual({ id: 'area-1', name: 'Gym', active: true });
    });

    it('should throw NotFoundError when area not found', async () => {
      vi.mocked(areaRepository.findUnique).mockResolvedValue(null as any);
      await expect(areaService.findById('non-existent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getAvailability', () => {
    it('should throw BusinessRuleError for inactive area', async () => {
      vi.mocked(areaRepository.findUnique).mockResolvedValue({ id: '1', active: false, openingTime: '08:00', closingTime: '18:00', operatingDays: [1, 2, 3, 4, 5], reservationDurationMinutes: 60 } as any);
      await expect(areaService.getAvailability('1', '2024-01-01')).rejects.toThrow(BusinessRuleError);
    });

    it('should return empty array for non-operating day', async () => {
      vi.mocked(areaRepository.findUnique).mockResolvedValue({ id: '1', active: true, openingTime: '08:00', closingTime: '18:00', operatingDays: [1, 2, 3, 4, 5], reservationDurationMinutes: 60 } as any);
      const result = await areaService.getAvailability('1', '2024-01-06');
      expect(result).toEqual([]);
    });

    it('should return availability slots for operating day', async () => {
      vi.mocked(areaRepository.findUnique).mockResolvedValue({ id: '1', active: true, openingTime: '08:00', closingTime: '10:00', operatingDays: [1, 2, 3, 4, 5], reservationDurationMinutes: 60 } as any);
      const result = await areaService.getAvailability('1', '2024-01-01');
      expect(result).toContain('08:00-09:00');
      expect(result).toContain('09:00-10:00');
    });
  });
});
