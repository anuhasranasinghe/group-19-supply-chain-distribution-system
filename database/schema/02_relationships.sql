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