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

  // TODO: Write the PostgreSQL query here.
  //
  // This query should:
  // 1. Select from "order_train_allocations".
  // 2. JOIN with "order_items" to get order info.
  // 3. JOIN with "products" to get product name.
  // 4. JOIN with "train_trips" to get trip info.
  // 5. JOIN with "orders" to get customer and status info.
  // 6. Order by train_trips.trip_date ASC.
  // 7. Apply pagination.
  //
  // IMPORTANT: Use parameterized values via pg.

  const result = await pool.query(`/* YOUR SQL QUERY HERE */`, [limit, offset]);
  const countResult = await pool.query(`/* YOUR SQL COUNT QUERY HERE */`);
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
  // TODO: Write the PostgreSQL query here.
  //
  // Option A (Recommended): Call the stored procedure:
  //   SELECT assign_order_to_train($1, $2)
  //   This handles capacity checking and overflow automatically.
  //
  // Option B (If procedure not yet implemented): Direct INSERT:
  //   1. First check remaining capacity on the train trip:
  //      SELECT tt.max_capacity - COALESCE(SUM(ota.quantity_allocated *
  //        p.unit_space_consumption), 0) AS remaining_capacity
  //      FROM train_trips tt
  //      LEFT JOIN order_train_allocations ota ON ota.train_trip_id = tt.id
  //      LEFT JOIN order_items oi ON ota.order_item_id = oi.id
  //      LEFT JOIN products p ON oi.product_id = p.id
  //      WHERE tt.id = $1
  //      GROUP BY tt.max_capacity
  //
  //   2. Calculate required space for the order item:
  //      SELECT oi.quantity, p.unit_space_consumption
  //      FROM order_items oi
  //      JOIN products p ON oi.product_id = p.id
  //      WHERE oi.id = $1
  //
  //   3. If fits: INSERT INTO order_train_allocations
  //   4. If doesn't fit: RAISE error or find next trip
  //
  // The BEFORE INSERT trigger on order_train_allocations will
  // also validate the capacity (defense in depth).
  //
  // IMPORTANT: This should run in a TRANSACTION.
  // IMPORTANT: Use parameterized values via pg.

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `/* YOUR SQL QUERY/PROCEDURE CALL HERE */`,
      [data.order_item_id, data.train_trip_id, data.quantity_allocated]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
