// Train Trip Routes
import { Router } from 'express';
import * as trainTripController from '../controllers/trainTripController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createTrainTripSchema, updateTrainTripSchema, uuidParam, paginationQuery } from '../validators/schemas.js';

const router = Router();

router.get('/', authenticate, authorize('admin', 'dispatcher'), validate(paginationQuery, 'query'), trainTripController.getAll);
router.get('/:id', authenticate, authorize('admin', 'dispatcher'), validate(uuidParam, 'params'), trainTripController.getById);
router.post('/', authenticate, authorize('admin'), validate(createTrainTripSchema), trainTripController.create);
router.put('/:id', authenticate, authorize('admin'), validate(uuidParam, 'params'), trainTripController.update);

export default router;
