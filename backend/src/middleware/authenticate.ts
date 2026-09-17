// ============================================================
// Authentication Middleware
// ============================================================
// This middleware answers the question: "Who is the user?"
//
// It runs on every protected route BEFORE the controller.
// It extracts the JWT from the HttpOnly cookie, verifies it, then attaches the user's information to the request object
// So downstream middleware and controllers know who is making the request.
//
// Flow:
//   Request arrives → cookie-parser extracts cookies → this middleware reads the JWT cookie → verifies the token → fetches user from database → attaches user to req → passes to next middleware (usually authorize)
// ============================================================

import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/express.js';
import { verifyToken } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';
import { AUTH_COOKIE_NAME } from '../config/constants.js';
import { pool } from '../database/connection.js';

export async function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Step 1: Extract the JWT from the HttpOnly cookie.
    // The cookie was set during login and is sent automatically
    // by the browser with every request (when credentials: true).
    const token = req.cookies?.[AUTH_COOKIE_NAME];

    if (!token) {
      throw new UnauthorizedError('No authentication token provided. Please log in.');
    }

    // Step 2: Verify and decode the JWT.
    // This checks the signature (was it signed by our server?)
    // and expiration (has it expired?).
    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw new UnauthorizedError('Invalid or expired authentication token. Please log in again.');
    }

    // Step 3: Fetch the current user from the database.
    // We do this on every request rather than trusting the JWT
    // payload alone, because the user might have been deleted
    // or their role might have changed since the JWT was issued.

    // TODO: Write the PostgreSQL query here.
    //
    // This query should:
    // 1. Select the user from the "users" table by id.
    // 2. Return id, username, name, system_role, created_at, updated_at.
    // 3. Do NOT return password_hash — we don't need it here.
    // 4. Use parameterized query: pool.query('SELECT ... WHERE id = $1', [userId])
    //
    // IMPORTANT: Use parameterized values via pg. Do NOT concatenate
    // user input directly into the SQL string.
    //
    // Expected return: A single user row or no rows if the user
    // was deleted after the JWT was issued.

    const result = await pool.query(
      `/* YOUR SQL QUERY HERE */`,
      [payload.userId]
    );

    const user = result.rows[0];

    if (!user) {
      throw new UnauthorizedError('User account no longer exists.');
    }

    // Step 4: Attach the user to the request object.
    // Now any downstream middleware or controller can access
    // req.user to know who is making the request.
    req.user = {
      id: user.id,
      username: user.username,
      name: user.name,
      system_role: user.system_role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    next();
  } catch (error) {
    next(error);
  }
}
