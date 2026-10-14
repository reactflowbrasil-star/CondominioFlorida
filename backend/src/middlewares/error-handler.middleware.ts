import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error.js';
import logger from '../config/logger.js';

export function errorHandler(error: Error | AppError, req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof AppError) {
    logger.warn({ err: error.message, method: req.method, url: req.url, statusCode: error.statusCode }, 'AppError');
    const response: any = { status: 'error', message: error.message };
    if (error.errorCode) response.code = error.errorCode;
    res.status(error.statusCode).json(response);
    return;
  }
  logger.error({ err: { message: error.message, stack: error.stack }, method: req.method, url: req.url }, 'Unhandled error');
  res.status(500).json({ status: 'error', message: 'Internal server error', code: 'INTERNAL_ERROR' });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ status: 'error', message: `Route ${req.method} ${req.url} not found` });
}

process.on('unhandledRejection', (reason: Error) => { logger.error({ err: reason }, 'Unhandled Rejection'); });
