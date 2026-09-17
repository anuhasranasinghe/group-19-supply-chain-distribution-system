// ============================================================
// Password Utility — bcrypt Hashing
// ============================================================
// Handles password hashing and comparison using bcrypt.
// bcrypt is specifically designed for password hashing: it's intentionally slow (configurable via salt rounds) to make brute-force attacks impractical.
//
// NEVER store plain-text passwords. NEVER use fast hash
// functions (MD5, SHA-256) for passwords — they're too quick
// to brute-force.
// ============================================================

import bcrypt from 'bcryptjs';

// Salt rounds determine how computationally expensive the
// hash is. 12 is a good balance between security and speed
// for a development project. Higher values are more secure
// but take longer to compute.
const SALT_ROUNDS = 12;

// Hash a plain-text password before storing it in the database.
// This is called during user registration and password changes.
export async function hashPassword(plainTextPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(plainTextPassword, salt);
}

// Compare a plain-text password against a stored bcrypt hash.
// This is called during login to verify the user's password
// without ever decrypting the stored hash (bcrypt is one-way).
export async function comparePassword(
  plainTextPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainTextPassword, hashedPassword);
}
