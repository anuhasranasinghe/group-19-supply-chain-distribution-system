// ============================================================
// Truck Service — Truck Fleet Management
// ============================================================
import { pool } from '../database/connection.js';
import { NotFoundError } from '../utils/errors.js';

export async function getAllTrucks(page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT id, vehicle_no, capacity, created_at, updated_at
     FROM trucks
     ORDER BY vehicle_no ASC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const countResult = await pool.query(`SELECT COUNT(*) AS count FROM trucks`);
  return { trucks: result.rows, total: parseInt(countResult.rows[0]?.count || '0', 10), page, limit };
}

export async function getTruckById(truckId: string) {
  const result = await pool.query(
    `SELECT id, vehicle_no, capacity, created_at, updated_at
     FROM trucks
     WHERE id = $1`,
    [truckId]
  );
  if (result.rows.length === 0) throw new NotFoundError('Truck');
  return result.rows[0];
}

export async function createTruck(data: { vehicle_no: string; capacity: number }) {
  const result = await pool.query(
    `INSERT INTO trucks (vehicle_no, capacity)
     VALUES ($1, $2)
     RETURNING *`,
    [data.vehicle_no, data.capacity]
  );
  return result.rows[0];
}

export async function updateTruck(truckId: string, data: { vehicle_no?: string; capacity?: number }) {
  const result = await pool.query(
    `UPDATE trucks
     SET vehicle_no = COALESCE($2, vehicle_no),
         capacity = COALESCE($3, capacity),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [truckId, data.vehicle_no ?? null, data.capacity ?? null]
  );
  if (result.rows.length === 0) throw new NotFoundError('Truck');
  return result.rows[0];
}
