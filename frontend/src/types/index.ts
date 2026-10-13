// ============================================================
// Frontend Type Definitions
// ============================================================
// These mirror the backend types. They define the shape of
// data flowing between the React frontend and the Express API.
// ============================================================

export type SystemRole = 'admin' | 'dispatcher' | 'store_manager' | 'driver' | 'assistant' | 'customer';
export type OrderStatus = 'Pending' | 'Scheduled' | 'Delivered';
export type DeliveryStatus = 'Pending' | 'Scheduled' | 'Delivered' | 'Failed' | 'Returned';
export type TruckTripStatus = 'Scheduled' | 'In Progress' | 'Completed';

export interface User {
  id: string;
  username: string;
  name: string;
  system_role: SystemRole;
  created_at: string;
  updated_at: string;
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
  type: string;
  hourly_pay: number;
  phone_no: string | null;
}

export interface Product {
  id: string;
  name: string;
  unit_price: number;
  unit_space_consumption: number;
  created_at: string;
}

export interface Store {
  id: string;
  name: string;
  city: string;
  location: string | null;
  managed_by: string | null;
  manager_name?: string;
}

export interface Route {
  id: string;
  store_id: string;
  max_delivery_time: string | null;
  area_name: string;
  store_name?: string;
  store_city?: string;
}

export interface Order {
  id: string;
  customer_id: string;
  order_date: string;
  requested_delivery_date: string;
  delivery_address: string;
  route_id: string;
  status: OrderStatus;
  customer_name?: string;
  route_area?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  product_name?: string;
  unit_price?: number;
}

export interface TrainTrip {
  id: string;
  from_city: string;
  to_city: string;
  destination_store_id: string | null;
  trip_date: string;
  departure_time: string;
  arrival_time: string;
  max_capacity: number;
  remaining_capacity?: number;
  store_name?: string;
}

export interface Truck {
  id: string;
  vehicle_no: string;
  capacity: number;
}

export interface TruckTrip {
  id: string;
  truck_id: string;
  driver_id: string;
  assistant_id: string;
  route_id: string;
  start_time: string;
  end_time: string | null;
  status: TruckTripStatus;
  vehicle_no?: string;
  driver_name?: string;
  assistant_name?: string;
  route_area?: string;
}

export interface DeliveryItem {
  id: string;
  order_item_id: string;
  truck_trip_id: string;
  quantity: number;
  delivery_status: DeliveryStatus;
  delivered_at: string | null;
  product_name?: string;
  order_id?: string;
  customer_name?: string;
  delivery_address?: string;
  vehicle_no?: string;
  route_area?: string;
  store_name?: string;
  truck_trip_status?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

// --- API Response Shapes ---
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export interface TrainAllocation {
  id: string;
  order_item_id: string;
  train_trip_id: string;
  quantity_allocated: number;
  allocated_space: string | number;
  order_id: string;
  product_id: string;
  product_name: string;
  unit_space_consumption: string | number;
  from_city: string;
  to_city: string;
  trip_date: string;
  departure_time: string;
  arrival_time: string;
  customer_id: string;
  order_status: string;
  requested_delivery_date: string;
}

export interface PendingOrderItem {
  order_item_id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  unit_space_consumption: string | number;
  total_quantity: number;
  allocated_quantity: number;
  unallocated_quantity: number;
  unallocated_space: string | number;
  destination_city: string;
  destination_store_name: string;
  requested_delivery_date: string;
  order_status: string;
  customer_name: string;
}

export interface PaginatedData<T> {
  [key: string]: T[] | number;
  total: number;
  page: number;
  limit: number;
}

// --- Role Metadata ---
export const ROLE_LABELS: Record<SystemRole, string> = {
  admin: 'Administrator',
  dispatcher: 'Dispatcher',
  store_manager: 'Store Manager',
  driver: 'Driver',
  assistant: 'Assistant',
  customer: 'Customer',
};

export const ROLE_COLORS: Record<SystemRole, string> = {
  admin: '#ef4444',
  dispatcher: '#f59e0b',
  store_manager: '#22c55e',
  driver: '#3b82f6',
  assistant: '#8b5cf6',
  customer: '#6366f1',
};
