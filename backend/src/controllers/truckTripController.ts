// Truck Trip Controller
import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/express.js';
import * as truckTripService from '../services/truckTripService.js';

export async function getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const result = await truckTripService.getTruckTrips(
      req.user!.id, req.user!.system_role, page, limit
    );
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
}

export async function getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const trip = await truckTripService.getTruckTripById(req.params.id as string);
    res.json({ success: true, data: { truckTrip: trip } });
  } catch (error) { next(error); }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const trip = await truckTripService.createTruckTrip(req.body);
    res.status(201).json({ success: true, data: { truckTrip: trip }, message: 'Truck trip scheduled' });
  } catch (error) { next(error); }
}

export async function updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const trip = await truckTripService.updateTruckTripStatus(
      req.params.id as string, req.body.status, req.body.end_time
    );
    res.json({ success: true, data: { truckTrip: trip }, message: 'Trip status updated' });
  } catch (error) { next(error); }
}
