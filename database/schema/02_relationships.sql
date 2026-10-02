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
ADD CONTRAINT fk_notifications_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE