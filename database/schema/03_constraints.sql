-- check constraint of user.system_role
ALTER TABLE users
ADD CONSTRAINT chk_users_system_role
CHECK (system_role IN ('admin', 'dispatcher', 'store_manager', 'driver', 'assistant', 'customer'))

-- checking constraint on worker.type
ALTER TABLE workers
ADD CONSTRAINT chk_workers_type
CHECK (type IN ('driver', 'assistant', 'store_manager'))

-- Order status must be a recognized value
ALTER TABLE orders
ADD CONSTRAINT chk_orders_status
CHECK (status IN ('Pending', 'Scheduled', 'Delivered'));

-- 7-Day Advance Order Rule
ALTER TABLE orders
ADD CONSTRAINT chk_orders_7day_rule
CHECK (requested_delivery_date >= order_date::date + INTERVAL '7 days');

-- Order item quantity must be positive
ALTER TABLE order_items
ADD CONSTRAINT chk_order_items_quantity
CHECK (quantity > 0);

-- Product unit price must be positive
ALTER TABLE products
  ADD CONSTRAINT chk_products_unit_price
  CHECK (unit_price > 0);

-- Product space consumption must be positive
ALTER TABLE products
  ADD CONSTRAINT chk_products_unit_space_consumption
  CHECK (unit_space_consumption > 0);

-- Train trip capacity must be positive
ALTER TABLE train_trips
  ADD CONSTRAINT chk_train_trips_max_capacity
  CHECK (max_capacity > 0);

-- Train arrival must be after departure
ALTER TABLE train_trips
  ADD CONSTRAINT chk_train_trips_times
  CHECK (arrival_time > departure_time);

-- Allocated quantity must be positive
ALTER TABLE order_train_allocations
  ADD CONSTRAINT chk_allocations_quantity_allocated
  CHECK (quantity_allocated > 0);

-- Truck capacity must be positive
ALTER TABLE trucks
  ADD CONSTRAINT chk_trucks_capacity
  CHECK (capacity > 0);

-- Truck trip end time must be after start time
ALTER TABLE truck_trips
  ADD CONSTRAINT chk_truck_trips_times
  CHECK (end_time IS NULL OR end_time > start_time);

-- Delivery item status must be a recognized value
ALTER TABLE delivery_items
ADD CONSTRAINT chk_delivery_items_status
CHECK (
    delivery_status IN (
        'Pending', 'Scheduled', 'Delivered', 'Failed', 'Returned'
    )
);

-- Delivery quantity must be positive
ALTER TABLE delivery_items
ADD CONSTRAINT chk_delivery_items_quantity
CHECK (quantity > 0);

-- Inventory quantity cannot be negative
ALTER TABLE inventory
  ADD CONSTRAINT chk_inventory_quantity
  CHECK (quantity >= 0);

-- Each product must appear only once in each store
ALTER TABLE inventory
  ADD CONSTRAINT uq_inventory_store_product
  UNIQUE (store_id, product_id);

-- check whether worker.hourly_pay > 0
ALTER TABLE workers
ADD CONSTRAINT chk_workers_hourly_pay
CHECK (hourly_pay > 0)

-- constraint on notification.type
ALTER TABLE notifications
ADD CONSTRAINT chk_notifications_type
CHECK (type IN ('order_update', 'delivery_update', 'assignment', 'system'))
