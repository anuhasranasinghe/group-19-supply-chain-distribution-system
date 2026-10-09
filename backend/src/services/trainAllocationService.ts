// ============================================================
// Train Allocation Service
// ============================================================
// Handles allocating order items to train trips, including
// the overflow/split logic when an item doesn't fit on a
// single trip.
// ============================================================

import { pool } from '../database/connection.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';

export async function getAllocations(page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT 
       ota.id,
       ota.order_item_id,
       ota.train_trip_id,
       ota.quantity_allocated,
       (ota.quantity_allocated * p.unit_space_consumption)::numeric AS allocated_space,
       oi.order_id,
       oi.product_id,
       p.name AS product_name,
       p.unit_space_consumption,
       tt.from_city,
       tt.to_city,
       tt.trip_date,
       tt.departure_time,
       tt.arrival_time,
       o.customer_id,
       o.status AS order_status,
       o.requested_delivery_date
     FROM order_train_allocations ota
     JOIN order_items oi ON ota.order_item_id = oi.id
     JOIN products p ON oi.product_id = p.id
     JOIN train_trips tt ON ota.train_trip_id = tt.id
     JOIN orders o ON oi.order_id = o.id
     ORDER BY tt.trip_date ASC, tt.departure_time ASC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const countResult = await pool.query(`SELECT COUNT(*) AS count FROM order_train_allocations`);
  return { allocations: result.rows, total: parseInt(countResult.rows[0]?.count || '0', 10), page, limit };
}

// Allocate an order item to a train trip.
// If the item doesn't fit, the stored procedure will handle
// splitting across trips. At the application level, we call
// the database function.
export async function createAllocation(data: {
  order_item_id: string;
  train_trip_id: string;
  quantity_allocated?: number;
}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let allocation;
    if (data.quantity_allocated !== undefined && data.quantity_allocated !== null) {
      const result = await client.query(
        `INSERT INTO order_train_allocations (order_item_id, train_trip_id, quantity_allocated)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [data.order_item_id, data.train_trip_id, data.quantity_allocated]
      );
      allocation = result.rows[0];
    } else {
      await client.query(
        `SELECT assign_order_to_train($1::uuid, $2::uuid)`,
        [data.order_item_id, data.train_trip_id]
      );
      const result = await client.query(
        `SELECT * FROM order_train_allocations
         WHERE order_item_id = $1 AND train_trip_id = $2
         ORDER BY id DESC LIMIT 1`,
        [data.order_item_id, data.train_trip_id]
      );
      allocation = result.rows[0];
    }

    await client.query('COMMIT');
    return allocation;
  } catch (error) {
    await client.query('ROLLBACK');
    if (error instanceof Error && error.message.includes('capacity')) {
      throw new ConflictError(error.message);
    }
    throw error;
  } finally {
    client.release();
  }
}
