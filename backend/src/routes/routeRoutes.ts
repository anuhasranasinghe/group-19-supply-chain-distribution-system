// Route Routes (delivery routes, not Express routes)
import { Router } from 'express';
import * as routeController from '../controllers/routeController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createRouteSchema, updateRouteSchema, uuidParam, paginationQuery } from '../validators/schemas.js';

const router = Router();

router.get('/', authenticate, authorize('admin', 'dispatcher', 'store_manager'), validate(paginationQuery, 'query'), routeController.getAll);
router.get('/:id', authenticate, authorize('admin', 'dispatcher', 'store_manager'), validate(uuidParam, 'params'), routeController.getById);
router.post('/', authenticate, authorize('admin'), validate(createRouteSchema), routeController.create);
router.put('/:id', authenticate, authorize('admin'), validate(uuidParam, 'params'), routeController.update);

export default router;
