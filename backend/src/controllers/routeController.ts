// Route Controller
import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/express.js';
import * as routeService from '../services/routeService.js';

export async function getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const result = await routeService.getAllRoutes(page, limit);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
}

export async function getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const route = await routeService.getRouteById(req.params.id as string);
    res.json({ success: true, data: { route } });
  } catch (error) { next(error); }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const route = await routeService.createRoute(req.body);
    res.status(201).json({ success: true, data: { route }, message: 'Route created' });
  } catch (error) { next(error); }
}

export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const route = await routeService.updateRoute(req.params.id as string, req.body);
    res.json({ success: true, data: { route }, message: 'Route updated' });
  } catch (error) { next(error); }
}
