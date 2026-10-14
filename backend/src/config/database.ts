import { PrismaClient } from '@prisma/client';
declare global {
  var prisma: PrismaClient | undefined;
}
const prismaClient = global.prisma || new PrismaClient({ log: ['error', 'warn'] });
if (process.env.NODE_ENV === 'development') global.prisma = prismaClient;
export default prismaClient;
export { prismaClient };
