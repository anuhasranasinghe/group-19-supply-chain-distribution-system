// ============================================================
// JWT Utility — Token Generation & Verification
// ============================================================
// JSON Web Tokens (JWT) are used for stateless authentication.
// After login, the server creates a signed JWT containing the user's ID and role. 
// On subsequent requests, the server verifies this token to identify the user without hitting the database every time.
//
// The JWT is stored in an HttpOnly cookie — not localStorage —so JavaScript on the frontend cannot read it. This prevents XSS attacks from stealing the token.
// ============================================================

import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';
import type { SystemRole } from '../types/index.js';

// The payload structure encoded inside the JWT.
// Keep this minimal — the token travels with every request,
// so large payloads waste bandwidth.
export interface JwtPayload {
  userId: string;
  systemRole: SystemRole;
}

// Create a signed JWT for an authenticated user.
// Called after successful login or registration.
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
}

// Verify and decode a JWT. Returns the payload if valid,
// or throws an error if the token is expired, tampered with,
// or signed with a different secret.
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
}
