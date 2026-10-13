// ============================================================
// Order Service — Order Management Business Logic
// ============================================================
// Handles core business workflows: customer order placement,
// validation rules, and role-based order queries.
// ============================================================

import { pool } from '../database/connection.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { ORDER_ADVANCE_DAYS } from '../config/constants.js';
import { createNotification } from './notificationService.js';

interface CreateOrderData {
  customer_id: string;
  delivery_address: string;
  requested_delivery_date: string;
  route_id: string;
  items: Array<{ product_id: string; quantity: number }>;
}

// List orders with role-based filtering (data-level authorization)
export async function getOrders(userId: string, userRole: string, page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;

  let whereClause = '';
  const params: any[] = [limit, offset];

  if (userRole === 'customer') {
    params.push(userId);
    whereClause = 'WHERE o.customer_id = $3';
  } else if (userRole === 'store_manager') {
    params.push(userId);
    whereClause = 'WHERE r.store_id IN (SELECT id FROM stores WHERE managed_by = $3)';
  }

  const query = `
    SELECT 
      o.id,
      o.customer_id,
      u.name AS customer_name,
      o.order_date,
      o.requested_delivery_date,
      o.delivery_address,
      o.route_id,
      r.area_name AS route_area,
      o.status,
      o.created_at,
      o.updated_at
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    JOIN users u ON c.id = u.id
    JOIN routes r ON o.route_id = r.id
    ${whereClause}
    ORDER BY o.order_date DESC
    LIMIT $1 OFFSET $2
  `;

  let countQuery = 'SELECT COUNT(*) AS count FROM orders o JOIN routes r ON o.route_id = r.id';
  const countParams: any[] = [];
  if (userRole === 'customer') {
    countParams.push(userId);
    countQuery += ' WHERE o.customer_id = $1';
  } else if (userRole === 'store_manager') {
    countParams.push(userId);
    countQuery += ' WHERE r.store_id IN (SELECT id FROM stores WHERE managed_by = $1)';
  }

  const result = await pool.query(query, params);
  const countResult = await pool.query(countQuery, countParams);

  return {
    orders: result.rows,
    total: parseInt(countResult.rows[0]?.count || '0', 10),
    page,
    limit,
  };
}

// Get a single order with line items
export async function getOrderById(orderId: string, userId: string, userRole: string) {
  let whereClause = 'WHERE o.id = $1';
  const params: any[] = [orderId];

  if (userRole === 'customer') {
    params.push(userId);
    whereClause += ' AND o.customer_id = $2';
  }

  const orderQuery = `
    SELECT 
      o.id,
      o.customer_id,
      u.name AS customer_name,
      c.phone_no AS customer_phone,
      o.order_date,
      o.requested_delivery_date,
      o.delivery_address,
      o.route_id,
      r.area_name AS route_area,
      o.status,
      o.created_at,
      o.updated_at
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    JOIN users u ON c.id = u.id
    JOIN routes r ON o.route_id = r.id
    ${whereClause}
  `;

  const orderResult = await pool.query(orderQuery, params);

  if (orderResult.rows.length === 0) {
    throw new NotFoundError('Order');
  }

  const itemsQuery = `
    SELECT 
      oi.id,
      oi.order_id,
      oi.product_id,
      p.name AS product_name,
      p.unit_price,
      p.unit_space_consumption,
      oi.quantity,
      (oi.quantity * p.unit_price) AS line_total
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = $1
  `;
  const itemsResult = await pool.query(itemsQuery, [orderId]);

  return {
    ...orderResult.rows[0],
    items: itemsResult.rows,
  };
}

// Place a new order with atomic transaction
export async function createOrder(data: CreateOrderData) {
  // Compare calendar days to avoid hour/minute mismatches
  const reqDateStr = data.requested_delivery_date.split('T')[0];
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + ORDER_ADVANCE_DAYS);
  const minDateStrUTC = minDate.toISOString().split('T')[0];
  const year = minDate.getFullYear();
  const month = String(minDate.getMonth() + 1).padStart(2, '0');
  const day = String(minDate.getDate()).padStart(2, '0');
  const minDateStrLocal = `${year}-${month}-${day}`;
  const minDateStr = minDateStrUTC < minDateStrLocal ? minDateStrUTC : minDateStrLocal;

  if (reqDateStr < minDateStr) {
    throw new ValidationError(
      `Orders must be placed at least ${ORDER_ADVANCE_DAYS} days before requested delivery date.`
    );
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Verify route exists
    const routeCheck = await client.query('SELECT id FROM routes WHERE id = $1', [data.route_id]);
    if (routeCheck.rows.length === 0) {
      throw new ValidationError('Delivery address is not covered by any existing route.');
    }

    // 2. Insert order
    const orderResult = await client.query(
      `INSERT INTO orders (customer_id, order_date, requested_delivery_date, delivery_address, route_id, status)
       VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4, 'Pending')
       RETURNING *`,
      [data.customer_id, data.requested_delivery_date, data.delivery_address, data.route_id]
    );
    const order = orderResult.rows[0];

    // 3. Insert line items
    for (const item of data.items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity)
         VALUES ($1, $2, $3)`,
        [order.id, item.product_id, item.quantity]
      );
    }

    await client.query('COMMIT');

    try {
      await createNotification(
        data.customer_id,
        'Order Placed Successfully',
        `Your order #${order.id.slice(0, 8)} has been placed for delivery on ${data.requested_delivery_date.split('T')[0]}. Current status: Pending.`,
        'order_update'
      );
    } catch {
      // Non-blocking notification
    }

    return order;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Update order status
export async function updateOrderStatus(orderId: string, status: string, changedBy: string) {
  const result = await pool.query(
    `UPDATE orders SET status = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 RETURNING *`,
    [orderId, status]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Order');
  }

  const updatedOrder = result.rows[0];

  try {
    await createNotification(
      updatedOrder.customer_id,
      'Order Status Updated',
      `Your order #${orderId.slice(0, 8)} status has changed to "${status}".`,
      'order_update'
    );
  } catch {
    // Non-blocking notification
  }

  return updatedOrder;
}
