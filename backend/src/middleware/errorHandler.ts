// ============================================================
// Global Error Handler Middleware
// ============================================================
// Express error-handling middleware has FOUR parameters (err, req, res, next). Express uses the parameter count to distinguish error handlers from regular middleware.
//
// This is the last middleware in the chain. Every error thrown or passed to next(error) anywhere in the application ends up here. It translates errors into consistent API responses and prevents sensitive internal details from leaking to the client.
// ============================================================

import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { config } from '../config/environment.js';

// The consistent error response shape that the frontend expects.
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Express identifies error handlers by their 4-parameter signature.
// Even if we don't use `next`, we must include it.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log the error for debugging. In production, you'd send
  // this to a logging service instead of console.
  console.error('Error:', err.message);
  if (config.nodeEnv === 'development') {
    console.error(err.stack);
  }

  // If it's one of our custom AppError subclasses, we know
  // the status code and error code to use.
  if (err instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // For unexpected errors (bugs, database failures, etc.),
  // return a generic 500 response. NEVER expose internal
  // error details in production — they could reveal database
  // schema, file paths, or other sensitive information.
  const response: ErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: config.nodeEnv === 'development'
        ? err.message
        : 'An unexpected error occurred. Please try again later.',
    },
  };
  res.status(500).json(response);
}
