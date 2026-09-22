// ============================================================
// Route Service — Delivery Route Management
// ============================================================
import { pool } from '../database/connection.js';
import { NotFoundError } from '../utils/errors.js';

export async function getAllRoutes(page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;

  // TODO: Write the PostgreSQL query here.
  //
  // This query should:
  // 1. Select all columns from "routes".
  // 2. JOIN with "stores" ON routes.store_id = stores.id
  //    to include the store name and city.
  // 3. Order by routes.area_name ASC.
  // 4. Apply pagination: LIMIT $1 OFFSET $2.
  // 5. Also COUNT(*) for total.
  //
  // IMPORTANT: Use parameterized values via pg.

  const result = await pool.query(`/* YOUR SQL QUERY HERE */`, [limit, offset]);
  const countResult = await pool.query(`/* YOUR SQL COUNT QUERY HERE */`);
  return { routes: result.rows, total: parseInt(countResult.rows[0]?.count || '0', 10), page, limit };
}

export async function getRouteById(routeId: string) {
  // TODO: Write the PostgreSQL query.
  // 1. Select route with store details WHERE routes.id = $1.
  // IMPORTANT: Use parameterized values via pg.

  const result = await pool.query(`/* YOUR SQL QUERY HERE */`, [routeId]);
  if (result.rows.length === 0) throw new NotFoundError('Route');
  return result.rows[0];
}

export async function createRoute(data: { store_id: string; max_delivery_time?: string; area_name: string }) {
  // TODO: Write the PostgreSQL INSERT query.
  //
  // INSERT INTO routes (store_id, max_delivery_time, area_name)
  // VALUES ($1, $2::interval, $3) RETURNING *
  //
  // Note: max_delivery_time is a PostgreSQL INTERVAL. Cast with ::interval.
  // IMPORTANT: Use parameterized values via pg.

  const result = await pool.query(`/* YOUR SQL INSERT QUERY HERE */`, [
    data.store_id, data.max_delivery_time || null, data.area_name
  ]);
  return result.rows[0];
}

export async function updateRoute(routeId: string, data: { store_id?: string; max_delivery_time?: string; area_name?: string }) {
  // TODO: Write the PostgreSQL UPDATE query.
  // IMPORTANT: Use parameterized values via pg.

  const result = await pool.query(`/* YOUR SQL UPDATE QUERY HERE */`, [
    routeId, data.store_id, data.max_delivery_time, data.area_name
  ]);
  if (result.rows.length === 0) throw new NotFoundError('Route');
  return result.rows[0];
}
