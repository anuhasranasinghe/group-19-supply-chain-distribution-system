// ============================================================
// Order Service — Order Management Business Logic
// ============================================================
// This is one of the most complex services because it handles
// the core business workflow: customers placing orders, and
// the validation rules around it.
//
// Key business rules enforced here:
// - 7-day advance order requirement
// - Route coverage validation
// - Order must have at least one item
// ============================================================

import { pool } from '../database/connection.js';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors.js';
import { ORDER_ADVANCE_DAYS } from '../config/constants.js';

interface CreateOrderData {
  customer_id: string;
  delivery_address: string;
  requested_delivery_date: string;
  route_id: string;
  items: Array<{ product_id: string; quantity: number }>;
}

// List orders with role-based filtering.
// Customers see only their own orders; admins/dispatchers see all.
export async function getOrders(userId: string, userRole: string, page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;

  // TODO: Write the PostgreSQL query here.
  //
  // This query should:
  // 1. Select from "orders" with relevant joins.
  // 2. JOIN with "customers" and "users" to get customer name.
  // 3. JOIN with "routes" to get route/area info.
  // 4. Apply role-based filtering:
  //    - If userRole = 'customer': WHERE orders.customer_id = $3
  //      (customers can ONLY see their own orders — this is
  //      data-level authorization, critical for security)
  //    - If userRole = 'store_manager': WHERE routes.store_id =
  //      (SELECT id FROM stores WHERE managed_by = $3)
  //      (store managers see orders for their store's routes)
  //    - If userRole in ('admin', 'dispatcher'): no filter (see all)
  // 5. Order by orders.order_date DESC.
  // 6. Apply pagination: LIMIT $1 OFFSET $2.
  //
  // IMPORTANT: Use parameterized values via pg.
  // IMPORTANT: The role-based WHERE clause MUST be enforced at
  // the database level. Hiding orders in the UI is not sufficient.

  const result = await pool.query(`/* YOUR SQL QUERY HERE */`, [limit, offset, userId]);
  const countResult = await pool.query(`/* YOUR SQL COUNT QUERY HERE */`, [userId]);

  return {
    orders: result.rows,
    total: parseInt(countResult.rows[0]?.count || '0', 10),
    page,
    limit,
  };
}

// Get a single order with its items and delivery details.
export async function getOrderById(orderId: string, userId: string, userRole: string) {
  // TODO: Write the PostgreSQL query here.
  //
  // This query should:
  // 1. Select the order from "orders" WHERE id = $1.
  // 2. Apply data-level authorization:
  //    - If customer: also check AND customer_id = $2
  // 3. Join with customer info, route info.
  //
  // Then separately query order items:
  // 4. Select from "order_items" WHERE order_id = $1.
  // 5. JOIN with "products" to get product name and price.
  //
  // Optionally query delivery items:
  // 6. Select from "delivery_items" WHERE order_item_id IN
  //    (SELECT id FROM order_items WHERE order_id = $1).
  //
  // IMPORTANT: Use parameterized values via pg.

  const orderResult = await pool.query(`/* YOUR SQL QUERY HERE — order */`, [orderId, userId]);

  if (orderResult.rows.length === 0) {
    throw new NotFoundError('Order');
  }

  const itemsResult = await pool.query(`/* YOUR SQL QUERY HERE — items */`, [orderId]);

  return {
    ...orderResult.rows[0],
    items: itemsResult.rows,
  };
}

// Place a new order (customer only).
// This implements the order placement workflow from SRS §4.1.
export async function createOrder(data: CreateOrderData) {
  // Business Rule 1: 7-day advance requirement (SRS §6.4)
  const requestedDate = new Date(data.requested_delivery_date);
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + ORDER_ADVANCE_DAYS);

  if (requestedDate < minDate) {
    throw new ValidationError(
      `Orders must be placed at least ${ORDER_ADVANCE_DAYS} days before the requested delivery date. ` +
      `Earliest allowed date: ${minDate.toISOString().split('T')[0]}`
    );
  }

  // Use a transaction because we need to insert the order
  // AND all its items atomically.
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Business Rule 2: Validate route exists (SRS §6.4)
    // TODO: Write the PostgreSQL query to verify route_id exists.
    //
    // SELECT id FROM routes WHERE id = $1
    //
    // If no row returned, the delivery address is not covered
    // by any existing route. Reject the order.
    //
    // IMPORTANT: Use parameterized values via pg.

    const routeCheck = await client.query(`/* YOUR SQL QUERY HERE — check route */`, [data.route_id]);

    if (routeCheck.rows.length === 0) {
      throw new ValidationError('Delivery address is not covered by any existing route.');
    }

    // Insert the order
    // TODO: Write the PostgreSQL INSERT for the order.
    //
    // INSERT INTO orders (customer_id, order_date, requested_delivery_date,
    //   delivery_address, route_id, status)
    // VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4, 'Pending')
    // RETURNING *
    //
    // IMPORTANT: Use parameterized values via pg.

    const orderResult = await client.query(
      `/* YOUR SQL INSERT QUERY HERE — order */`,
      [data.customer_id, data.requested_delivery_date, data.delivery_address, data.route_id]
    );

    const order = orderResult.rows[0];

    // Insert each order item
    for (const item of data.items) {
      // TODO: Write the PostgreSQL INSERT for each order item.
      //
      // INSERT INTO order_items (order_id, product_id, quantity)
      // VALUES ($1, $2, $3)
      //
      // Validate that product_id exists:
      // SELECT id FROM products WHERE id = $1
      //
      // IMPORTANT: Use parameterized values via pg.

      await client.query(
        `/* YOUR SQL INSERT QUERY HERE — order item */`,
        [order.id, item.product_id, item.quantity]
      );
    }

    await client.query('COMMIT');
    return order;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Update order status (dispatcher/store manager).
export async function updateOrderStatus(orderId: string, status: string, changedBy: string) {
  // TODO: Write the PostgreSQL UPDATE query.
  //
  // UPDATE orders SET status = $2, updated_at = CURRENT_TIMESTAMP
  // WHERE id = $1 RETURNING *
  //
  // The AFTER UPDATE trigger on orders will automatically
  // insert a row into order_status_history.
  //
  // IMPORTANT: Use parameterized values via pg.

  const result = await pool.query(`/* YOUR SQL UPDATE QUERY HERE */`, [orderId, status]);

  if (result.rows.length === 0) {
    throw new NotFoundError('Order');
  }

  return result.rows[0];
}
