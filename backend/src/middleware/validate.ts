// ============================================================
// Validation Middleware
// ============================================================
// Uses Zod schemas to validate incoming request data (body, params, query) before it reaches the controller. If validation fails, a structured error response is returned immediately — the controller never sees invalid data.
//
// This is the backend's primary input validation layer.
// Frontend validation improves UX, but backend validation is mandatory for security and correctness. Never trust client-side data.
// ============================================================

import type { Request, Response, NextFunction } from 'express';
import { type ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors.js';

// Which part of the request to validate
type ValidationTarget = 'body' | 'params' | 'query';

// Factory function that creates a validation middleware for
// a specific Zod schema and request target.
//
// Usage in routes:
//   router.post('/orders', validate(createOrderSchema, 'body'), controller)
//   router.get('/orders/:id', validate(idParamSchema, 'params'), controller)
export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // Zod's parse() throws a ZodError if validation fails.
      // If it succeeds, it returns the parsed (and optionally
      // transformed/coerced) data. We replace the original
      // request data with the parsed version so controllers
      // get clean, typed data.
      const parsed = schema.parse(req[target]);
      if (target === 'query') {
        Object.defineProperty(req, 'query', {
          value: parsed,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      } else {
        req[target] = parsed;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Transform Zod's error format into our API's error format.
        // Zod provides detailed field-level errors which we pass
        // through so the frontend can display per-field messages.
        const details = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        next(new ValidationError('Validation failed', details));
      } else {
        next(error);
      }
    }
  };
}
