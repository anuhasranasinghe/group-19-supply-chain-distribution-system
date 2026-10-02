-- customer user relationship
ALTER TABLE customers
ADD CONSTRAINT fk_customers_user
FOREIGN KEY (id) REFERENCES users(id)
ON DELETE CASCADE;

-- worker - user relationship
ALTER TABLE workers
ADD CONSTRAINT fk_workers_user
FOREIGN KEY (id) REFERENCES users(id)
ON DELETE CASCADE;

-- notification - user relationship
ALTER TABLE notifications
ADD CONSTRAINT fk_notifications_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;

-- Stores -worker relationship

ALTER TABLE stores
ADD CONSTRAINT fk_stores_managed_by
FOREIGN KEY (managed_by) REFERENCES workers(id)
ON DELETE SET NULL;

--Routes - store relationship

ALTER TABLE routes
ADD CONSTRAINT fk_routes_store
FOREIGN KEY (store_id) REFERENCES stores(id)
ON DELETE RESTRICT;

-- Order - Customer relation

ALTER TABLE orders
ADD CONSTRAINT fk_orders_customer
FOREIGN KEY (customer_id) REFERENCES customers(id)
ON DELETE RESTRICT;

-- Order - Route relation

ALTER TABLE orders
ADD CONSTRAINT fk_orders_route
FOREIGN KEY (route_id) REFERENCES routes(id)
ON DELETE RESTRICT;

-- OrderItem - Order relation

ALTER TABLE order_items
ADD CONSTRAINT fk_order_items_order
FOREIGN KEY (order_id) REFERENCES orders(id)
ON DELETE CASCADE;

-- OrderItem - Product relation

ALTER TABLE order_items
ADD CONSTRAINT fk_order_items_product
FOREIGN KEY (product_id) REFERENCES products(id)
ON DELETE RESTRICT;

-- TrainTrip - Destination Store relationship

ALTER TABLE train_trips
ADD CONSTRAINT fk_train_trips_destination_store
FOREIGN KEY (destination_store_id) REFERENCES stores(id)
ON DELETE RESTRICT;

-- OrderTrainAllocation - OrderItem relationship

ALTER TABLE order_train_allocations
ADD CONSTRAINT fk_allocations_order_item
FOREIGN KEY (order_item_id) REFERENCES order_items(id)
ON DELETE CASCADE;

-- OrderTrainAllocation - TrainTrip relationship

ALTER TABLE order_train_allocations
ADD CONSTRAINT fk_allocations_train_trip
FOREIGN KEY (train_trip_id) REFERENCES train_trips(id)
ON DELETE RESTRICT;

-- TruckTrip - Truck relationship

ALTER TABLE truck_trips
ADD CONSTRAINT fk_truck_trips_truck
FOREIGN KEY (truck_id) REFERENCES trucks(id)
ON DELETE RESTRICT;

-- TruckTrip - Driver relationship

ALTER TABLE truck_trips
ADD CONSTRAINT fk_truck_trips_driver
FOREIGN KEY (driver_id) REFERENCES workers(id)
ON DELETE RESTRICT;

-- TruckTrip - Assistant relationship

ALTER TABLE truck_trips
ADD CONSTRAINT fk_truck_trips_assistant
FOREIGN KEY (assistant_id) REFERENCES workers(id)
ON DELETE RESTRICT;

-- TruckTrip - Route relationship

ALTER TABLE truck_trips
ADD CONSTRAINT fk_truck_trips_route
FOREIGN KEY (route_id) REFERENCES routes(id)
ON DELETE RESTRICT;

--Inventory - store realation

ALTER TABLE inventory
ADD CONSTRAINT fk_inventory_store
FOREIGN KEY (store_id) REFERENCES stores(id)
ON DELETE CASCADE;

--inventory - product relation 

ALTER TABLE inventory
ADD CONSTRAINT fk_inventory_product
FOREIGN KEY (product_id) REFERENCES products(id)
ON DELETE RESTRICT;

-- Delivery item - order item relationship
ALTER TABLE delivery_items
ADD CONSTRAINT fk_delivery_items_order_item
FOREIGN KEY (order_item_id) REFERENCES order_items(id)
ON DELETE CASCADE;

-- Delivery item - truck trip relationship
ALTER TABLE delivery_items
ADD CONSTRAINT fk_delivery_items_truck_trip
FOREIGN KEY (truck_trip_id) REFERENCES truck_trips(id)
ON DELETE RESTRICT;

-- OrderStatusHistory - Order relation

ALTER TABLE order_status_history
ADD CONSTRAINT fk_order_status_history_order
FOREIGN KEY (order_id) REFERENCES orders(id)
ON DELETE CASCADE;

-- OrderStatusHistory - User relation

ALTER TABLE order_status_history
ADD CONSTRAINT fk_order_status_history_changed_by
FOREIGN KEY (changed_by) REFERENCES users(id)
ON DELETE SET NULL;
