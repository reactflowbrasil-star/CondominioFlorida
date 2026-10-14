import { CronJob } from 'cron';
import prismaClient from '../config/database.js';
import logger from '../config/logger.js';

export function startCronJobs() {
  const cleanupTokens = new CronJob('0 2 * * *', async () => {
    try {
      const result = await prismaClient.refreshToken.deleteMany({ where: { OR: [{ expiresAt: { lte: new Date() } }, { revoked: true }] } });
      logger.info({ count: result.count }, 'Cleaned up expired/revoked refresh tokens');
    } catch (e: any) { logger.error({ err: e }, 'Token cleanup failed'); }
  });

  const autoReject = new CronJob('*/30 * * * *', async () => {
    try {
      const now = new Date();
      const stale = await prismaClient.booking.updateMany({ where: { status: 'PENDING', startsAt: { lt: now } }, data: { status: 'REJECTED', rejectedBy: 'system', rejectionReason: 'Auto-rejected: booking not processed in time' } });
      if (stale.count > 0) logger.info({ count: stale.count }, 'Auto-rejected stale pending bookings');
    } catch (e: any) { logger.error({ err: e }, 'Auto-reject stale bookings failed'); }
  });

  const completedJobs = new CronJob('0 3 * * *', async () => {
    try {
      const now = new Date();
      const completed = await prismaClient.booking.updateMany({ where: { status: 'APPROVED', endsAt: { lt: now } }, data: { status: 'COMPLETED' } });
      if (completed.count > 0) logger.info({ count: completed.count }, 'Marked completed bookings');
    } catch (e: any) { logger.error({ err: e }, 'Completed job marking failed'); }
  });

  const maintenanceCleanup = new CronJob('0 4 * * *', async () => {
    try {
      const now = new Date();
      const result = await prismaClient.maintenanceBlock.deleteMany({ where: { endsAt: { lt: now } } });
      logger.info({ count: result.count }, 'Cleaned up expired maintenance blocks');
    } catch (e: any) { logger.error({ err: e }, 'Maintenance cleanup failed'); }
  });

  cleanupTokens.start(); autoReject.start(); completedJobs.start(); maintenanceCleanup.start();
  logger.info('Cron jobs started: token cleanup, auto-reject stale bookings, completed bookings, maintenance cleanup');
}
