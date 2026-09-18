// Truck Trip Routes
import { Router } from 'express';
import * as truckTripController from '../controllers/truckTripController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createTruckTripSchema, updateTruckTripStatusSchema, uuidParam, paginationQuery } from '../validators/schemas.js';

const router = Router();

// All authenticated staff can view truck trips (service enforces data-level auth)
router.get('/', authenticate, validate(paginationQuery, 'query'), truckTripController.getAll);
router.get('/:id', authenticate, validate(uuidParam, 'params'), truckTripController.getById);

// Dispatchers and store managers can schedule truck trips
router.post('/', authenticate, authorize('dispatcher', 'store_manager'), validate(createTruckTripSchema), truckTripController.create);

// Drivers and assistants can update trip status (mark as in-progress/completed)
router.patch('/:id', authenticate, authorize('driver', 'assistant'), validate(uuidParam, 'params'), truckTripController.updateStatus);

export default router;
