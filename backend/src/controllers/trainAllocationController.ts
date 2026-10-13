// Train Allocation Controller
import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/express.js';
import * as trainAllocationService from '../services/trainAllocationService.js';

export async function getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const result = await trainAllocationService.getAllocations(page, limit);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const allocation = await trainAllocationService.createAllocation(req.body);
    res.status(201).json({ success: true, data: { allocation }, message: 'Order item allocated to train' });
  } catch (error) { next(error); }
}

export async function getPendingItems(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const items = await trainAllocationService.getPendingOrderItems();
    res.json({ success: true, data: { items } });
  } catch (error) { next(error); }
}
