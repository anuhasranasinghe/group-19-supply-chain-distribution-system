// Notification Routes
import { Router } from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { uuidParam, paginationQuery } from '../validators/schemas.js';

const router = Router();

// All notification operations require authentication.
// Users can only access their own notifications (enforced in service).
router.use(authenticate);

router.get('/', validate(paginationQuery, 'query'), notificationController.getAll);
router.patch('/:id/read', validate(uuidParam, 'params'), notificationController.markRead);
router.patch('/read-all', notificationController.markAllRead);

export default router;
