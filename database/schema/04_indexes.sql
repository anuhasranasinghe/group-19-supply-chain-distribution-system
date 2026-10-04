-- Order and Order Items Indexes

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_route_id ON orders(route_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);

-- Order Date Index

CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);


-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(user_id, created_at DESC);


-- Truck trip composite indexes
CREATE INDEX IF NOT EXISTS idx_truck_trips_driver_start
ON truck_trips(driver_id, start_time);

CREATE INDEX IF NOT EXISTS idx_truck_trips_assistant_start
ON truck_trips(assistant_id, start_time);


-- Train trip lookup index
CREATE INDEX IF NOT EXISTS idx_train_trips_lookup
ON train_trips(from_city, to_city, trip_date);


-- Delivery item lookup indexes
CREATE INDEX IF NOT EXISTS idx_delivery_items_order_item_id
ON delivery_items(order_item_id);

CREATE INDEX IF NOT EXISTS idx_delivery_items_truck_trip_id
ON delivery_items(truck_trip_id);

-- Train destination city lookup index
CREATE INDEX IF NOT EXISTS idx_train_trips_to_city
ON train_trips(to_city);

-- Order Train Allocation Indexes
CREATE INDEX IF NOT EXISTS idx_order_train_alloc_order_item ON order_train_allocations(order_item_id);
CREATE INDEX IF NOT EXISTS idx_order_train_alloc_trip ON order_train_allocations(train_trip_id);

-- Truck Trip Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_truck_trips_truck_id ON truck_trips(truck_id);
CREATE INDEX IF NOT EXISTS idx_truck_trips_driver_id ON truck_trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_truck_trips_assistant_id ON truck_trips(assistant_id);
CREATE INDEX IF NOT EXISTS idx_truck_trips_route_id ON truck_trips(route_id);
CREATE INDEX IF NOT EXISTS idx_truck_trips_start_time ON truck_trips(start_time);

-- Inventory Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_store_id ON inventory(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);

-- Train Trip Destination Store Index
CREATE INDEX IF NOT EXISTS idx_train_trips_destination_store ON train_trips(destination_store_id);

-- Customer City Lookup Index
CREATE INDEX IF NOT EXISTS idx_customers_city ON customers(city);


