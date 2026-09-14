// ============================================================
// Custom Error Classes
// ============================================================
// Custom error classes let us throw meaningful, structured errors from services that the error handler middleware can translate into proper HTTP responses. 
// Without these, every service would need to know about HTTP status codes, mixing business logic with HTTP concerns.
// ============================================================

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(message: string, statusCode: number, code: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    // Ensure the correct prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// 400 — The request is malformed or has invalid data
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

// 401 — The user is not authenticated (no token or invalid token)
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

// 403 — The user is authenticated but lacks permission
export class ForbiddenError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
  }
}

// 404 — The requested resource doesn't exist
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

// 409 — The request conflicts with a business rule
// (e.g., double-booking, capacity exceeded)
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}
