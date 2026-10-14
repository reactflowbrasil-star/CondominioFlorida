import { z } from 'zod';
export const areaSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  capacity: z.number().int().positive(),
  openingTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Opening time must be HH:MM'),
  closingTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Closing time must be HH:MM'),
  operatingDays: z.array(z.number().int().min(0).max(6)).min(1),
  reservationDurationMinutes: z.number().int().positive().default(120),
  advanceBookingDays: z.number().int().min(0).default(30),
  active: z.boolean().default(true),
  requiresApproval: z.boolean().default(false),
});
export const updateAreaSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  openingTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Opening time must be HH:MM').optional(),
  closingTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Closing time must be HH:MM').optional(),
  operatingDays: z.array(z.number().int().min(0).max(6)).min(1).optional(),
  reservationDurationMinutes: z.number().int().positive().optional(),
  advanceBookingDays: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
  requiresApproval: z.boolean().optional(),
});
export const areaStatusSchema = z.object({ active: z.boolean() });
