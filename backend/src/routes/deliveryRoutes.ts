import { Router } from 'express';
import * as deliveryController from '../controllers/deliveryController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  paginationQuery,
  updateDeliveryStatusSchema,
  uuidParam,
} from '../validators/schemas.js';

const router = Router();

router.get(
  '/',
  authenticate,
  validate(paginationQuery, 'query'),
  deliveryController.getAll
);

router.patch(
  '/:id/status',
  authenticate,
  authorize('driver', 'assistant'),
  validate(uuidParam, 'params'),
  validate(updateDeliveryStatusSchema, 'body'),
  deliveryController.updateStatus
);

export default router;