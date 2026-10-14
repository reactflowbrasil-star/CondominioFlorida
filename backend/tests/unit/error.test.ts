import { AppError, ValidationError, AuthenticationError, AuthorizationError, NotFoundError, ConflictError, BusinessRuleError, RateLimitError } from '../../src/utils/error.js';

describe('Error Classes', () => {
  it('should create AppError with message and status code', () => {
    const error = new AppError('Test error', 500, 'TEST_ERROR');
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(500);
    expect(error.errorCode).toBe('TEST_ERROR');
    expect(error.isOperational).toBe(true);
    expect(error).toBeInstanceOf(Error);
  });

  it('should create ValidationError with 400 status', () => {
    const error = new ValidationError('Invalid data');
    expect(error.statusCode).toBe(400);
    expect(error.errorCode).toBe('VALIDATION_ERROR');
  });

  it('should create AuthenticationError with 401 status', () => {
    const error = new AuthenticationError('Bad credentials');
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Bad credentials');
  });

  it('should create AuthorizationError with 403 status', () => {
    const error = new AuthorizationError('No access');
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('No access');
  });

  it('should create NotFoundError with 404 status', () => {
    const error = new NotFoundError('User not found');
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('User not found');
  });

  it('should create ConflictError with 409 status', () => {
    const error = new ConflictError('Duplicate email', 'EMAIL_CONFLICT');
    expect(error.statusCode).toBe(409);
    expect(error.errorCode).toBe('EMAIL_CONFLICT');
  });

  it('should create BusinessRuleError with 422 status', () => {
    const error = new BusinessRuleError('Invalid operation', 'INVALID_OP');
    expect(error.statusCode).toBe(422);
    expect(error.errorCode).toBe('INVALID_OP');
  });

  it('should create RateLimitError with 429 status', () => {
    const error = new RateLimitError('Too many requests');
    expect(error.statusCode).toBe(429);
  });
});