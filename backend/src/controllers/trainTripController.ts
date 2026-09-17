// Train Trip Controller
import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/express.js';
import * as trainTripService from '../services/trainTripService.js';

export async function getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const result = await trainTripService.getAllTrainTrips(page, limit);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
}

export async function getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const trip = await trainTripService.getTrainTripById(req.params.id as string);
    res.json({ success: true, data: { trainTrip: trip } });
  } catch (error) { next(error); }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const trip = await trainTripService.createTrainTrip(req.body);
    res.status(201).json({ success: true, data: { trainTrip: trip }, message: 'Train trip created' });
  } catch (error) { next(error); }
}

export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const trip = await trainTripService.updateTrainTrip(req.params.id as string, req.body);
    res.json({ success: true, data: { trainTrip: trip }, message: 'Train trip updated' });
  } catch (error) { next(error); }
}
