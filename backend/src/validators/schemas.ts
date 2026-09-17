// ============================================================
// Validation Schemas — Zod Definitions
// ============================================================
// Each schema defines the expected shape and constraints for incoming API request data. Zod provides both runtime validation and TypeScript type inference.
//
// Convention: schema names use the pattern:
//   <action><Entity>Schema  (e.g., createOrderSchema)
// ============================================================

import { z } from 'zod';
import { SYSTEM_ROLES, WORKER_TYPES, DELIVERY_STATUSES } from '../config/constants.js';

// ----------------------------------------------------------
// Common / Reusable Schemas
// ----------------------------------------------------------

export const uuidParam = z.object({
  id: z.string().uuid('Invalid ID format — expected a UUID'),
});

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ----------------------------------------------------------
// Auth Schemas
// ----------------------------------------------------------

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  name: z.string().min(1, 'Name is required').max(255),
  // Customer-specific fields for self-registration
  city: z.string().min(1, 'City is required').max(100),
  street_name: z.string().max(255).optional(),
  postal_code: z.string().max(20).optional(),
  phone_no: z.string().max(20).optional(),
});

// ----------------------------------------------------------
// User Schemas (Admin creating staff users)
// ----------------------------------------------------------

export const createUserSchema = z.object({
  username: z.string().min(3).max(100),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(255),
  system_role: z.enum(SYSTEM_ROLES),
  // Worker fields (required if role is driver/assistant/store_manager)
  worker_type: z.enum(WORKER_TYPES).optional(),
  hourly_pay: z.number().positive().optional(),
  phone_no: z.string().max(20).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  system_role: z.enum(SYSTEM_ROLES).optional(),
  hourly_pay: z.number().positive().optional(),
  phone_no: z.string().max(20).optional(),
});

// ----------------------------------------------------------
// Product Schemas
// ----------------------------------------------------------

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255),
  unit_price: z.number().positive('Unit price must be positive'),
  unit_space_consumption: z.number().positive('Space consumption must be positive'),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  unit_price: z.number().positive().optional(),
  unit_space_consumption: z.number().positive().optional(),
});

// ----------------------------------------------------------
// Store Schemas
// ----------------------------------------------------------

export const createStoreSchema = z.object({
  name: z.string().min(1).max(255),
  city: z.string().min(1).max(100),
  location: z.string().optional(),
  managed_by: z.string().uuid().optional(),
});

export const updateStoreSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  city: z.string().min(1).max(100).optional(),
  location: z.string().optional(),
  managed_by: z.string().uuid().nullable().optional(),
});

// ----------------------------------------------------------
// Route Schemas
// ----------------------------------------------------------

export const createRouteSchema = z.object({
  store_id: z.string().uuid(),
  max_delivery_time: z.string().optional(), // PostgreSQL interval as string
  area_name: z.string().min(1).max(255),
});

export const updateRouteSchema = z.object({
  store_id: z.string().uuid().optional(),
  max_delivery_time: z.string().optional(),
  area_name: z.string().min(1).max(255).optional(),
});

// ----------------------------------------------------------
// Order Schemas
// ----------------------------------------------------------

export const createOrderSchema = z.object({
  delivery_address: z.string().min(1, 'Delivery address is required'),
  requested_delivery_date: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    'Invalid date format'
  ),
  route_id: z.string().uuid('Route is required'),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().positive('Quantity must be a positive integer'),
  })).min(1, 'Order must contain at least one item'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['Pending', 'Scheduled', 'Delivered']),
});

// ----------------------------------------------------------
// Train Trip Schemas
// ----------------------------------------------------------

export const createTrainTripSchema = z.object({
  to_city: z.string().min(1).max(100),
  destination_store_id: z.string().uuid().optional(),
  trip_date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  departure_time: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid datetime'),
  arrival_time: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid datetime'),
  max_capacity: z.number().int().positive('Capacity must be positive'),
});

export const updateTrainTripSchema = z.object({
  to_city: z.string().min(1).max(100).optional(),
  destination_store_id: z.string().uuid().optional(),
  trip_date: z.string().optional(),
  departure_time: z.string().optional(),
  arrival_time: z.string().optional(),
  max_capacity: z.number().int().positive().optional(),
});

// ----------------------------------------------------------
// Train Allocation Schemas
// ----------------------------------------------------------

export const createTrainAllocationSchema = z.object({
  order_item_id: z.string().uuid(),
  train_trip_id: z.string().uuid(),
  quantity_allocated: z.number().int().positive().optional(), // If omitted, allocate all
});

// ----------------------------------------------------------
// Truck Schemas
// ----------------------------------------------------------

export const createTruckSchema = z.object({
  vehicle_no: z.string().min(1).max(50),
  capacity: z.number().positive('Capacity must be positive'),
});

export const updateTruckSchema = z.object({
  vehicle_no: z.string().min(1).max(50).optional(),
  capacity: z.number().positive().optional(),
});

// ----------------------------------------------------------
// Truck Trip Schemas
// ----------------------------------------------------------

export const createTruckTripSchema = z.object({
  truck_id: z.string().uuid(),
  driver_id: z.string().uuid(),
  assistant_id: z.string().uuid(),
  route_id: z.string().uuid(),
  start_time: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid datetime'),
  end_time: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid datetime').optional(),
});

export const updateTruckTripStatusSchema = z.object({
  status: z.enum(['Scheduled', 'In Progress', 'Completed']),
  end_time: z.string().optional(),
});

// ----------------------------------------------------------
// Delivery Schemas
// ----------------------------------------------------------

export const updateDeliveryStatusSchema = z.object({
  delivery_status: z.enum(DELIVERY_STATUSES as unknown as [string, ...string[]]),
});

// ----------------------------------------------------------
// Report Query Schemas
// ----------------------------------------------------------

export const quarterlyReportQuery = z.object({
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  quarter: z.coerce.number().int().min(1).max(4).optional(),
});

export const monthlyReportQuery = z.object({
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
});

export const dateRangeQuery = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});
