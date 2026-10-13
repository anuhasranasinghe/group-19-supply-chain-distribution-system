import { pool } from '../database/connection.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import type { DeliveryStatus, SystemRole } from '../types/index.js';
import { createNotification } from './notificationService.js';

const VALID_TRANSITIONS: Record<DeliveryStatus, readonly DeliveryStatus[]> = {
  Pending: ['Scheduled'],
  Scheduled: ['Delivered', 'Failed'],
  Failed: ['Returned'],
  Delivered: [],
  Returned: [],
};

export async function getDeliveries(
  userId: string,
  userRole: SystemRole,
  page: number = 1,
  limit: number = 20
) {
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `
      SELECT
        di.*,
        oi.order_id,
        oi.product_id,
        p.name AS product_name,
        o.customer_id,
        o.delivery_address,
        o.requested_delivery_date,
        o.status AS order_status,
        customer_user.name AS customer_name,
        tt.driver_id,
        tt.assistant_id,
        tt.start_time,
        tt.end_time,
        tt.status AS truck_trip_status,
        t.vehicle_no,
        r.id AS route_id,
        r.area_name AS route_area,
        s.id AS store_id,
        s.name AS store_name
      FROM delivery_items AS di
      JOIN order_items AS oi
        ON oi.id = di.order_item_id
      JOIN products AS p
        ON p.id = oi.product_id
      JOIN orders AS o
        ON o.id = oi.order_id
      JOIN users AS customer_user
        ON customer_user.id = o.customer_id
      JOIN truck_trips AS tt
        ON tt.id = di.truck_trip_id
      JOIN trucks AS t
        ON t.id = tt.truck_id
      JOIN routes AS r
        ON r.id = tt.route_id
      JOIN stores AS s
        ON s.id = r.store_id
      WHERE
        $4::text IN ('admin', 'dispatcher')
        OR ($4::text = 'customer' AND o.customer_id = $3)
        OR ($4::text = 'driver' AND tt.driver_id = $3)
        OR ($4::text = 'assistant' AND tt.assistant_id = $3)
        OR ($4::text = 'store_manager' AND s.managed_by = $3)
      ORDER BY di.delivered_at DESC NULLS LAST, di.id
      LIMIT $1 OFFSET $2
    `,
    [limit, offset, userId, userRole]
  );

  const countResult = await pool.query(
    `
      SELECT COUNT(*) AS count
      FROM delivery_items AS di
      JOIN order_items AS oi
        ON oi.id = di.order_item_id
      JOIN orders AS o
        ON o.id = oi.order_id
      JOIN truck_trips AS tt
        ON tt.id = di.truck_trip_id
      JOIN routes AS r
        ON r.id = tt.route_id
      JOIN stores AS s
        ON s.id = r.store_id
      WHERE
        $2::text IN ('admin', 'dispatcher')
        OR ($2::text = 'customer' AND o.customer_id = $1)
        OR ($2::text = 'driver' AND tt.driver_id = $1)
        OR ($2::text = 'assistant' AND tt.assistant_id = $1)
        OR ($2::text = 'store_manager' AND s.managed_by = $1)
    `,
    [userId, userRole]
  );

  return {
    deliveries: result.rows,
    total: Number.parseInt(countResult.rows[0]?.count ?? '0', 10),
    page,
    limit,
  };
}

export async function updateDeliveryStatus(
  deliveryItemId: string,
  newStatus: DeliveryStatus,
  changedBy: string
) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const currentResult = await client.query<{
      delivery_status: DeliveryStatus;
    }>(
      `
        SELECT di.delivery_status
        FROM delivery_items AS di
        JOIN truck_trips AS tt
          ON tt.id = di.truck_trip_id
        WHERE di.id = $1
          AND (tt.driver_id = $2 OR tt.assistant_id = $2)
        FOR UPDATE OF di
      `,
      [deliveryItemId, changedBy]
    );

    if (currentResult.rows.length === 0) {
      throw new NotFoundError('Delivery item');
    }

    const currentStatus = currentResult.rows[0].delivery_status;
    const allowedTransitions = VALID_TRANSITIONS[currentStatus];

    if (!allowedTransitions.includes(newStatus)) {
      throw new ValidationError(
        `Invalid status transition: "${currentStatus}" → "${newStatus}". ` +
          `Allowed transitions from "${currentStatus}": ` +
          `${allowedTransitions.join(', ') || 'none (terminal state)'}.`
      );
    }

    await client.query(
      'SELECT update_delivery_status($1, $2, $3)',
      [deliveryItemId, newStatus, changedBy]
    );

    const updatedResult = await client.query(
      `
        SELECT *
        FROM delivery_items
        WHERE id = $1
      `,
      [deliveryItemId]
    );

    await client.query('COMMIT');

    try {
      const custRes = await pool.query(
        `SELECT o.customer_id, o.id AS order_id, p.name AS product_name 
         FROM delivery_items di
         JOIN order_items oi ON oi.id = di.order_item_id
         JOIN orders o ON o.id = oi.order_id
         JOIN products p ON p.id = oi.product_id
         WHERE di.id = $1`,
        [deliveryItemId]
      );
      if (custRes.rows.length > 0) {
        const item = custRes.rows[0];
        await createNotification(
          item.customer_id,
          'Delivery Status Updated',
          `Your item "${item.product_name}" from order #${item.order_id.slice(0, 8)} is now marked as "${newStatus}".`,
          'delivery_update'
        );
      }
    } catch {
      // Non-blocking notification
    }

    return updatedResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}