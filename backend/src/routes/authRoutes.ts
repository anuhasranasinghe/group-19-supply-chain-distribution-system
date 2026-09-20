// Auth Routes

// Public routes (no auth required): login, register
// Protected routes (auth required): logout, me

import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, registerSchema } from '../validators/schemas.js';

const router = Router();

// Public routes — no authentication needed
router.post('/login', validate(loginSchema), authController.login);
router.post('/register', validate(registerSchema), authController.register);

// Protected routes — authentication required
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
