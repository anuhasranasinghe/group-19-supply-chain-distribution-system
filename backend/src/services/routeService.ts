// ============================================================
// Route Service — Delivery Route Management
// ============================================================
import { pool } from '../database/connection.js';
import { NotFoundError } from '../utils/errors.js';

export async function getAllRoutes(page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;

  const result = await pool.query(`SELECT
       r.id,
       r.store_id,
       r.max_delivery_time::text AS max_delivery_time,
       r.area_name,
       r.created_at,
       r.updated_at,
       s.name AS store_name,
       s.city AS store_city
     FROM routes AS r
     JOIN stores AS s
       ON s.id = r.store_id
     ORDER BY r.area_name ASC, r.id ASC
     LIMIT $1 OFFSET $2`, [limit, offset]);
  const countResult = await pool.query(`SELECT COUNT(*) AS count
     FROM routes`);
  return { routes: result.rows, total: parseInt(countResult.rows[0]?.count || '0', 10), page, limit };
}

export async function getRouteById(routeId: string) {

  const result = await pool.query(`SELECT
       r.id,
       r.store_id,
       r.max_delivery_time::text AS max_delivery_time,
       r.area_name,
       r.created_at,
       r.updated_at,
       s.name AS store_name,
       s.city AS store_city
     FROM routes AS r
     JOIN stores AS s
       ON s.id = r.store_id
     WHERE r.id = $1`, [routeId]);
  if (result.rows.length === 0) throw new NotFoundError('Route');
  return result.rows[0];
}

export async function createRoute(data: { store_id: string; max_delivery_time?: string; area_name: string }) {


  const result = await pool.query(`INSERT INTO routes (
       store_id,
       max_delivery_time,
       area_name
     )
     VALUES ($1, $2::interval, $3)
     RETURNING
       id,
       store_id,
       max_delivery_time::text AS max_delivery_time,
       area_name,
       created_at,
       updated_at`, [
    data.store_id, data.max_delivery_time || null, data.area_name
  ]);
  return result.rows[0];
}

export async function updateRoute(routeId: string, data: { store_id?: string; max_delivery_time?: string; area_name?: string }) {


  const result = await pool.query(`UPDATE routes
     SET store_id = COALESCE($2::uuid, store_id),
         max_delivery_time = COALESCE(
           $3::interval,
           max_delivery_time
         ),
         area_name = COALESCE($4, area_name),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING
       id,
       store_id,
       max_delivery_time::text AS max_delivery_time,
       area_name,
       created_at,
       updated_at`, [
    routeId,
    data.store_id ?? null,
    data.max_delivery_time ?? null,
    data.area_name ?? null
  ]);
  if (result.rows.length === 0) throw new NotFoundError('Route');
  return result.rows[0];
}
