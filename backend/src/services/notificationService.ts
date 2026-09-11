// ============================================================
// Notification Service — In-App Notifications
// ============================================================
import { pool } from '../database/connection.js';
import { NotFoundError } from '../utils/errors.js';
import type { NotificationType } from '../types/index.js';

export async function getUserNotifications(userId: string, page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;

  // TODO: Write the PostgreSQL query here.
  //
  // This query should:
  // 1. Select from "notifications" WHERE user_id = $3.
  // 2. Order by created_at DESC (newest first).
  // 3. Apply pagination: LIMIT $1 OFFSET $2.
  // 4. Also COUNT(*) for total.
  // 5. Optionally get unread count separately:
  //    SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false
  //
  // IMPORTANT: Use parameterized values via pg.

  const result = await pool.query(`/* YOUR SQL QUERY HERE */`, [limit, offset, userId]);
  const countResult = await pool.query(`/* YOUR SQL COUNT QUERY HERE */`, [userId]);
  const unreadResult = await pool.query(`/* YOUR SQL UNREAD COUNT QUERY HERE */`, [userId]);

  return {
    notifications: result.rows,
    total: parseInt(countResult.rows[0]?.count || '0', 10),
    unread: parseInt(unreadResult.rows[0]?.count || '0', 10),
    page,
    limit,
  };
}

export async function markAsRead(notificationId: string, userId: string) {
  // TODO: Write the PostgreSQL UPDATE query.
  //
  // UPDATE notifications SET is_read = true
  // WHERE id = $1 AND user_id = $2 RETURNING *
  //
  // The user_id check ensures a user can only mark their own
  // notifications as read (data-level authorization).
  //
  // IMPORTANT: Use parameterized values via pg.

  const result = await pool.query(`/* YOUR SQL UPDATE QUERY HERE */`, [notificationId, userId]);
  if (result.rows.length === 0) throw new NotFoundError('Notification');
  return result.rows[0];
}

export async function markAllAsRead(userId: string) {
  // TODO: Write the PostgreSQL UPDATE query.
  //
  // UPDATE notifications SET is_read = true
  // WHERE user_id = $1 AND is_read = false
  //
  // IMPORTANT: Use parameterized values via pg.

  await pool.query(`/* YOUR SQL UPDATE QUERY HERE */`, [userId]);
  return { success: true };
}

// Helper to create a notification (used by other services/triggers).
export async function createNotification(
  userId: string, title: string, message: string, type: NotificationType
) {
  // TODO: Write the PostgreSQL INSERT query.
  //
  // INSERT INTO notifications (user_id, title, message, type, is_read)
  // VALUES ($1, $2, $3, $4, false) RETURNING *
  //
  // IMPORTANT: Use parameterized values via pg.

  const result = await pool.query(`/* YOUR SQL INSERT QUERY HERE */`, [userId, title, message, type]);
  return result.rows[0];
}
