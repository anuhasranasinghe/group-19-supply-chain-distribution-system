import type { Request } from 'express';
import type { SafeUser } from './index.js';

// ============================================================
// Express Request Extension
// ============================================================
// When our authentication middleware verifies the JWT, it
// attaches the authenticated user's information to the request
// object. TypeScript needs to know about this extra property.
//
// We extend Express's Request interface so that any controller
// or middleware downstream can access `req.user` in a type-safe
// way without casting to `any`.
// ============================================================

export interface AuthenticatedRequest extends Request {
  user?: SafeUser;
}
