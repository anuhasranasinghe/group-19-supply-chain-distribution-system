// Train Allocation Routes
import { Router } from 'express';
import * as trainAllocationController from '../controllers/trainAllocationController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createTrainAllocationSchema, paginationQuery } from '../validators/schemas.js';

const router = Router();

router.get('/', authenticate, authorize('dispatcher'), validate(paginationQuery, 'query'), trainAllocationController.getAll);
router.post('/', authenticate, authorize('dispatcher'), validate(createTrainAllocationSchema), trainAllocationController.create);

export default router;
