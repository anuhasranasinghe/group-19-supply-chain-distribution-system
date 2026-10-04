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