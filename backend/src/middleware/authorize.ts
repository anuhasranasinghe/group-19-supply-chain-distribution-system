// ============================================================
// Authorization Middleware
// ============================================================
// This middleware answers the question: "What is the user allowed to do?"
//
// It runs AFTER authentication, so req.user is already set.
// It checks whether the authenticated user's system_role is in the list of roles allowed for this particular endpoint.
//
// This is a higher-order function (a function that returns a function). We call it with the allowed roles when defining routes, and it returns the actual middleware function.
//
// Example usage in routes:
//   router.get('/admin-only', authenticate, authorize('admin'), controller)
//   router.get('/staff', authenticate, authorize('admin', 'dispatcher'), controller)
// ============================================================

import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/express.js';
import type { SystemRole } from '../types/index.js';
import { ForbiddenError, UnauthorizedError } from '../utils/errors.js';

// This is a factory function — it creates a middleware tailored
// to specific allowed roles. This pattern lets us reuse the same
// authorization logic across different routes with different
// role requirements.
export function authorize(...allowedRoles: SystemRole[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    // The authentication middleware should have run before this.
    // If req.user is missing, something went wrong in the middleware chain.
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required before authorization check.'));
    }

    // Check if the user's role is in the allowed list.
    // If not, they're authenticated (we know who they are)
    // but not authorized (they can't access this resource).
    if (!allowedRoles.includes(req.user.system_role)) {
      return next(
        new ForbiddenError(
          `Access denied. This action requires one of the following roles: ${allowedRoles.join(', ')}. ` +
          `Your role is: ${req.user.system_role}.`
        )
      );
    }

    // User is authorized — proceed to the controller
    next();
  };
}
