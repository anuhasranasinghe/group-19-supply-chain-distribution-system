import { Router } from 'express';
import * as reportController from '../controllers/reportController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  dateRangeQuery,
  monthlyReportQuery,
  quarterlyReportQuery,
} from '../validators/schemas.js';

const router = Router();

router.get(
  '/quarterly-sales',
  authenticate,
  authorize('admin'),
  validate(quarterlyReportQuery, 'query'),
  reportController.quarterlySales
);

router.get(
  '/top-products',
  authenticate,
  authorize('admin'),
  validate(quarterlyReportQuery, 'query'),
  reportController.topProducts
);

router.get(
  '/city-sales',
  authenticate,
  authorize('admin'),
  validate(dateRangeQuery, 'query'),
  reportController.citySales
);

router.get(
  '/route-sales',
  authenticate,
  authorize('admin'),
  validate(dateRangeQuery, 'query'),
  reportController.routeSales
);

router.get(
  '/worker-hours',
  authenticate,
  authorize('admin'),
  validate(dateRangeQuery, 'query'),
  reportController.workerHours
);

router.get(
  '/truck-usage',
  authenticate,
  authorize('admin'),
  validate(monthlyReportQuery, 'query'),
  reportController.truckUsage
);

router.get(
  '/customer-orders',
  authenticate,
  authorize('admin', 'customer'),
  reportController.customerOrders
);

export default router;