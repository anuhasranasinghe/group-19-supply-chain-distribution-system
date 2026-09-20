// User Routes (Admin only)

import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createUserSchema, updateUserSchema, uuidParam, paginationQuery } from '../validators/schemas.js';

const router = Router();

// All user management routes require admin role
router.use(authenticate, authorize('admin'));

router.get('/', validate(paginationQuery, 'query'), userController.getAll);
router.get('/:id', validate(uuidParam, 'params'), userController.getById);
router.post('/', validate(createUserSchema), userController.create);
router.put('/:id', validate(uuidParam, 'params'), userController.update);
router.delete('/:id', validate(uuidParam, 'params'), userController.remove);

export default router;
