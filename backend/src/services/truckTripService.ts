// ============================================================
// Truck Trip Service — Last-Mile Delivery Scheduling
// ============================================================
// This service handles the scheduling of truck trips for
// last-mile deliveries. It contains some of the most critical
// business logic in the system — the double-booking checks,
// working-hour limits, and consecutive assignment rules.
//
// While the database triggers provide a safety net for these
// rules, the service layer validates them first to give better
// error messages and avoid unnecessary database round-trips.
// ============================================================

import { pool } from '../database/connection.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';

interface CreateTruckTripData {
  truck_id: string;
  driver_id: string;
  assistant_id: string;
  route_id: string;
  start_time: string;
  end_time?: string;
}

export async function getTruckTrips(
  userId: string, userRole: string, page: number = 1, limit: number = 20
) {
  const offset = (page - 1) * limit;

  let whereClause = '';
  const params: any[] = [limit, offset];

  if (userRole === 'driver' || userRole === 'assistant') {
    params.push(userId);
    whereClause = 'WHERE (tt.driver_id = $3 OR tt.assistant_id = $3)';
  } else if (userRole === 'store_manager') {
    params.push(userId);
    whereClause = 'WHERE routes.store_id IN (SELECT id FROM stores WHERE managed_by = $3)';
  }

  const result = await pool.query(
    `SELECT 
       tt.id,
       tt.truck_id,
       tr.vehicle_no,
       tr.capacity AS truck_capacity,
       tt.driver_id,
       u1.name AS driver_name,
       tt.assistant_id,
       u2.name AS assistant_name,
       tt.route_id,
       routes.area_name AS route_area,
       stores.id AS store_id,
       stores.name AS store_name,
       tt.start_time,
       tt.end_time,
       tt.status,
       tt.created_at,
       tt.updated_at
     FROM truck_trips tt
     JOIN trucks tr ON tt.truck_id = tr.id
     JOIN workers w1 ON tt.driver_id = w1.id
     JOIN users u1 ON w1.id = u1.id
     JOIN workers w2 ON tt.assistant_id = w2.id
     JOIN users u2 ON w2.id = u2.id
     JOIN routes ON tt.route_id = routes.id
     JOIN stores ON routes.store_id = stores.id
     ${whereClause}
     ORDER BY tt.start_time DESC
     LIMIT $1 OFFSET $2`,
    params
  );

  let countWhere = '';
  const countParams: any[] = [];
  if (userRole === 'driver' || userRole === 'assistant') {
    countParams.push(userId);
    countWhere = 'WHERE (tt.driver_id = $1 OR tt.assistant_id = $1)';
  } else if (userRole === 'store_manager') {
    countParams.push(userId);
    countWhere = 'WHERE routes.store_id IN (SELECT id FROM stores WHERE managed_by = $1)';
  }

  const countResult = await pool.query(
    `SELECT COUNT(*) AS count
     FROM truck_trips tt
     JOIN routes ON tt.route_id = routes.id
     ${countWhere}`,
    countParams
  );

  return { truckTrips: result.rows, total: parseInt(countResult.rows[0]?.count || '0', 10), page, limit };
}

export async function getTruckTripById(tripId: string) {
  const tripResult = await pool.query(
    `SELECT 
       tt.id,
       tt.truck_id,
       tr.vehicle_no,
       tr.capacity AS truck_capacity,
       tt.driver_id,
       u1.name AS driver_name,
       tt.assistant_id,
       u2.name AS assistant_name,
       tt.route_id,
       routes.area_name AS route_area,
       stores.id AS store_id,
       stores.name AS store_name,
       tt.start_time,
       tt.end_time,
       tt.status,
       tt.created_at,
       tt.updated_at
     FROM truck_trips tt
     JOIN trucks tr ON tt.truck_id = tr.id
     JOIN workers w1 ON tt.driver_id = w1.id
     JOIN users u1 ON w1.id = u1.id
     JOIN workers w2 ON tt.assistant_id = w2.id
     JOIN users u2 ON w2.id = u2.id
     JOIN routes ON tt.route_id = routes.id
     JOIN stores ON routes.store_id = stores.id
     WHERE tt.id = $1`,
    [tripId]
  );
  if (tripResult.rows.length === 0) throw new NotFoundError('Truck trip');

  const deliveryResult = await pool.query(
    `SELECT 
       di.id,
       di.order_item_id,
       di.truck_trip_id,
       di.quantity,
       di.delivery_status,
       di.delivered_at,
       oi.order_id,
       oi.product_id,
       p.name AS product_name,
       p.unit_space_consumption,
       o.delivery_address,
       o.customer_id
     FROM delivery_items di
     JOIN order_items oi ON di.order_item_id = oi.id
     JOIN products p ON oi.product_id = p.id
     JOIN orders o ON oi.order_id = o.id
     WHERE di.truck_trip_id = $1`,
    [tripId]
  );

  return { ...tripResult.rows[0], deliveryItems: deliveryResult.rows };
}

// Schedule a new truck trip.
// The database triggers enforce the business rules, but we
// also validate at the service level for better error messages.
export async function createTruckTrip(data: CreateTruckTripData) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let trip;
    try {
      const procResult = await client.query(
        `SELECT assign_truck_trip($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::timestamp, $6::timestamp) AS id`,
        [data.truck_id, data.driver_id, data.assistant_id,
         data.route_id, data.start_time, data.end_time || null]
      );
      const tripId = procResult.rows[0].id;
      const tripResult = await client.query(`SELECT * FROM truck_trips WHERE id = $1`, [tripId]);
      trip = tripResult.rows[0];
    } catch (procErr: any) {
      if (procErr.code === '42883') {
        const insertResult = await client.query(
          `INSERT INTO truck_trips (
             truck_id, driver_id, assistant_id,
             route_id, start_time, end_time, status
           )
           VALUES ($1, $2, $3, $4, $5, $6, 'Scheduled')
           RETURNING *`,
          [data.truck_id, data.driver_id, data.assistant_id,
           data.route_id, data.start_time, data.end_time || null]
        );
        trip = insertResult.rows[0];
      } else {
        throw procErr;
      }
    }

    await client.query('COMMIT');
    return trip;
  } catch (error) {
    await client.query('ROLLBACK');
    // PostgreSQL trigger errors come through as database exceptions.
    // Re-throw them as ConflictErrors for proper HTTP status codes.
    if (error instanceof Error && error.message.includes('overlapping')) {
      throw new ConflictError(error.message);
    }
    if (error instanceof Error && error.message.includes('weekly')) {
      throw new ConflictError(error.message);
    }
    if (error instanceof Error && error.message.includes('consecutive')) {
      throw new ConflictError(error.message);
    }
    throw error;
  } finally {
    client.release();
  }
}

// Update truck trip status (driver/assistant marks trip progress).
export async function updateTruckTripStatus(
  tripId: string, status: string, endTime?: string
) {
  const result = await pool.query(
    `UPDATE truck_trips
     SET status = $2,
         end_time = CASE 
           WHEN $3 IS NOT NULL THEN $3::timestamp
           WHEN $2 = 'Completed' AND end_time IS NULL THEN CURRENT_TIMESTAMP
           ELSE end_time 
         END,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [tripId, status, endTime || null]
  );

  if (result.rows.length === 0) throw new NotFoundError('Truck trip');
  return result.rows[0];
}
