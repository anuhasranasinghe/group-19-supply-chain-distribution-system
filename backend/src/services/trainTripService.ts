// ============================================================
// Train Trip Service — Train Schedule Management
// ============================================================
import { pool } from '../database/connection.js';
import { NotFoundError } from '../utils/errors.js';

export async function getAllTrainTrips(page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;

  // TODO: Write the PostgreSQL query here.
  //
  // This query should:
  // 1. Select all columns from "train_trips".
  // 2. LEFT JOIN with "stores" ON train_trips.destination_store_id = stores.id
  //    to include destination store name.
  // 3. Calculate remaining_capacity for each trip:
  //    max_capacity - COALESCE(SUM of allocated space, 0)
  //    This requires a subquery or LEFT JOIN with order_train_allocations
  //    and products to compute allocated space.
  // 4. Order by trip_date DESC, departure_time ASC.
  // 5. Apply pagination: LIMIT $1 OFFSET $2.
  //
  // IMPORTANT: Use parameterized values via pg.

  const result = await pool.query(`/* YOUR SQL QUERY HERE */`, [limit, offset]);
  const countResult = await pool.query(`/* YOUR SQL COUNT QUERY HERE */`);
  return { trainTrips: result.rows, total: parseInt(countResult.rows[0]?.count || '0', 10), page, limit };
}

export async function getTrainTripById(tripId: string) {
  // TODO: Write the PostgreSQL query.
  // 1. Select trip details with destination store info.
  // 2. Calculate remaining capacity.
  // 3. Fetch allocations for this trip (order items allocated).
  //
  // IMPORTANT: Use parameterized values via pg.

  const result = await pool.query(`/* YOUR SQL QUERY HERE */`, [tripId]);
  if (result.rows.length === 0) throw new NotFoundError('Train trip');

  // Fetch allocations for this trip
  // TODO: SELECT from order_train_allocations WHERE train_trip_id = $1
  // JOIN order_items and products for details.
  const allocResult = await pool.query(`/* YOUR SQL QUERY HERE — allocations */`, [tripId]);

  return { ...result.rows[0], allocations: allocResult.rows };
}

export async function createTrainTrip(data: {
  to_city: string; destination_store_id?: string; trip_date: string;
  departure_time: string; arrival_time: string; max_capacity: number;
}) {
  // TODO: Write the PostgreSQL INSERT query.
  //
  // INSERT INTO train_trips (from_city, to_city, destination_store_id,
  //   trip_date, departure_time, arrival_time, max_capacity)
  // VALUES ('Kandy', $1, $2, $3, $4, $5, $6) RETURNING *
  //
  // from_city is always 'Kandy' (SRS §2.7).
  // IMPORTANT: Use parameterized values via pg.

  const result = await pool.query(`/* YOUR SQL INSERT QUERY HERE */`, [
    data.to_city, data.destination_store_id || null, data.trip_date,
    data.departure_time, data.arrival_time, data.max_capacity
  ]);
  return result.rows[0];
}

export async function updateTrainTrip(tripId: string, data: Record<string, unknown>) {
  // TODO: Write the PostgreSQL UPDATE query.
  // IMPORTANT: Use parameterized values via pg.

  const result = await pool.query(`/* YOUR SQL UPDATE QUERY HERE */`, [tripId]);
  if (result.rows.length === 0) throw new NotFoundError('Train trip');
  return result.rows[0];
}
