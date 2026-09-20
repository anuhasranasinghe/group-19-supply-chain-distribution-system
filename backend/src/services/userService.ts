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

  // TODO: Write the PostgreSQL query here.
  //
  // This query should:
  // 1. Select id, username, name, system_role, created_at, updated_at from "users".
  // 2. Do NOT return password_hash.
  // 3. Optionally LEFT JOIN with "workers" to include type and hourly_pay.
  // 4. Optionally LEFT JOIN with "customers" to include customer details.
  // 5. Order by created_at DESC (newest first).
  // 6. Apply pagination with LIMIT $1 OFFSET $2.
  // 7. Also run a COUNT(*) query to get total records for pagination.
  //
  // IMPORTANT: Use parameterized values via pg.

  const result = await pool.query(
    `/* YOUR SQL QUERY HERE */`,
    [limit, offset]
  );

  const countResult = await pool.query(
    `/* YOUR SQL COUNT QUERY HERE */`
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
  // TODO: Write the PostgreSQL query here.
  //
  // This query should:
  // 1. Select user details from "users" WHERE id = $1.
  // 2. LEFT JOIN with "customers" if system_role = 'customer'.
  // 3. LEFT JOIN with "workers" if the user has a worker record.
  // 4. Do NOT return password_hash.
  // 5. Use parameterized query.
  //
  // Expected return: One row with combined user + role-specific data.

  const result = await pool.query(
    `/* YOUR SQL QUERY HERE */`,
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
    `/* YOUR SQL QUERY HERE — check username */`,
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

    // TODO: Write the PostgreSQL INSERT for the users table.
    //
    // INSERT INTO users (username, password_hash, name, system_role)
    // VALUES ($1, $2, $3, $4)
    // RETURNING id, username, name, system_role, created_at, updated_at
    //
    // IMPORTANT: Use parameterized values via pg.

    const userResult = await client.query(
      `/* YOUR SQL INSERT QUERY HERE — users table */`,
      [data.username, passwordHash, data.name, data.system_role]
    );

    const newUser = userResult.rows[0];

    // If this is a worker role, also insert into the workers table
    if (workerRoles.includes(data.system_role) && data.worker_type && data.hourly_pay) {
      // TODO: Write the PostgreSQL INSERT for the workers table.
      //
      // INSERT INTO workers (id, type, hourly_pay, phone_no)
      // VALUES ($1, $2, $3, $4)
      //
      // The id shares the primary key with users.id.
      // IMPORTANT: Use parameterized values via pg.

      await client.query(
        `/* YOUR SQL INSERT QUERY HERE — workers table */`,
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
  // TODO: Write the PostgreSQL UPDATE query here.
  //
  // This query should:
  // 1. Update the "users" table SET name = $2, system_role = $3
  //    WHERE id = $1 (only update provided fields).
  // 2. If hourly_pay or phone_no are provided, also update the
  //    "workers" table.
  // 3. Use RETURNING to get the updated row.
  // 4. Use parameterized values.
  //
  // Consider using a transaction if updating both tables.

  const result = await pool.query(
    `/* YOUR SQL UPDATE QUERY HERE */`,
    [userId, data.name]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('User');
  }

  return result.rows[0];
}

// Deactivate a user (admin only).
// We use soft-delete or actual delete depending on requirements.
export async function deleteUser(userId: string) {
  // TODO: Write the PostgreSQL DELETE query here.
  //
  // This query should:
  // 1. DELETE FROM users WHERE id = $1
  //    (CASCADE will handle related customer/worker records
  //    if foreign keys are set up with ON DELETE CASCADE)
  // 2. Or implement soft-delete by adding an is_active column.
  // 3. RETURNING id to confirm deletion.
  //
  // IMPORTANT: Use parameterized values via pg.

  const result = await pool.query(
    `/* YOUR SQL DELETE QUERY HERE */`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('User');
  }

  return { deleted: true };
}
