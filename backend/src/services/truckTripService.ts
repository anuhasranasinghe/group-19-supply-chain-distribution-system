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

  // TODO: Write the PostgreSQL query here.
  //
  // This query should:
  // 1. Select from "truck_trips" with joins for related data.
  // 2. JOIN with "trucks" for vehicle_no.
  // 3. JOIN with "workers" w1 ON truck_trips.driver_id = w1.id,
  //    then JOIN "users" u1 ON w1.id = u1.id for driver name.
  // 4. Same for assistant.
  // 5. JOIN with "routes" for area_name, then "stores" for store name.
  // 6. Apply role-based filtering:
  //    - driver/assistant: WHERE driver_id = $3 OR assistant_id = $3
  //      (workers only see their own assignments)
  //    - store_manager: WHERE routes.store_id IN
  //      (SELECT id FROM stores WHERE managed_by = $3)
  //    - admin/dispatcher: no filter
  // 7. Order by start_time DESC.
  // 8. Pagination.
  //
  // IMPORTANT: Use parameterized values via pg.

  const result = await pool.query(`/* YOUR SQL QUERY HERE */`, [limit, offset, userId]);
  const countResult = await pool.query(`/* YOUR SQL COUNT QUERY HERE */`, [userId]);
  return { truckTrips: result.rows, total: parseInt(countResult.rows[0]?.count || '0', 10), page, limit };
}

export async function getTruckTripById(tripId: string) {
  // TODO: Write the PostgreSQL query.
  // Select trip with all joins (truck, driver, assistant, route, store).
  // Also fetch delivery items assigned to this trip.
  //
  // IMPORTANT: Use parameterized values via pg.

  const tripResult = await pool.query(`/* YOUR SQL QUERY HERE */`, [tripId]);
  if (tripResult.rows.length === 0) throw new NotFoundError('Truck trip');

  const deliveryResult = await pool.query(`/* YOUR SQL QUERY HERE — delivery items */`, [tripId]);

  return { ...tripResult.rows[0], deliveryItems: deliveryResult.rows };
}

// Schedule a new truck trip.
// The database triggers enforce the business rules, but we
// also validate at the service level for better error messages.
export async function createTruckTrip(data: CreateTruckTripData) {
  // TODO: Write the PostgreSQL query here.
  //
  // Option A (Recommended): Call the stored procedure:
  //   SELECT assign_truck_trip($1, $2, $3, $4, $5, $6)
  //   The procedure checks all business rules internally.
  //
  // Option B (Direct INSERT with trigger safety net):
  //   INSERT INTO truck_trips (truck_id, driver_id, assistant_id,
  //     route_id, start_time, end_time, status)
  //   VALUES ($1, $2, $3, $4, $5, $6, 'Scheduled')
  //   RETURNING *
  //
  //   The BEFORE INSERT triggers will automatically check:
  //   - Overlapping time windows (truck/driver/assistant)
  //   - Weekly working-hour limits (40h driver, 60h assistant)
  //   - Consecutive assignment limits
  //   If any check fails, PostgreSQL raises an exception that
  //   our error handler will catch and return as a 409 Conflict.
  //
  // IMPORTANT: Use parameterized values via pg.
  // IMPORTANT: This should run in a TRANSACTION.

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `/* YOUR SQL INSERT/PROCEDURE CALL HERE */`,
      [data.truck_id, data.driver_id, data.assistant_id,
       data.route_id, data.start_time, data.end_time || null]
    );

    await client.query('COMMIT');
    return result.rows[0];
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
  // TODO: Write the PostgreSQL UPDATE query.
  //
  // UPDATE truck_trips SET status = $2,
  //   end_time = CASE WHEN $3 IS NOT NULL THEN $3::timestamp ELSE end_time END,
  //   updated_at = CURRENT_TIMESTAMP
  // WHERE id = $1 RETURNING *
  //
  // If status = 'Completed' and end_time not provided, set end_time = NOW().
  //
  // IMPORTANT: Use parameterized values via pg.

  const result = await pool.query(
    `/* YOUR SQL UPDATE QUERY HERE */`,
    [tripId, status, endTime || null]
  );

  if (result.rows.length === 0) throw new NotFoundError('Truck trip');
  return result.rows[0];
}
