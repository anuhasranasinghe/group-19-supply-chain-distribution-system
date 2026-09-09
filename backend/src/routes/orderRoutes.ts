// Order Routes
import { Router } from 'express';
import * as orderController from '../controllers/orderController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createOrderSchema, updateOrderStatusSchema, uuidParam, paginationQuery } from '../validators/schemas.js';

const router = Router();

// All authenticated users can list/view orders (service enforces data-level auth)
router.get('/', authenticate, validate(paginationQuery, 'query'), orderController.getAll);
router.get('/:id', authenticate, validate(uuidParam, 'params'), orderController.getById);

// Only customers can place orders
router.post('/', authenticate, authorize('customer'), validate(createOrderSchema), orderController.create);

// Dispatchers and store managers can update order status
router.patch('/:id/status', authenticate, authorize('dispatcher', 'store_manager'), validate(uuidParam, 'params'), orderController.updateStatus);

export default router;
