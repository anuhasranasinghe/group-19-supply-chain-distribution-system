// Auth Service — Authentication Business Logic

// This service handles the core authentication operations: 
// login, registration, and user lookup. It sits between the
// controller (HTTP layer) and the database (pg), containing
// the business rules for authentication.

import { pool } from '../database/connection.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken, type JwtPayload } from '../utils/jwt.js';
import { UnauthorizedError, ValidationError, ConflictError } from '../utils/errors.js';
import type { SafeUser, SystemRole } from '../types/index.js';

interface LoginResult {
  user: SafeUser;
  token: string;
}

interface RegisterData {
  username: string;
  password: string;
  name: string;
  city: string;
  street_name?: string;
  postal_code?: string;
  phone_no?: string;
}

// Authenticate a user with username and password.
// Returns a JWT token and user info if credentials are valid.
export async function login(username: string, password: string): Promise<LoginResult> {

  const result = await pool.query(
    "SELECT id, username, password_hash, name, system_role, created_at, updated_at FROM users WHERE username = $1",
    [username]
  );

  const user = result.rows[0];

  if (!user) {
    // Use a generic message to avoid revealing whether the
    // username exists — an attacker shouldn't be able to
    // enumerate valid usernames.
    throw new UnauthorizedError('Invalid username or password.');
  }

  // Compare the submitted password against the stored bcrypt hash.
  // bcrypt.compare handles the salt extraction internally.
  const passwordMatches = await comparePassword(password, user.password_hash);

  if (!passwordMatches) {
    throw new UnauthorizedError('Invalid username or password.');
  }

  // Create a JWT containing the user's ID and role.
  const payload: JwtPayload = {
    userId: user.id,
    systemRole: user.system_role,
  };
  const token = generateToken(payload);

  return {
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      system_role: user.system_role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
    token,
  };
}

// Register a new customer account.
// Only customers can self-register; staff accounts are created
// by admins through the user management API.
export async function register(data: RegisterData): Promise<LoginResult> {
  // Step 1: Check if the username is already taken.

  const existingUser = await pool.query(
    "SELECT id FROM users WHERE username = $1",
    [data.username]
  );

  if (existingUser.rows.length > 0) {
    throw new ConflictError('Username is already taken. Please choose a different one.');
  }

  // Step 2: Hash the password before storing it.
  const passwordHash = await hashPassword(data.password);

  // Step 3: Insert the new user and customer records.

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      "INSERT INTO users (username, password_hash, name, system_role) VALUES ($1, $2, $3, $4) RETURNING id, username, name, system_role, created_at, updated_at",
      [data.username, passwordHash, data.name, 'customer']
    );

    const newUser = userResult.rows[0];

    await client.query(
      "INSERT INTO customers(id, street_name, city, postal_code, phone_no) VALUES ($1, $2, $3, $4, $5)",
      [newUser.id, data.street_name || null, data.city, data.postal_code || null, data.phone_no || null]
    );

    await client.query('COMMIT');

    // Create JWT for the new user (auto-login after registration)
    const payload: JwtPayload = {
      userId: newUser.id,
      systemRole: 'customer' as SystemRole,
    };
    const token = generateToken(payload);

    return {
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        system_role: newUser.system_role,
        created_at: newUser.created_at,
        updated_at: newUser.updated_at,
      },
      token,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Fetch the currently authenticated user's details.
// Called by GET /api/auth/me to check if the session is still valid.
export async function getCurrentUser(userId: string): Promise<SafeUser> {

  const result = await pool.query(
    "SELECT id, username, name, system_role, created_at, updated_at FROM users WHERE id = $1",
    [userId]
  );

  const user = result.rows[0];

  if (!user) {
    throw new UnauthorizedError('User not found.');
  }

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    system_role: user.system_role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}
