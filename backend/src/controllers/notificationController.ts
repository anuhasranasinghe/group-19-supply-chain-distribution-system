// Notification Controller
import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/express.js';
import * as notificationService from '../services/notificationService.js';

export async function getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const result = await notificationService.getUserNotifications(req.user!.id, page, limit);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
}

export async function markRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const notification = await notificationService.markAsRead(req.params.id as string, req.user!.id);
    res.json({ success: true, data: { notification } });
  } catch (error) { next(error); }
}

export async function markAllRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await notificationService.markAllAsRead(req.user!.id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) { next(error); }
}
