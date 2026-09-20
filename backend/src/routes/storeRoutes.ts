// Store Routes
import { Router } from 'express';
import * as storeController from '../controllers/storeController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createStoreSchema, updateStoreSchema, uuidParam, paginationQuery } from '../validators/schemas.js';

const router = Router();

router.get('/', authenticate, authorize('admin', 'dispatcher', 'store_manager'), validate(paginationQuery, 'query'), storeController.getAll);
router.get('/:id', authenticate, authorize('admin', 'dispatcher', 'store_manager'), validate(uuidParam, 'params'), storeController.getById);
router.post('/', authenticate, authorize('admin'), validate(createStoreSchema), storeController.create);
router.put('/:id', authenticate, authorize('admin'), validate(uuidParam, 'params'), storeController.update);

export default router;
