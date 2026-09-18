// Truck Routes
import { Router } from 'express';
import * as truckController from '../controllers/truckController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createTruckSchema, updateTruckSchema, uuidParam, paginationQuery } from '../validators/schemas.js';

const router = Router();

router.get('/', authenticate, authorize('admin', 'dispatcher'), validate(paginationQuery, 'query'), truckController.getAll);
router.get('/:id', authenticate, authorize('admin', 'dispatcher'), validate(uuidParam, 'params'), truckController.getById);
router.post('/', authenticate, authorize('admin'), validate(createTruckSchema), truckController.create);
router.put('/:id', authenticate, authorize('admin'), validate(uuidParam, 'params'), truckController.update);

export default router;
