// User Routes (Admin only)

import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createUserSchema, updateUserSchema, uuidParam, paginationQuery } from '../validators/schemas.js';

const router = Router();

// Reading users is accessible to staff who need to view crew/workers (admin, dispatcher, store_manager)
router.get('/', authenticate, authorize('admin', 'dispatcher', 'store_manager'), validate(paginationQuery, 'query'), userController.getAll);
router.get('/:id', authenticate, authorize('admin', 'dispatcher', 'store_manager'), validate(uuidParam, 'params'), userController.getById);

// Modifying users requires admin role
router.post('/', authenticate, authorize('admin'), validate(createUserSchema), userController.create);
router.put('/:id', authenticate, authorize('admin'), validate(uuidParam, 'params'), userController.update);
router.delete('/:id', authenticate, authorize('admin'), validate(uuidParam, 'params'), userController.remove);

export default router;
