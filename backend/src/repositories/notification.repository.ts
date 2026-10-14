import prismaClient from '../config/database.js';
export class NotificationRepository {
  async create(data: any) { return prismaClient.notification.create({ data }); }
  async createMany(data: any[]) { return prismaClient.notification.createMany({ data, skipDuplicates: true }); }
  async findMany(where: any = {}, skip = 0, take = 20) { return prismaClient.notification.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }); }
  async findUnread(recipientId: string) { return prismaClient.notification.findMany({ where: { recipientId, read: false } }); }
  async markAsRead(id: string) { return prismaClient.notification.update({ where: { id }, data: { read: true, deliveredAt: new Date() } }); }
}
export const notificationRepository = new NotificationRepository();
