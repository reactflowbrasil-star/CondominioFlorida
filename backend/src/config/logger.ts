import { pino } from 'pino';
import { env } from './env.js';

const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: { colorize: true, translateTime: 'HH:MM:ss' },
  } : undefined,
  serializers: {
    req: (req: any) => req ? { method: req.method, url: req.url, remoteAddress: req.socket?.remoteAddress } : undefined,
    res: (res: any) => res ? { statusCode: res.statusCode } : undefined,
  },
  redact: ['req.headers.authorization', '*.password', '*.passwordHash', '*.token', '*.cpf'],
});
export default logger;
