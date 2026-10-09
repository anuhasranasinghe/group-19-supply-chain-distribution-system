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
  // TODO: Write the PostgreSQL query here.
  //
  // This query should:
  // 1. Select the user from the "users" table where username matches.
  // 2. Must include password_hash for bcrypt comparison.
  // 3. Return id, username, password_hash, name, system_role.
  // 4. Use parameterized query: pool.query('...WHERE username = $1', [username])
  //
  // IMPORTANT: Use parameterized values via pg. Do NOT concatenate
  // user input directly into the SQL string.
  //
  // Expected return: One row if found, zero rows if not found.

  const result = await pool.query(
  `SELECT id, username, password_hash, name, system_role, created_at, updated_at
   FROM users
   WHERE username = $1`,
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
  // TODO: Write the PostgreSQL query here.
  //
  // This query should:
  // 1. Check if a row exists in "users" with the given username.
  // 2. Use: SELECT id FROM users WHERE username = $1
  // 3. If a row exists, the username is taken.
  //
  // IMPORTANT: Use parameterized values via pg.

  const existingUser = await pool.query(
    `/* YOUR SQL QUERY HERE — check if username exists */`,
    [data.username]
  );

  if (existingUser.rows.length > 0) {
    throw new ConflictError('Username is already taken. Please choose a different one.');
  }

  // Step 2: Hash the password before storing it.
  const passwordHash = await hashPassword(data.password);

  // Step 3: Insert the new user and customer records.
  // This should be done in a TRANSACTION because we need to
  // insert into both "users" and "customers" tables. If one
  // insert fails, we need to roll back the other.
  //
  // TODO: Write the PostgreSQL transaction here.
  //
  // The transaction should:
  // 1. BEGIN
  // 2. INSERT into "users" table:
  //    - Generate UUID (or let the database default handle it)
  //    - username, password_hash, name, system_role = 'customer'
  //    - RETURNING id, username, name, system_role, created_at, updated_at
  // 3. INSERT into "customers" table:
  //    - id = the user id from step 2 (shared primary key)
  //    - city, street_name, postal_code, phone_no
  // 4. COMMIT
  //
  // If any step fails, ROLLBACK.
  //
  // IMPORTANT: Use parameterized values via pg.
  // IMPORTANT: Use pool.connect() to get a client for transaction,
  // then client.query('BEGIN'), client.query('INSERT...'), etc.

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      `/* YOUR SQL INSERT QUERY HERE — insert into users table */`,
      [data.username, passwordHash, data.name, 'customer']
    );

    const newUser = userResult.rows[0];

    await client.query(
      `/* YOUR SQL INSERT QUERY HERE — insert into customers table */`,
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
  // TODO: Write the PostgreSQL query here.
  //
  // This query should:
  // 1. Select user info from "users" table by id.
  // 2. Optionally LEFT JOIN with "customers" or "workers" to
  //    include role-specific details.
  // 3. Do NOT return password_hash.
  // 4. Use parameterized query.
  //
  // Expected return: One user row.

  const result = await pool.query(
    `/* YOUR SQL QUERY HERE */`,
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
