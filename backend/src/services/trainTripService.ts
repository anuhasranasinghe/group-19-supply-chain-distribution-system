// ============================================================
// Train Trip Service — Train Schedule Management
// ============================================================
import { pool } from '../database/connection.js';
import { NotFoundError } from '../utils/errors.js';

export async function getAllTrainTrips(page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT 
       tt.id,
       tt.from_city,
       tt.to_city,
       tt.destination_store_id,
       s.name AS destination_store_name,
       tt.trip_date,
       tt.departure_time,
       tt.arrival_time,
       tt.max_capacity,
       (tt.max_capacity - COALESCE(alloc.allocated_space, 0))::numeric AS remaining_capacity,
       tt.created_at,
       tt.updated_at
     FROM train_trips tt
     LEFT JOIN stores s ON tt.destination_store_id = s.id
     LEFT JOIN (
       SELECT 
         ota.train_trip_id,
         SUM(ota.quantity_allocated * p.unit_space_consumption) AS allocated_space
       FROM order_train_allocations ota
       JOIN order_items oi ON ota.order_item_id = oi.id
       JOIN products p ON oi.product_id = p.id
       GROUP BY ota.train_trip_id
     ) alloc ON tt.id = alloc.train_trip_id
     ORDER BY tt.trip_date DESC, tt.departure_time ASC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const countResult = await pool.query(`SELECT COUNT(*) AS count FROM train_trips`);
  return { trainTrips: result.rows, total: parseInt(countResult.rows[0]?.count || '0', 10), page, limit };
}

export async function getTrainTripById(tripId: string) {
  const result = await pool.query(
    `SELECT 
       tt.id,
       tt.from_city,
       tt.to_city,
       tt.destination_store_id,
       s.name AS destination_store_name,
       tt.trip_date,
       tt.departure_time,
       tt.arrival_time,
       tt.max_capacity,
       (tt.max_capacity - COALESCE(alloc.allocated_space, 0))::numeric AS remaining_capacity,
       tt.created_at,
       tt.updated_at
     FROM train_trips tt
     LEFT JOIN stores s ON tt.destination_store_id = s.id
     LEFT JOIN (
       SELECT 
         ota.train_trip_id,
         SUM(ota.quantity_allocated * p.unit_space_consumption) AS allocated_space
       FROM order_train_allocations ota
       JOIN order_items oi ON ota.order_item_id = oi.id
       JOIN products p ON oi.product_id = p.id
       WHERE ota.train_trip_id = $1
       GROUP BY ota.train_trip_id
     ) alloc ON tt.id = alloc.train_trip_id
     WHERE tt.id = $1`,
    [tripId]
  );
  if (result.rows.length === 0) throw new NotFoundError('Train trip');

  const allocResult = await pool.query(
    `SELECT 
       ota.id,
       ota.order_item_id,
       ota.train_trip_id,
       ota.quantity_allocated,
       oi.order_id,
       oi.product_id,
       p.name AS product_name,
       p.unit_space_consumption,
       (ota.quantity_allocated * p.unit_space_consumption)::numeric AS total_space_consumed
     FROM order_train_allocations ota
     JOIN order_items oi ON ota.order_item_id = oi.id
     JOIN products p ON oi.product_id = p.id
     WHERE ota.train_trip_id = $1`,
    [tripId]
  );

  return { ...result.rows[0], allocations: allocResult.rows };
}

export async function createTrainTrip(data: {
  to_city: string; destination_store_id?: string; trip_date: string;
  departure_time: string; arrival_time: string; max_capacity: number;
}) {
  const result = await pool.query(
    `INSERT INTO train_trips (
       from_city, to_city, destination_store_id,
       trip_date, departure_time, arrival_time, max_capacity
     )
     VALUES ('Kandy', $1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      data.to_city, data.destination_store_id || null, data.trip_date,
      data.departure_time, data.arrival_time, data.max_capacity
    ]
  );
  return result.rows[0];
}

export async function updateTrainTrip(tripId: string, data: Record<string, unknown>) {
  const result = await pool.query(
    `UPDATE train_trips
     SET to_city = COALESCE($2, to_city),
         destination_store_id = COALESCE($3, destination_store_id),
         trip_date = COALESCE($4, trip_date),
         departure_time = COALESCE($5, departure_time),
         arrival_time = COALESCE($6, arrival_time),
         max_capacity = COALESCE($7, max_capacity),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [
      tripId,
      data.to_city ?? null,
      data.destination_store_id ?? null,
      data.trip_date ?? null,
      data.departure_time ?? null,
      data.arrival_time ?? null,
      data.max_capacity ?? null,
    ]
  );
  if (result.rows.length === 0) throw new NotFoundError('Train trip');
  return result.rows[0];
}
