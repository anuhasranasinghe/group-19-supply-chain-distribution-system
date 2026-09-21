// ============================================================
// Express Application Setup
// ============================================================
// This file configures the Express application with all its global middleware and routes. 
// It's separate from server.ts 
// So that the app can be imported for testing without starting the HTTP server.
//
// Middleware order matters:
// 1. CORS (must be first to handle preflight OPTIONS requests)
// 2. Body parsers (JSON, URL-encoded)
// 3. Cookie parser (for JWT extraction)
// 4. Routes (application logic)
// 5. Error handler (must be last — catches all thrown errors)
// ============================================================

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/environment.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import routeRoutes from './routes/routeRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import trainTripRoutes from './routes/trainTripRoutes.js';
import trainAllocationRoutes from './routes/trainAllocationRoutes.js';
import truckRoutes from './routes/truckRoutes.js';
import truckTripRoutes from './routes/truckTripRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();

// ----------------------------------------------------------
// CORS Configuration
// ----------------------------------------------------------
// CORS (Cross-Origin Resource Sharing) controls which domains
// can make requests to our API. Without this, the browser
// blocks requests from the frontend (localhost:5173) to the
// backend (localhost:3000) because they're different origins.
//
// credentials: true is CRITICAL — it allows the browser to
// send and receive cookies (where our JWT lives) with
// cross-origin requests.
// ----------------------------------------------------------
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ----------------------------------------------------------
// Body Parsers
// ----------------------------------------------------------
// Parse incoming JSON request bodies. Without this, req.body
// would be undefined for POST/PUT requests.
// The limit prevents oversized payloads from consuming memory.
// ----------------------------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ----------------------------------------------------------
// Cookie Parser
// ----------------------------------------------------------
// Parses the Cookie header and populates req.cookies with
// key-value pairs. Our authenticate middleware reads the JWT
// from req.cookies.scds_token.
// ----------------------------------------------------------
app.use(cookieParser());

// ----------------------------------------------------------
// Health Check Endpoint
// ----------------------------------------------------------
// A simple endpoint that returns 200 if the server is running.
// Used by Docker healthchecks and monitoring tools.
// ----------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ----------------------------------------------------------
// API Routes
// ----------------------------------------------------------
// Each route file handles a specific resource/entity.
// All routes are prefixed with /api/ to separate them from
// any static file serving.
// ----------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/train-trips', trainTripRoutes);
app.use('/api/train-allocations', trainAllocationRoutes);
app.use('/api/trucks', truckRoutes);
app.use('/api/truck-trips', truckTripRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// ----------------------------------------------------------
// 404 Handler — Catch unmatched routes
// ----------------------------------------------------------
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested endpoint does not exist.',
    },
  });
});

// ----------------------------------------------------------
// Global Error Handler — Must be LAST middleware
// ----------------------------------------------------------
// Express identifies this as an error handler because it has
// 4 parameters (err, req, res, next). Any error thrown or
// passed to next(error) anywhere in the app ends up here.
// ----------------------------------------------------------
app.use(errorHandler);

export default app;
