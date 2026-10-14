import prismaClient from '../config/database.js';
import logger from '../config/logger.js';

export class NotificationService {
  async create(recipientId: string, payload: { event_type: string; title: string; message: string; metadata?: any }): Promise<void> {
    try {
      await prismaClient.notification.create({ data: { recipientId, eventType: payload.event_type, title: payload.title, message: payload.message, metadata: payload.metadata || {} } });
      logger.info({ recipientId, eventType: payload.event_type }, `Notification: ${payload.title}`);
    } catch (e: any) { logger.error({ err: e.message, recipientId }, 'Failed to create notification'); }
  }

  async sendBookingNotification(residentId: string, eventType: string, bookingId: string, reason?: string): Promise<void> {
    const messages: Record<string, { title: string; message: string }> = {
      BOOKING_CREATED: { title: 'Reservation Request Submitted', message: 'Your reservation request has been submitted and is awaiting approval.' },
      BOOKING_APPROVED: { title: 'Reservation Approved', message: 'Your reservation has been approved.' },
      BOOKING_REJECTED: reason ? { title: 'Reservation Rejected', message: `Rejected. Reason: ${reason}` } : { title: 'Reservation Rejected', message: 'Your reservation was rejected.' },
      BOOKING_CANCELLED: { title: 'Reservation Cancelled', message: 'Your reservation has been cancelled.' },
      MAINTENANCE_BLOCK_CREATED: { title: 'Maintenance Scheduled', message: 'A maintenance block overlaps with your reservation.' },
    };
    const msg = messages[eventType] || { title: 'Notification', message: `Event: ${eventType}` };
    await this.create(residentId, { event_type: eventType, title: msg.title, message: msg.message, metadata: { bookingId, reason } });
  }

  async getUserNotifications(userId: string, skip = 0, take = 20): Promise<any[]> { return prismaClient.notification.findMany({ where: { recipientId: userId }, skip, take, orderBy: { createdAt: 'desc' } }); }
  async getUnreadCount(userId: string): Promise<number> { return prismaClient.notification.count({ where: { recipientId: userId, read: false } }); }
  async markAsRead(id: string): Promise<void> { await prismaClient.notification.update({ where: { id }, data: { read: true, deliveredAt: new Date() } }); }
  async sendEmail(userId: string, subject: string, body: string): Promise<void> { logger.info({ userId, subject }, `[MOCK EMAIL] subject: ${subject}`); }
}
export const notificationService = new NotificationService();
