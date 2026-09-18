// Truck Controller
import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/express.js';
import * as truckService from '../services/truckService.js';

export async function getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const result = await truckService.getAllTrucks(page, limit);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
}

export async function getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const truck = await truckService.getTruckById(req.params.id as string);
    res.json({ success: true, data: { truck } });
  } catch (error) { next(error); }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const truck = await truckService.createTruck(req.body);
    res.status(201).json({ success: true, data: { truck }, message: 'Truck created' });
  } catch (error) { next(error); }
}

export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const truck = await truckService.updateTruck(req.params.id as string, req.body);
    res.json({ success: true, data: { truck }, message: 'Truck updated' });
  } catch (error) { next(error); }
}
