// ============================================================
// Notification Service — In-App Notifications
// ============================================================
import { pool } from '../database/connection.js';
import { NotFoundError } from '../utils/errors.js';
import type { NotificationType } from '../types/index.js';

export async function getUserNotifications(userId: string, page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT id, user_id, title, message, type, is_read, created_at
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  const countResult = await pool.query(
    `SELECT COUNT(*) AS count FROM notifications WHERE user_id = $1`,
    [userId]
  );

  const unreadResult = await pool.query(
    `SELECT COUNT(*) AS count FROM notifications WHERE user_id = $1 AND is_read = false`,
    [userId]
  );

  return {
    notifications: result.rows,
    total: parseInt(countResult.rows[0]?.count || '0', 10),
    unread: parseInt(unreadResult.rows[0]?.count || '0', 10),
    page,
    limit,
  };
}

export async function markAsRead(notificationId: string, userId: string) {
  const result = await pool.query(
    `UPDATE notifications SET is_read = true
     WHERE id = $1 AND user_id = $2 RETURNING *`,
    [notificationId, userId]
  );
  if (result.rows.length === 0) throw new NotFoundError('Notification');
  return result.rows[0];
}

export async function markAllAsRead(userId: string) {
  await pool.query(
    `UPDATE notifications SET is_read = true
     WHERE user_id = $1 AND is_read = false`,
    [userId]
  );
  return { success: true };
}

// Helper to create a notification (used by other services/triggers).
export async function createNotification(
  userId: string, title: string, message: string, type: NotificationType
) {
  const result = await pool.query(
    `INSERT INTO notifications (user_id, title, message, type, is_read)
     VALUES ($1, $2, $3, $4, false) RETURNING *`,
    [userId, title, message, type]
  );
  return result.rows[0];
}
