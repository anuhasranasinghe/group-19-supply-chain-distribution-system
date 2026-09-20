// Auth Controller — HTTP Layer for Authentication

// Controllers stay focused on the HTTP request itself: 
// extract parameters, call the service, format the response. 
// Business logic belongs in the service layer so it can be reused without tying it to an Express request.

import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/express.js';
import * as authService from '../services/authService.js';
import { AUTH_COOKIE_NAME } from '../config/constants.js';
import { config } from '../config/environment.js';

// POST /api/auth/login
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body;
    const { user, token } = await authService.login(username, password);

    // Set the JWT in an HttpOnly cookie. This is critical:
    // - httpOnly: JavaScript cannot read the cookie (prevents XSS token theft)
    // - secure: Cookie only sent over HTTPS (in production)
    // - sameSite: Prevents CSRF attacks by restricting cross-site cookie sending
    // - maxAge: Cookie expires after 24 hours (matches JWT expiry)
    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      path: '/',
    });

    res.json({ success: true, data: { user }, message: 'Login successful' });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/register
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { user, token } = await authService.register(req.body);

    // Auto-login after registration by setting the cookie
    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.status(201).json({ success: true, data: { user }, message: 'Registration successful' });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/logout
export async function logout(_req: Request, res: Response) {
  // Clear the auth cookie by setting it to an empty value
  // with an immediate expiry.
  res.cookie(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
    maxAge: 0,
    path: '/',
  });

  res.json({ success: true, message: 'Logged out successfully' });
}

// GET /api/auth/me
export async function me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // req.user is set by the authenticate middleware.
    // We fetch fresh data from the database in case anything changed.
    const user = await authService.getCurrentUser(req.user!.id);
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
}
