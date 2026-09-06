import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/express.js';
import type { DeliveryStatus } from '../types/index.js';
import * as deliveryService from '../services/deliveryService.js';

interface PaginationQuery {
  page: number;
  limit: number;
}

interface UpdateDeliveryStatusBody {
  delivery_status: DeliveryStatus;
}

export async function getAll(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { page, limit } = req.query as unknown as PaginationQuery;

    const result = await deliveryService.getDeliveries(
      req.user!.id,
      req.user!.system_role,
      page,
      limit
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { delivery_status } = req.body as UpdateDeliveryStatusBody;

    const delivery = await deliveryService.updateDeliveryStatus(
      req.params.id as string,
      delivery_status,
      req.user!.id
    );

    res.json({
      success: true,
      data: { delivery },
      message: 'Delivery status updated',
    });
  } catch (error) {
    next(error);
  }
}