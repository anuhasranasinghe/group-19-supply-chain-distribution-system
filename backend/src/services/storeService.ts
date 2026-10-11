// ============================================================
// Store Service — Store Management Business Logic
// ============================================================
import { pool } from '../database/connection.js';
import { NotFoundError } from '../utils/errors.js';

export async function getAllStores(page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;


  const result = await pool.query( `SELECT
       s.*,
       u.name AS manager_name
     FROM stores AS s
     LEFT JOIN workers AS w
       ON w.id = s.managed_by
     LEFT JOIN users AS u
       ON u.id = w.id
     ORDER BY s.name ASC, s.id ASC
     LIMIT $1 OFFSET $2`, [limit, offset]);
  const countResult = await pool.query(`SELECT COUNT(*) AS count
     FROM stores`);

  return { stores: result.rows, total: parseInt(countResult.rows[0]?.count || '0', 10), page, limit };
}

export async function getStoreById(storeId: string) {

  const result = await pool.query(`SELECT
       s.*,
       u.name AS manager_name,
       (
         SELECT COUNT(*)::integer
         FROM routes AS r
         WHERE r.store_id = s.id
       ) AS route_count
     FROM stores AS s
     LEFT JOIN workers AS w
       ON w.id = s.managed_by
     LEFT JOIN users AS u
       ON u.id = w.id
     WHERE s.id = $1`, [storeId]);
  if (result.rows.length === 0) throw new NotFoundError('Store');
  return result.rows[0];
}

export async function createStore(data: { name: string; city: string; location?: string; managed_by?: string }) {

  const result = await pool.query(`INSERT INTO stores (
       name,
       city,
       location,
       managed_by
     )
     VALUES ($1, $2, $3, $4)
     RETURNING *`, [
    data.name, data.city, data.location || null, data.managed_by || null
  ]);
  return result.rows[0];
}

export async function updateStore(storeId: string, data: { name?: string; city?: string; location?: string; managed_by?: string | null }) {


  const result = await pool.query(`UPDATE stores AS s
     SET name = COALESCE($2::varchar, s.name),
         city = COALESCE($3::varchar, s.city),
         location = COALESCE($4::text, s.location),
         managed_by = CASE
           WHEN $5::boolean THEN $6::uuid
           ELSE s.managed_by
         END,
         updated_at = CURRENT_TIMESTAMP
     WHERE s.id = $1::uuid
     RETURNING s.*`, [
    storeId, data.name, data.city, data.location, data.managed_by
  ]);
  if (result.rows.length === 0) throw new NotFoundError('Store');
  return result.rows[0];
}
