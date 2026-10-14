export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode?: string;
  constructor(message: string, statusCode: number, errorCode?: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
export class ValidationError extends AppError { constructor(m = 'Validation error', c = 'VALIDATION_ERROR') { super(m, 400, c); } }
export class AuthenticationError extends AppError { constructor(m = 'Invalid credentials') { super(m, 401, 'UNAUTHORIZED'); } }
export class AuthorizationError extends AppError { constructor(m = 'Insufficient permissions') { super(m, 403, 'FORBIDDEN'); } }
export class NotFoundError extends AppError { constructor(m = 'Resource not found') { super(m, 404, 'NOT_FOUND'); } }
export class ConflictError extends AppError { constructor(m: string, c = 'CONFLICT') { super(m, 409, c); } }
export class BusinessRuleError extends AppError { constructor(m: string, c = 'BUSINESS_RULE') { super(m, 422, c); } }
export class RateLimitError extends AppError { constructor(m = 'Too many requests') { super(m, 429, 'RATE_LIMITED'); } }
