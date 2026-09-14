// ============================================================
// Type Definitions — Core Domain Types
// ============================================================
// These types mirror the database entities from the SRS/ER
// diagram. They are used throughout the backend for type-safe
// data passing between controllers, services, and database
// operations.
//
// The types use UUID strings (not number IDs) because the
// database uses UUID primary keys.
// ============================================================

// ----------------------------------------------------------
// System Role — Used for Authorization (RBAC)
// ----------------------------------------------------------
// This enum represents what a user is allowed to do in the
// application. It maps to User.system_role in the database.
// See docs/database-design-decisions.md, Decision 1.
// ----------------------------------------------------------
export type SystemRole = 'admin' | 'dispatcher' | 'store_manager' | 'driver' | 'assistant' | 'customer';

// ----------------------------------------------------------
// Worker Type — Used for Logistics Classification
// ----------------------------------------------------------
// This describes what kind of logistics work a person does.
// It is separate from system_role to avoid conflating
// authorization with job function.
// ----------------------------------------------------------
export type WorkerType = 'driver' | 'assistant' | 'store_manager';

// ----------------------------------------------------------
// Order Status
// ----------------------------------------------------------
export type OrderStatus = 'Pending' | 'Scheduled' | 'Delivered';

// ----------------------------------------------------------
// Delivery Status
// ----------------------------------------------------------
export type DeliveryStatus = 'Pending' | 'Scheduled' | 'Delivered' | 'Failed' | 'Returned';

// ----------------------------------------------------------
// Truck Trip Status
// ----------------------------------------------------------
export type TruckTripStatus = 'Scheduled' | 'In Progress' | 'Completed';

// ----------------------------------------------------------
// Notification Type
// ----------------------------------------------------------
export type NotificationType = 'order_update' | 'delivery_update' | 'assignment' | 'system';

// ============================================================
// Entity Interfaces
// ============================================================

export interface User {
  id: string;
  username: string;
  password_hash: string;
  name: string;
  system_role: SystemRole;
  created_at: Date;
  updated_at: Date;
}

// The safe version of User that excludes the password hash.
// This is what we send in API responses — never expose the hash.
export interface SafeUser {
  id: string;
  username: string;
  name: string;
  system_role: SystemRole;
  created_at: Date;
  updated_at: Date;
}

export interface Customer {
  id: string;
  street_name: string | null;
  city: string;
  postal_code: string | null;
  phone_no: string | null;
}

export interface Worker {
  id: string;
  type: WorkerType;
  hourly_pay: number;
  phone_no: string | null;
}

export interface Store {
  id: string;
  name: string;
  city: string;
  location: string | null;
  managed_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Route {
  id: string;
  store_id: string;
  max_delivery_time: string | null; // PostgreSQL INTERVAL as string
  area_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: string;
  name: string;
  unit_price: number;
  unit_space_consumption: number;
  created_at: Date;
  updated_at: Date;
}

export interface Order {
  id: string;
  customer_id: string;
  order_date: Date;
  requested_delivery_date: Date;
  delivery_address: string;
  route_id: string;
  status: OrderStatus;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
}

export interface TrainTrip {
  id: string;
  from_city: string;
  to_city: string;
  destination_store_id: string | null;
  trip_date: Date;
  departure_time: Date;
  arrival_time: Date;
  max_capacity: number;
  created_at: Date;
  updated_at: Date;
}

export interface OrderTrainAllocation {
  id: string;
  order_item_id: string;
  train_trip_id: string;
  quantity_allocated: number;
}

export interface Truck {
  id: string;
  vehicle_no: string;
  capacity: number;
  created_at: Date;
  updated_at: Date;
}

export interface TruckTrip {
  id: string;
  truck_id: string;
  driver_id: string;
  assistant_id: string;
  route_id: string;
  start_time: Date;
  end_time: Date | null;
  status: TruckTripStatus;
  created_at: Date;
  updated_at: Date;
}

export interface DeliveryItem {
  id: string;
  order_item_id: string;
  truck_trip_id: string;
  quantity: number;
  delivery_status: DeliveryStatus;
  delivered_at: Date | null;
}

export interface Inventory {
  id: string;
  store_id: string;
  product_id: string;
  quantity: number;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  old_status: string | null;
  new_status: string;
  changed_at: Date;
  changed_by: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: Date;
}
