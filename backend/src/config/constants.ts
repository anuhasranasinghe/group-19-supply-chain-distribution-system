// ============================================================
// Application Constants
// ============================================================
// Centralizes magic values that are used in multiple places.
// If a business rule changes (e.g., the 7-day advance rule becomes 5 days), we only change it here.
// ============================================================

// The minimum number of days between order placement and
// the requested delivery date (SRS §6.4, Business Rule 1).
export const ORDER_ADVANCE_DAYS = 7;

// Weekly working-hour limits per worker type (SRS §6.4).
export const WEEKLY_HOUR_LIMITS = {
  driver: 40,
  assistant: 60,
} as const;

// Maximum consecutive assignments (SRS §4.4.3).
// "A driver shall not be scheduled for two consecutive
// truck deliveries" → max 1 consecutive (2 total in a row).
// "An assistant shall not be scheduled for more than two
// consecutive routes" → max 2 consecutive (3 total in a row).
export const MAX_CONSECUTIVE_ASSIGNMENTS = {
  driver: 1,   // Can do at most 1 then must take a break
  assistant: 2, // Can do at most 2 then must take a break
} as const;

// JWT cookie name
export const AUTH_COOKIE_NAME = 'scds_token';

// Order status values
export const ORDER_STATUSES = ['Pending', 'Scheduled', 'Delivered'] as const;

// Delivery status values
export const DELIVERY_STATUSES = ['Pending', 'Scheduled', 'Delivered', 'Failed', 'Returned'] as const;

// System roles for authorization
export const SYSTEM_ROLES = ['admin', 'dispatcher', 'store_manager', 'driver', 'assistant', 'customer'] as const;

// Worker types for logistics classification
export const WORKER_TYPES = ['driver', 'assistant', 'store_manager'] as const;

// Origin city — all train trips originate from Kandy (SRS §2.7)
export const ORIGIN_CITY = 'Kandy';

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
