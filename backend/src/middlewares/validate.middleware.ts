import { Request, Response, NextFunction, RequestHandler } from 'express';
import { z, ZodError } from 'zod';
import { ValidationError } from '../utils/error.js';

export function validateBody(schema: z.ZodSchema): RequestHandler {
  return (req, res, next) => {
    try { req.body = schema.parse(req.body); next(); }
    catch (error) {
      if (error instanceof ZodError) {
        const msgs = error.issues.map(e => `${e.path.join('.') || 'root'}: ${e.message}`).join(', ');
        next(new ValidationError(msgs));
      } else { next(error); }
    }
  };
}
export function validateQuery(schema: z.ZodSchema): RequestHandler {
  return (req, res, next) => {
    try { req.query = schema.parse(req.query) as any; next(); }
    catch (error) {
      if (error instanceof ZodError) { const m = error.issues.map(e => `${e.path.join('.') || 'root'}: ${e.message}`).join(', '); next(new ValidationError(m)); }
      else { next(error); }
    }
  };
}
