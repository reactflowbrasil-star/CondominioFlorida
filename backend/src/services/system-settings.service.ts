import prismaClient from '../config/database.js';
import logger from '../config/logger.js';

const DEFAULT_SETTINGS: Record<string, any> = {
  weekly_reservation_limit: { value: 2, description: 'Maximum bookings per resident per week' },
  cancellation_advance_hours: { value: 12, description: 'Minimum hours before start to cancel' },
  auto_approve_bookings: { value: false, description: 'Auto-approve new bookings' },
  timezone: { value: 'America/Sao_Paulo', description: 'System timezone' },
  qr_code_enabled: { value: true, description: 'Enable QR Code check-in' },
  min_booking_advance_minutes: { value: 60, description: 'Minimum advance booking in minutes' },
};

export class SystemSettingsService {
  private cached: Record<string, any> | null = null;

  async loadSettings(): Promise<void> {
    this.cached = {};
    const all = await prismaClient.systemSetting.findMany();
    for (const s of all) this.cached[s.key] = s.value;
    for (const [key, def] of Object.entries(DEFAULT_SETTINGS)) {
      if (this.cached[key] === undefined) { this.cached[key] = def.value; await prismaClient.systemSetting.create({ data: { key, value: def.value, type: typeof def.value, description: def.description } }); }
    }
  }

  async getValue<T = any>(key: string, defaultValue: T): Promise<T> {
    if (!this.cached) await this.loadSettings();
    if (!this.cached) return defaultValue;
    return this.cached[key] !== undefined ? this.cached[key] : defaultValue;
  }

  async setValue(key: string, value: any): Promise<void> { await prismaClient.systemSetting.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value), type: typeof value, description: '' } }); this.cached = null; }
  async getAll(): Promise<Record<string, any>> {
    if (!this.cached) await this.loadSettings();
    const result: Record<string, any> = {};
    for (const [key, def] of Object.entries(DEFAULT_SETTINGS)) result[key] = this.cached ? (this.cached[key] !== undefined ? this.cached[key] : def.value) : def.value;
    return result;
  }
  async resetCache(): Promise<void> { this.cached = null; }
}
export const systemSettingsService = new SystemSettingsService();
