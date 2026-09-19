// Product Routes
import { Router } from 'express';
import * as productController from '../controllers/productController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createProductSchema, updateProductSchema, uuidParam, paginationQuery } from '../validators/schemas.js';

const router = Router();

// All authenticated users can view products
router.get('/', authenticate, validate(paginationQuery, 'query'), productController.getAll);
router.get('/:id', authenticate, validate(uuidParam, 'params'), productController.getById);

// Only admin can create/update/delete products
router.post('/', authenticate, authorize('admin'), validate(createProductSchema), productController.create);
router.put('/:id', authenticate, authorize('admin'), validate(uuidParam, 'params'), productController.update);
router.delete('/:id', authenticate, authorize('admin'), validate(uuidParam, 'params'), productController.remove);

export default router;
