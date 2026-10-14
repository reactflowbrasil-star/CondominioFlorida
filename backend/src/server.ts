import './config/env.js';
import { createApp } from './app.js';
import prismaClient from './config/database.js';
import logger from './config/logger.js';
import { env } from './config/env.js';
import { startCronJobs } from './jobs/cron.js';

async function startServer() {
  const app = createApp();
  await prismaClient.$connect();
  logger.info('Database connected');
  startCronJobs();
  const port = env.PORT;
  app.listen(port, () => logger.info(`Server running on port ${port}`));
}
startServer().catch(e => { logger.error(e); process.exit(1); });
