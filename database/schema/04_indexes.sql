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