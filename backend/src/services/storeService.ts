// ============================================================
// Store Service — Store Management Business Logic
// ============================================================
import { pool } from '../database/connection.js';
import { NotFoundError } from '../utils/errors.js';

export async function getAllStores(page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;

  // TODO: Write the PostgreSQL query here.
  //
  // This query should:
  // 1. Select all columns from "stores".
  // 2. LEFT JOIN with "workers" ON stores.managed_by = workers.id
  //    to get the manager's name (through users table).
  // 3. LEFT JOIN with "users" ON workers.id = users.id
  //    to get the manager's display name.
  // 4. Order by stores.name ASC.
  // 5. Apply pagination: LIMIT $1 OFFSET $2.
  // 6. Also COUNT(*) for total.
  //
  // IMPORTANT: Use parameterized values via pg.

  const result = await pool.query(`/* YOUR SQL QUERY HERE */`, [limit, offset]);
  const countResult = await pool.query(`/* YOUR SQL COUNT QUERY HERE */`);

  return { stores: result.rows, total: parseInt(countResult.rows[0]?.count || '0', 10), page, limit };
}

export async function getStoreById(storeId: string) {
  // TODO: Write the PostgreSQL query here.
  //
  // 1. Select store details from "stores" WHERE id = $1.
  // 2. LEFT JOIN workers and users for manager name.
  // 3. Optionally include route count for this store.
  //
  // IMPORTANT: Use parameterized values via pg.

  const result = await pool.query(`/* YOUR SQL QUERY HERE */`, [storeId]);
  if (result.rows.length === 0) throw new NotFoundError('Store');
  return result.rows[0];
}

export async function createStore(data: { name: string; city: string; location?: string; managed_by?: string }) {
  // TODO: Write the PostgreSQL INSERT query.
  //
  // INSERT INTO stores (name, city, location, managed_by)
  // VALUES ($1, $2, $3, $4)
  // RETURNING *
  //
  // IMPORTANT: Use parameterized values via pg.

  const result = await pool.query(`/* YOUR SQL INSERT QUERY HERE */`, [
    data.name, data.city, data.location || null, data.managed_by || null
  ]);
  return result.rows[0];
}

export async function updateStore(storeId: string, data: { name?: string; city?: string; location?: string; managed_by?: string | null }) {
  // TODO: Write the PostgreSQL UPDATE query.
  //
  // UPDATE stores SET name = COALESCE($2, name), ...
  // WHERE id = $1 RETURNING *
  //
  // IMPORTANT: Use parameterized values via pg.

  const result = await pool.query(`/* YOUR SQL UPDATE QUERY HERE */`, [
    storeId, data.name, data.city, data.location, data.managed_by
  ]);
  if (result.rows.length === 0) throw new NotFoundError('Store');
  return result.rows[0];
}
