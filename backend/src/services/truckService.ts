// ============================================================
// Truck Service — Truck Fleet Management
// ============================================================
import { pool } from '../database/connection.js';
import { NotFoundError } from '../utils/errors.js';

export async function getAllTrucks(page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;

  // TODO: Write the PostgreSQL query here.
  //
  // This query should:
  // 1. Select all columns from "trucks".
  // 2. Order by vehicle_no ASC.
  // 3. Apply pagination: LIMIT $1 OFFSET $2.
  // 4. Also COUNT(*) for total.
  //
  // IMPORTANT: Use parameterized values via pg.

  const result = await pool.query(`/* YOUR SQL QUERY HERE */`, [limit, offset]);
  const countResult = await pool.query(`/* YOUR SQL COUNT QUERY HERE */`);
  return { trucks: result.rows, total: parseInt(countResult.rows[0]?.count || '0', 10), page, limit };
}

export async function getTruckById(truckId: string) {
  // TODO: Write the PostgreSQL query.
  // SELECT * FROM trucks WHERE id = $1
  // IMPORTANT: Use parameterized values via pg.

  const result = await pool.query(`/* YOUR SQL QUERY HERE */`, [truckId]);
  if (result.rows.length === 0) throw new NotFoundError('Truck');
  return result.rows[0];
}

export async function createTruck(data: { vehicle_no: string; capacity: number }) {
  // TODO: Write the PostgreSQL INSERT query.
  //
  // INSERT INTO trucks (vehicle_no, capacity)
  // VALUES ($1, $2) RETURNING *
  //
  // Note: vehicle_no has a UNIQUE constraint. If a duplicate is
  // inserted, PostgreSQL will raise a unique violation error.
  //
  // IMPORTANT: Use parameterized values via pg.

  const result = await pool.query(`/* YOUR SQL INSERT QUERY HERE */`, [data.vehicle_no, data.capacity]);
  return result.rows[0];
}

export async function updateTruck(truckId: string, data: { vehicle_no?: string; capacity?: number }) {
  // TODO: Write the PostgreSQL UPDATE query.
  // IMPORTANT: Use parameterized values via pg.

  const result = await pool.query(`/* YOUR SQL UPDATE QUERY HERE */`, [truckId, data.vehicle_no, data.capacity]);
  if (result.rows.length === 0) throw new NotFoundError('Truck');
  return result.rows[0];
}
