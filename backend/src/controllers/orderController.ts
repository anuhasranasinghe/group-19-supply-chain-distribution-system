// ============================================================
// Order Controller — HTTP Layer for Order Management
// ============================================================
// The order controller demonstrates data-level authorization:
// a customer can only access their own orders, while admins
// can see everything. The service layer enforces this.
// ============================================================

import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/express.js';
import * as orderService from '../services/orderService.js';

export async function getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    // Pass the authenticated user's ID and role so the service
    // can apply data-level authorization filters.
    const result = await orderService.getOrders(
      req.user!.id, req.user!.system_role, page, limit
    );
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
}

export async function getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const order = await orderService.getOrderById(
      req.params.id as string, req.user!.id, req.user!.system_role
    );
    res.json({ success: true, data: { order } });
  } catch (error) { next(error); }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // The customer_id comes from the authenticated user, not
    // the request body. This prevents a user from placing
    // orders on behalf of another customer.
    const order = await orderService.createOrder({
      ...req.body,
      customer_id: req.user!.id,
    });
    res.status(201).json({ success: true, data: { order }, message: 'Order placed successfully' });
  } catch (error) { next(error); }
}

export async function updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const order = await orderService.updateOrderStatus(
      req.params.id as string, req.body.status, req.user!.id
    );
    res.json({ success: true, data: { order }, message: 'Order status updated' });
  } catch (error) { next(error); }
}
