import prismaClient from '../config/database.js';

export class SystemSettingsRepository {
  async get(key: string) { return prismaClient.systemSetting.findUnique({ where: { key } }); }
  async getValue<T = any>(key: string, defaultValue: T): Promise<T> {
    const s = await prismaClient.systemSetting.findUnique({ where: { key } });
    return s ? (s.value as T) : defaultValue;
  }
  async set(key: string, value: any, description?: string) {
    return prismaClient.systemSetting.upsert({ where: { key }, update: { value, description }, create: { key, value, type: typeof value, description } });
  }
  async getAll() { return prismaClient.systemSetting.findMany(); }
  async update(key: string, value: any) { return prismaClient.systemSetting.update({ where: { key }, data: { value } }); }
}
export const systemSettingsRepository = new SystemSettingsRepository();
