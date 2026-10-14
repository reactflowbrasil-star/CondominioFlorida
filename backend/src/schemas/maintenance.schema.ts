import { z } from 'zod';
export const createMaintenanceBlockSchema = z.object({
  areaId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be HH:MM'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'End time must be HH:MM'),
  reason: z.string().min(5, 'Maintenance reason required'),
});
