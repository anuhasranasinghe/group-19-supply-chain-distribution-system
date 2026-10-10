// User Service — User Management Business Logic

// Handles CRUD operations for users (admin-only operations like creating staff accounts, listing users, etc.)
//
// This service is separate from authService because user management is an admin function, while auth is used by all roles.

import { pool } from '../database/connection.js';
import { hashPassword } from '../utils/password.js';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors.js';
import type { SafeUser, SystemRole, WorkerType } from '../types/index.js';

interface CreateUserData {
  username: string;
  password: string;
  name: string;
  system_role: SystemRole;
  worker_type?: WorkerType;
  hourly_pay?: number;
  phone_no?: string;
}

interface UpdateUserData {
  name?: string;
  system_role?: SystemRole;
  hourly_pay?: number;
  phone_no?: string;
}

// List all users in the system (admin only).
export async function getAllUsers(page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;

  const result = await pool.query(
    "SELECT id, username, name, system_role, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2",
    [limit, offset]
  );

  const countResult = await pool.query(
    "SELECT COUNT(*) FROM users"
  );

  return {
    users: result.rows,
    total: parseInt(countResult.rows[0]?.count || '0', 10),
    page,
    limit,
  };
}

// Get a single user by ID (admin only).
export async function getUserById(userId: string) {

  const result = await pool.query(
    `SELECT 
       u.id, u.username, u.name, u.system_role, u.created_at, u.updated_at,
       w.type AS worker_type, w.hourly_pay,
       COALESCE(w.phone_no, c.phone_no) AS phone_no,
       c.street_name, c.city, c.postal_code
     FROM users u
     LEFT JOIN workers w ON u.id = w.id
     LEFT JOIN customers c ON u.id = c.id
     WHERE u.id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('User');
  }

  return result.rows[0];
}

// Create a new staff user (admin only).
// Staff users can be dispatchers, store managers, drivers, or assistants.
// Customer self-registration is handled by authService.register().
export async function createUser(data: CreateUserData) {
  // Validate that worker fields are provided for worker roles
  const workerRoles: SystemRole[] = ['driver', 'assistant', 'store_manager'];
  if (workerRoles.includes(data.system_role)) {
    if (!data.worker_type) {
      throw new ValidationError('Worker type is required for staff roles.');
    }
    if (!data.hourly_pay) {
      throw new ValidationError('Hourly pay is required for staff roles.');
    }
  }

  // Check username uniqueness
  // TODO: Write the PostgreSQL query to check if username exists.
  //
  // Use: SELECT id FROM users WHERE username = $1
  // IMPORTANT: Use parameterized values via pg.

  const existingUser = await pool.query(
    "SELECT id FROM users WHERE username = $1",
    [data.username]
  );

  if (existingUser.rows.length > 0) {
    throw new ConflictError('Username is already taken.');
  }

  const passwordHash = await hashPassword(data.password);

  // Use a transaction because we might need to insert into
  // both "users" and "workers" tables.
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      "INSERT INTO users (username, password_hash, name, system_role) VALUES ($1, $2, $3, $4) RETURNING id, username, name, system_role, created_at, updated_at",
      [data.username, passwordHash, data.name, data.system_role]
    );

    const newUser = userResult.rows[0];

    // If this is a worker role, also insert into the workers table
    if (workerRoles.includes(data.system_role) && data.worker_type && data.hourly_pay) {

      await client.query(
        "INSERT INTO workers (id, type, hourly_pay, phone_no) VALUES ($1, $2, $3, $4)",
        [newUser.id, data.worker_type, data.hourly_pay, data.phone_no || null]
      );
    }

    await client.query('COMMIT');
    return newUser;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Update an existing user (admin only).
export async function updateUser(userId: string, data: UpdateUserData) {

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE users 
       SET name = COALESCE($2, name), 
           system_role = COALESCE($3, system_role),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 
       RETURNING id, username, name, system_role, created_at, updated_at`,
      [userId, data.name ?? null, data.system_role ?? null]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User');
    }

    if (data.hourly_pay !== undefined || data.phone_no !== undefined) {
      await client.query(
        `UPDATE workers 
         SET hourly_pay = COALESCE($2, hourly_pay),
             phone_no = COALESCE($3, phone_no)
         WHERE id = $1`,
        [userId, data.hourly_pay ?? null, data.phone_no ?? null]
      );
    }

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Deactivate a user (admin only).
// We use soft-delete or actual delete depending on requirements.
export async function deleteUser(userId: string) {

  const result = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING id",
    [userId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('User');
  }

  return { deleted: true };
}
