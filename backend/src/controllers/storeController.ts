// Store Controller
import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/express.js';
import * as storeService from '../services/storeService.js';

export async function getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const result = await storeService.getAllStores(page, limit);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
}

export async function getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const store = await storeService.getStoreById(req.params.id as string);
    res.json({ success: true, data: { store } });
  } catch (error) { next(error); }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const store = await storeService.createStore(req.body);
    res.status(201).json({ success: true, data: { store }, message: 'Store created' });
  } catch (error) { next(error); }
}

export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const store = await storeService.updateStore(req.params.id as string, req.body);
    res.json({ success: true, data: { store }, message: 'Store updated' });
  } catch (error) { next(error); }
}
